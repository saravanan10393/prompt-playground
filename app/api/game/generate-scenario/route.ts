import { NextResponse } from "next/server";
import { callLLMWithRetry } from "@/lib/openai";
import { withRateLimit } from "@/lib/middleware/rate-limit-middleware";

async function generateScenarioHandler(request: Request) {
  try {
    const { action, complexity = "medium", theme = "Any Theme" } = await request.json();
    
    if (action === "generate") {
      // Generate a random real-world scenario for prompt engineering
      const response = await callLLMWithRetry({
        messages: [
          {
            role: "system",
            content: `You are an expert in creating realistic, challenging scenarios for prompt writing practice.

Think step by step and generate a real world task that can be accomplished only by a prompt alone.

Theme: ${theme === "Any Theme" ? "Any category - be creative and diverse" : theme}
Complexity: ${complexity}

Step 1: Generate a task and description that can be accomplished only by a prompt alone.
- If theme is "Any Theme", choose from any category
- If theme is specific, focus on that category
- If theme is custom, use the provided custom theme

Examples of good tasks:
- Task: Product Review Summarizer
  Description: Write a prompt that can be used to summarize given product reviews in a single step.

- Task: Weekend Travel Planner
  Description: Write a prompt that can be used to plan a weekend trip to a new city in a single step.

Step 2: Critique the task and description
- Is this task achievable by prompting an LLM alone?
- Does it require external tools or RAG? If yes, modify it.
- Ensure it matches the complexity level: ${complexity}

Step 3: Return the task and description in this format:
<result>{"taskName": "TASK NAME", "description": "DESCRIPTION"}</result>`
          },
          {
            role: "user",
            content: `Generate a ${complexity} complexity task with description for theme: ${theme}`
          }
        ],
        temperature: 1,
      });
      
      if (!response) {
        throw new Error("Failed to generate scenario");
      }
      console.log("response from generate-scenario ", response);
      // Extract content from <result></result> tags
      const resultMatch = response.match(/<result>([\s\S]*?)<\/result>/);
      if (!resultMatch) {
        throw new Error("No result tags found in response");
      } 
      const resultContent = resultMatch[1].trim();
      console.log("response from generate-scenario ", resultContent);
      const { taskName, description } = JSON.parse(resultContent);
      
      return NextResponse.json({ taskName, description });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error generating scenario:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userMessage = "Failed to generate scenario. Please try again.";

    // Handle specific error types
    if (errorMessage.includes("API key") || errorMessage.includes("api key")) {
      userMessage = "API configuration error. Please contact support.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
    } else if (errorMessage.includes("timeout")) {
      userMessage = "Request timed out. Please try again.";
    } else if (errorMessage.includes("No result tags found")) {
      userMessage = "Failed to parse AI response. Please try again.";
    } else if (errorMessage.includes("JSON")) {
      userMessage = "Invalid response format from AI. Please try again.";
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
export const POST = withRateLimit(generateScenarioHandler, {
  maxRequests: 50,
  windowMs: 60000,
  requireAuth: true,
  blockMessage: "Scenario generation rate limit exceeded. Please wait before generating more scenarios.",
});
