import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- Include clear examples that demonstrate the pattern
- Show diverse but relevant examples
- Maintain consistency in format
- Keep examples concise but informative

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

Meta prompting guides the AI to think about prompt optimization itself. The prompt should:
- Ask the model to analyze what makes prompts effective
- Include self-referential prompt improvement
- Strategic breakdown of the task requirements
- Encourage optimization thinking

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

  "few-shot": `You are a prompt engineering expert. Transform this system prompt to be optimized for few-shot learning.

System prompts for few-shot learning should:
- Define the role as an example-based learner
- Add instructions to recognize patterns from examples
- Include guidance on applying patterns to new cases
- Emphasize consistency with provided examples
- Encourage learning from context

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
  "explanation": "<brief explanation of changes made for few-shot learning>"
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
- Define role as an exploratory reasoning agent
- Add multi-path exploration instructions
- Include evaluation and selection guidance
- Encourage systematic approach comparison
- Emphasize comprehensive analysis

Return your response in JSON format:
{
  "refined_prompt": "<the improved system prompt>",
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, strategy, isSystemPrompt = false } = body;
    
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
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }
    
    const result = JSON.parse(content);
    
    return NextResponse.json({
      original: prompt,
      refined: result.refined_prompt,
      explanation: result.explanation,
      strategy,
      isSystemPrompt,
    });
  } catch (error) {
    console.error("Error refining prompt:", error);
    return NextResponse.json(
      { error: "Failed to refine prompt" },
      { status: 500 }
    );
  }
}

