import { getRandomizedModels, MODEL_POOL } from "@/lib/openai";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/middleware/rate-limit-middleware";

export const maxDuration = 30;

async function chatHandler(request: Request) {
  const startTime = Date.now();
  console.log("[CHAT] Route called");

  try {
    console.log("[CHAT] Parsing request body");
    const body = await request.json();
    const { messages, temperature, systemPrompt } = body;

    console.log("[CHAT] Request parsed, messages count:", messages?.length);
    logger.apiRequest("POST", "/api/playground/chat");
    logger.debug("Chat request", { temperature, messageCount: messages?.length });

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({
        error: "Invalid messages format. Please provide an array of messages."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate temperature
    const temp = typeof temperature === "number" ? temperature : 0.7;
    const clampedTemp = Math.max(0, Math.min(2, temp));

    // Build messages array with optional system prompt
    const finalMessages = [...messages];

    // Add system prompt if provided
    if (systemPrompt) {
      finalMessages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }

    logger.debug("Sending to AI", {
      modelPool: MODEL_POOL,
      messageCount: finalMessages.length,
      systemPromptProvided: !!systemPrompt,
      temperature: clampedTemp
    });

    console.log("[CHAT] Importing OpenAI");
    // Import OpenAI
    const { default: OpenAI } = await import("openai");
    console.log("[CHAT] OpenAI imported");

    console.log("[CHAT] Creating OpenAI client, API key exists:", !!process.env.OPENAI_API_KEY);
    // Create OpenAI client for streaming
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Prompt Playground",
      },
    });
    console.log("[CHAT] OpenAI client created");

    // Create a ReadableStream with retry logic
    const encoder = new TextEncoder();
    const maxRetries = MODEL_POOL.length;

    const readable = new ReadableStream({
      async start(controller) {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const { primary, backups } = getRandomizedModels();

            console.log(`[CHAT] Attempt ${attempt + 1}/${maxRetries} using model:`, primary);

            // Send retry message to user (except first attempt)
            if (attempt > 0) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              await new Promise(resolve => setTimeout(resolve, delay));

              const retryMsg = `\n\n⏳ Retrying with a different model (attempt ${attempt + 1}/${maxRetries})...\n\n`;
              controller.enqueue(encoder.encode(retryMsg));
            }

            // @ts-expect-error - OpenRouter-specific 'models' parameter not in OpenAI types
            const stream = await openai.chat.completions.create({
              model: primary,
              messages: finalMessages,
              temperature: clampedTemp,
              stream: true,
              models: backups,
            });

            logger.info("Chat stream initiated", { model: primary, attempt: attempt + 1, duration: Date.now() - startTime });

            let hasContent = false;
            let contentLength = 0;

            // Stream the response
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                hasContent = true;
                contentLength += content.length;
                controller.enqueue(encoder.encode(content));
              }
            }

            // Check if we got any content
            if (!hasContent || contentLength === 0) {
              throw new Error(`Empty response from model: ${primary}`);
            }

            // Success! Close the stream
            controller.close();
            logger.info("Stream completed successfully", { model: primary, contentLength, duration: Date.now() - startTime });
            return;

          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.warn(`[CHAT] Attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);
            logger.apiError(`Stream attempt ${attempt + 1} failed`, "/api/playground/chat", error);

            // Continue to next retry if not the last attempt
            if (attempt < maxRetries - 1) {
              continue;
            }
          }
        }

        // All retries exhausted - send error message in stream
        const errorMsg = `\n\n❌ Unable to get response after ${maxRetries} attempts. Please try again later.\n\nLast error: ${lastError?.message || 'Unknown error'}`;
        controller.enqueue(encoder.encode(errorMsg));
        controller.close();

        logger.apiError("All stream retries exhausted", "/api/playground/chat", lastError);
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logger.apiError("POST", "/api/playground/chat", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userMessage = "Failed to generate response. Please try again.";

    // Handle specific error types
    if (errorMessage.includes("API key") || errorMessage.includes("api key")) {
      userMessage = "API configuration error. Please contact support.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
    } else if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
      userMessage = "Request timed out. Please try again.";
    } else if (errorMessage.includes("network") || errorMessage.includes("ECONNREFUSED")) {
      userMessage = "Network error. Please check your connection and try again.";
    } else if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
      userMessage = "Authentication failed. Please check API configuration.";
    }

    return new Response(JSON.stringify({
      error: userMessage,
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Apply rate limiting: 50 requests per 10 hours, auth required
// CSRF validation handled by middleware.ts automatically
export const POST = withRateLimit(chatHandler, {
  maxRequests: 50,
  windowMs: 36000000,
  requireAuth: true,
  blockMessage: "Chat rate limit exceeded. Please wait before sending more messages.",
});

