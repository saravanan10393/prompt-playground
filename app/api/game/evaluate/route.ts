import { NextResponse } from "next/server";
import { callLLMWithRetry } from "@/lib/openai";
import { withRateLimit } from "@/lib/middleware/rate-limit-middleware";

async function evaluatePrompt(
  scenario: string,
  userPrompt: string
): Promise<{ score: number; feedback: string; refinedPrompt: string }> {
  try {
    const systemPrompt = `You are an expert prompt engineering evaluator. Your task is to evaluate how well a user's prompt addresses a given scenario.

Evaluate the prompt based on:
1. Clarity and specificity
2. Relevance to the scenario
3. Likelihood of producing good results from an LLM
4. Proper instructions and structure

Additionally, provide a "refinedPrompt" field with an improved version of the user's prompt that demonstrates best practices for the given scenario.

Provide your response in the following JSON format:
{
  "score": <number between 1.0-10>,
  "feedback": "<detailed actionable suggestions to improve the prompt>",
  "refinedPrompt": "<an improved version of the user's prompt that demonstrates best practices>"
}

Be constructive and specific in your feedback. Focus on what could be improved. The refined prompt should be a complete, ready-to-use example that shows how to write an effective prompt for this scenario.`;

    const userMessage = `Scenario: ${scenario}

User's Prompt to Evaluate:
${userPrompt}

Please evaluate this prompt and provide a score (1-10) and detailed feedback.`;

    const content = await callLLMWithRetry({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      responseFormat: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(content);
    
    return {
      score: Math.max(1, Math.min(10, parseInt(result.score))),
      feedback: result.feedback || "No feedback provided",
      refinedPrompt: result.refinedPrompt || "No refined prompt provided",
    };
  } catch (error) {
    console.error("Error evaluating prompt:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let feedback = "Error evaluating prompt. Please try again.";

    // Handle specific error types
    if (errorMessage.includes("API key") || errorMessage.includes("api key")) {
      feedback = "API configuration error. Please contact support.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      feedback = "Rate limit exceeded. Please wait and try again.";
    } else if (errorMessage.includes("timeout")) {
      feedback = "Request timed out. Please try again.";
    }

    // Return a default response on error
    return {
      score: 5,
      feedback,
      refinedPrompt: "Unable to generate refined prompt due to error.",
    };
  }
}

async function evaluateHandler(request: Request) {
  try {
    const { scenario, prompt } = await request.json();
    
    if (!scenario || !prompt) {
      return NextResponse.json(
        { error: "Scenario and prompt are required" },
        { status: 400 }
      );
    }

    const evaluation = await evaluatePrompt(scenario, prompt);
    
    return NextResponse.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
      refinedPrompt: evaluation.refinedPrompt,
    });
  } catch (error) {
    console.error("Error evaluating prompt:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userMessage = "Failed to evaluate prompt. Please try again.";

    // Handle specific error types
    if (errorMessage.includes("API key") || errorMessage.includes("api key")) {
      userMessage = "API configuration error. Please contact support.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
    } else if (errorMessage.includes("timeout")) {
      userMessage = "Request timed out. Please try again.";
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 50 requests per minute, auth required
export const POST = withRateLimit(evaluateHandler, {
  maxRequests: 50,
  windowMs: 60000,
  requireAuth: true,
  blockMessage: "Evaluation rate limit exceeded. Please wait before evaluating more prompts.",
});
