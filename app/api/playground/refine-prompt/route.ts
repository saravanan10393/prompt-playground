import { NextResponse } from "next/server";
import { callLLMWithRetry } from "@/lib/openai";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/middleware/rate-limit-middleware";

const STRATEGY_PROMPTS = {
  "zero-shot": `You are a prompt engineering expert. Transform the user's prompt into an effective zero-shot prompt.

Zero-shot prompting means giving clear, direct instructions without examples. The prompt should:
- Be clear and specific about the task
- Include relevant context
- Specify the desired output format
- Use precise language

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt>",
  "explanation": "<brief explanation of changes made>"
}`,

  "few-shot": `You are a prompt engineering expert. Transform the user's prompt into an effective few-shot prompt.

Few-shot prompting means providing 2-3 example input-output pairs to guide the model. The prompt should:
- Include clear examples that demonstrate the pattern for given task
- Show diverse but relevant examples for given task
- Maintain consistency in format for given task
- Keep examples concise but informative for given task

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt with examples>",
  "explanation": "<brief explanation of the examples added>"
}`,

  "chain-of-thought": `You are a prompt engineering expert. Transform the user's prompt into an effective chain-of-thought prompt.

Chain-of-thought prompting encourages step-by-step reasoning. The prompt should:
- Include phrases like "Let's think step by step" or "Let's break this down"
- Structure the task into logical steps
- Encourage intermediate reasoning
- Guide the model through the thought process

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt with CoT structure>",
  "explanation": "<brief explanation of the CoT structure added>"
}`,

  "react": `You are a prompt engineering expert. Transform the user's prompt into an effective ReAct (Reasoning + Acting) prompt.

ReAct prompting combines reasoning with actions. The prompt should:
- Use the Thought-Action-Observation framework
- Encourage the model to reason about what to do
- Specify available actions or tools
- Create a loop of thinking and acting

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt with ReAct structure>",
  "explanation": "<brief explanation of the ReAct framework added>"
}`,

  "reflexion": `You are a prompt engineering expert. Transform the user's prompt into an effective Reflexion prompt.

Reflexion prompting includes self-evaluation and iterative improvement. The prompt should:
- Add reflection prompts after initial responses
- Include error detection and correction steps
- Encourage self-critique and refinement
- Create an iterative improvement cycle

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt with Reflexion structure>",
  "explanation": "<brief explanation of the Reflexion framework added>"
}`,

  "tree-of-thoughts": `You are a prompt engineering expert. Transform the user's prompt into an effective Tree of Thoughts prompt.

Tree of Thoughts prompting explores multiple reasoning paths. The prompt should:
- Generate multiple possible approaches
- Evaluate each path's viability
- Select and expand the most promising branches
- Combine insights from different paths

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt with Tree of Thoughts structure>",
  "explanation": "<brief explanation of the Tree of Thoughts framework added>"
}`,

  "meta-prompting": `You are a prompt engineering expert. Transform the user's prompt into an effective Meta Prompting approach.

Meta prompting assigns the AI a specific role based on the task and structures the interaction. The prompt should:
- Define a clear role that matches the task domain
- Specify the expected input format and structure
- Define the desired output format and structure
- Include task-specific guidelines and constraints

Return your response in JSON format:
{
  "refined_prompt": "<the improved prompt with Meta Prompting structure>",
  "explanation": "<brief explanation of the Meta Prompting framework added>"
}`,
};

