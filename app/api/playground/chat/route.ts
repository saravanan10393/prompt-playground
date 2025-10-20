import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

const VALID_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "o1-mini",
  "o3-mini",
] as const;

export async function POST(request: Request) {
  const startTime = Date.now();
  logger.apiRequest("POST", "/api/playground/chat");
  
  try {
    const body = await request.json();
    const { messages, model, temperature, systemPrompt } = body;
    
    logger.debug("Chat request", { model, temperature, messageCount: messages?.length });
    
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages", { status: 400 });
    }
    
    // Validate model
    const selectedModel = model || "gpt-4o";
    if (!VALID_MODELS.includes(selectedModel)) {
      return new Response("Invalid model", { status: 400 });
    }
    
    // Validate temperature
    const temp = typeof temperature === "number" ? temperature : 0.7;
    const clampedTemp = Math.max(0, Math.min(2, temp));
    
    // Build messages array with optional system prompt
    const finalMessages = [...messages];
    
    // For reasoning models (o1, o3), system prompts are handled differently
    const isReasoningModel = selectedModel.startsWith("o1") || selectedModel.startsWith("o3");
    
    if (systemPrompt && !isReasoningModel) {
      finalMessages.unshift({
        role: "system",
        content: systemPrompt,
      });
    }
    
    // For reasoning models, prepend system prompt as user message if provided
    if (systemPrompt && isReasoningModel && finalMessages[0]?.role !== "system") {
      finalMessages[0] = {
        role: "user",
        content: `System Instructions: ${systemPrompt}\n\nUser Query: ${finalMessages[0]?.content || ""}`,
      };
    }
    
    const result = streamText({
      model: openai(selectedModel),
      messages: finalMessages,
      temperature: isReasoningModel ? undefined : clampedTemp, // Reasoning models don't support temperature
    });
    
    logger.info("Chat stream initiated", { model: selectedModel, duration: Date.now() - startTime });
    
    return result.toTextStreamResponse();
  } catch (error) {
    logger.apiError("POST", "/api/playground/chat", error);
    return new Response("Internal server error", { status: 500 });
  }
}