const SYSTEM_PROMPT_STRATEGIES = {
  "zero-shot": `You are a prompt engineering expert. Transform this system prompt to be more effective for zero-shot tasks.

System prompts define AI behavior and role. For zero-shot effectiveness, the prompt should:
- Make role definition crystal clear
- Add explicit task expectations
- Include output format guidelines
- Emphasize single-turn response quality
- Be direct and unambiguous

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
  "explanation": "<brief explanation of changes made for zero-shot effectiveness>"
}`,

  "few-shot": `You are a prompt engineering expert. Transform this system prompt to be highly effective for few-shot learning scenarios.

System prompts for few-shot learning should:
- Define the role as an adaptive learner that excels at pattern recognition from limited examples
- Add explicit instructions to carefully analyze the structure, format, and patterns in provided examples
- Include guidance on generalizing learned patterns to new, unseen cases while maintaining consistency
- Emphasize the importance of matching the style, tone, and format demonstrated in examples
- Encourage extracting underlying principles from examples rather than just memorizing them
- Request attention to edge cases and variations that examples might illustrate
- Instruct to maintain consistency across all responses based on the example patterns
- If possible, include the examples in the system prompt itself based on the given task.

The refined system prompt should make the AI explicitly aware that it will receive examples to learn from, and should be structured to maximize learning efficiency from those examples.

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt that prepares the AI to learn effectively from examples>",
  "explanation": "<brief explanation of changes made to optimize for few-shot learning, highlighting how the prompt now better prepares the AI to recognize and apply patterns from examples>"
}`,

  "chain-of-thought": `You are a prompt engineering expert. Transform this system prompt to encourage step-by-step reasoning.

System prompts for chain-of-thought should:
- Instruct AI to think through problems systematically
- Add "explain your reasoning" directive
- Encourage breaking down complex tasks
- Request showing work before conclusions
- Emphasize logical progression

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
  "explanation": "<brief explanation of changes made for chain-of-thought reasoning>"
}`,

  "react": `You are a prompt engineering expert. Transform this system prompt for ReAct pattern.

System prompts for ReAct should:
- Define role as an agent that thinks and acts
- Add Thought-Action-Observation framework instructions
- Encourage explicit reasoning before actions
- Include iterative problem-solving guidance
- Emphasize reflection and learning

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
  "explanation": "<brief explanation of changes made for ReAct pattern>"
}`,

  "reflexion": `You are a prompt engineering expert. Transform this system prompt for Reflexion pattern.

System prompts for Reflexion should:
- Define role as a self-reflecting agent
- Add self-evaluation instructions
- Include error detection and correction guidance
- Encourage iterative improvement cycles
- Emphasize quality assessment and refinement

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
  "explanation": "<brief explanation of changes made for Reflexion pattern>"
}`,

  "tree-of-thoughts": `You are a prompt engineering expert. Transform this system prompt for Tree of Thoughts pattern.

System prompts for Tree of Thoughts should:
- Define role as an exploratory reasoning agent that considers multiple solution paths
- Add instructions to generate multiple alternative approaches
- Include evaluation criteria for comparing different paths
- Encourage systematic exploration of solution space
- Request explicit reasoning about pros/cons of each approach
- Emphasize selecting the best path after thorough analysis

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt that instructs the AI to explore multiple reasoning paths, evaluate each option, and select the best approach>",
  "explanation": "<brief explanation of changes made for Tree of Thoughts pattern>"
}`,

  "meta-prompting": `You are a prompt engineering expert. Transform this system prompt for Meta Prompting pattern.

System prompts for Meta Prompting should:
- Define role as a prompt optimization expert
- Add self-referential analysis instructions
- Include strategic thinking guidance
- Encourage prompt effectiveness evaluation
- Emphasize continuous improvement

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
  "explanation": "<brief explanation of changes made for Meta Prompting pattern>"
}`,
};

async function refinePromptHandler(request: Request) {
  const startTime = Date.now();
  logger.apiRequest("POST", "/api/playground/refine-prompt");
  
  try {
    const body = await request.json();
    const { prompt, strategy, isSystemPrompt = false } = body;
    
    logger.debug("Refine prompt request", { strategy, isSystemPrompt, promptLength: prompt?.length });
    
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }
    
    if (!strategy || !STRATEGY_PROMPTS[strategy as keyof typeof STRATEGY_PROMPTS]) {
      return NextResponse.json(
        { error: "Invalid strategy. Must be one of: zero-shot, few-shot, chain-of-thought, react, reflexion, tree-of-thoughts, meta-prompting" },
        { status: 400 }
      );
    }
    
    // Choose the appropriate strategy prompts based on whether it's a system prompt
    const strategyPrompts = isSystemPrompt ? SYSTEM_PROMPT_STRATEGIES : STRATEGY_PROMPTS;
    const systemPrompt = strategyPrompts[strategy as keyof typeof strategyPrompts];
    
    const userMessage = isSystemPrompt 
      ? `Original system prompt: ${prompt}\n\nPlease refine this system prompt according to the ${strategy} strategy while preserving the core role and intent.`
      : `Original prompt: ${prompt}\n\nPlease refine this prompt according to the ${strategy} strategy while preserving the user's core intent.`;
    
    const content = await callLLMWithRetry({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      responseFormat: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(content);
    
    logger.apiResponse("POST", "/api/playground/refine-prompt", 200, Date.now() - startTime, { 
      strategy, 
      isSystemPrompt,
      refinedLength: result.refined_prompt?.length 
    });
    
    return NextResponse.json({
      original: prompt,
      refined: result.refined_prompt,
      explanation: result.explanation,
      strategy,
      isSystemPrompt,
    });
  } catch (error) {
    logger.apiError("POST", "/api/playground/refine-prompt", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userMessage = "Failed to refine prompt. Please try again.";

    // Handle specific error types
    if (errorMessage.includes("API key") || errorMessage.includes("api key")) {
      userMessage = "API configuration error. Please contact support.";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
    } else if (errorMessage.includes("timeout")) {
      userMessage = "Request timed out. Please try again.";
    } else if (errorMessage.includes("Invalid strategy")) {
      userMessage = "Invalid prompting strategy selected. Please choose a valid strategy.";
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

// Apply rate limiting: 50 requests per 10 hours, auth required
// CSRF validation handled by middleware.ts automatically
export const POST = withRateLimit(refinePromptHandler, {
  maxRequests: 50,
  windowMs: 36000000,
  requireAuth: true,
  blockMessage: "Prompt refinement rate limit exceeded. Please wait before refining more prompts.",
});

