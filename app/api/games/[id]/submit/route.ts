import { NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { getOpenAIClient } from "@/lib/openai";
import { logger } from "@/lib/logger";

interface SubmissionData {
  scenarioId: number;
  prompt: string;
}

interface EvaluationResult {
  scenarioId: number;
  prompt: string;
  score: number;
  feedback: string;
  refinedPrompt: string;
}

async function evaluatePrompt(
  scenarioTitle: string,
  scenarioDescription: string,
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
  "score": <number between 1-10>,
  "feedback": "<detailed actionable suggestions to improve the prompt>",
  "refinedPrompt": "<an improved version of the user's prompt that demonstrates best practices>"
}

Be constructive and specific in your feedback. Focus on what could be improved. The refined prompt should be a complete, ready-to-use example that shows how to write an effective prompt for this scenario.`;

    const userMessage = `Scenario Title: ${scenarioTitle}

Scenario Description: ${scenarioDescription}

User's Prompt to Evaluate:
${userPrompt}

Please evaluate this prompt and provide a score (1-10) and detailed feedback.`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    
    return {
      score: Math.max(1, Math.min(10, parseInt(result.score))),
      feedback: result.feedback || "No feedback provided",
      refinedPrompt: result.refinedPrompt || "No refined prompt provided",
    };
  } catch (error) {
    console.error("Error evaluating prompt:", error);
    // Return a default response on error
    return {
      score: 5,
      feedback: "Error evaluating prompt. Please try again.",
      refinedPrompt: "Unable to generate refined prompt due to error.",
    };
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id } = await params;
  logger.apiRequest("POST", `/api/games/${id}/submit`);
  
  try {
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }
    
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { submissions } = body as { submissions: SubmissionData[] };
    
    if (!submissions || !Array.isArray(submissions)) {
      return NextResponse.json(
        { error: "Invalid request. Submissions must be an array." },
        { status: 400 }
      );
    }
    
    // Get game and scenarios
    const game = await queries.getGameById(gameId);
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    const scenarios = await queries.getScenariosByGameId(gameId) as unknown as Array<{
      id: number;
      title: string;
      description: string;
      order_index: number;
    }>;
    
    if (scenarios.length < 1 || scenarios.length > 10) {
      return NextResponse.json(
        { error: "Invalid game configuration" },
        { status: 500 }
      );
    }
    
    // Validate that submission count matches scenario count
    if (submissions.length !== scenarios.length) {
      return NextResponse.json(
        { error: `Invalid request. Must submit ${scenarios.length} prompts for this game.` },
        { status: 400 }
      );
    }
    
    // Validate that all scenario IDs match
    const scenarioIds = scenarios.map(s => s.id).sort();
    const submissionIds = submissions.map(s => s.scenarioId).sort();
    
    if (JSON.stringify(scenarioIds) !== JSON.stringify(submissionIds)) {
      return NextResponse.json(
        { error: "Invalid scenario IDs in submission" },
        { status: 400 }
      );
    }
    
    // Evaluate all prompts
    const evaluations: EvaluationResult[] = [];
    
    for (const submission of submissions) {
      const scenario = scenarios.find(s => s.id === submission.scenarioId);
      if (!scenario) continue;
      
      const evaluation = await evaluatePrompt(
        scenario.title,
        scenario.description,
        submission.prompt
      );
      
      evaluations.push({
        scenarioId: submission.scenarioId,
        prompt: submission.prompt,
        score: evaluation.score,
        feedback: evaluation.feedback,
        refinedPrompt: evaluation.refinedPrompt,
      });
    }
    
    // Delete previous submissions if they exist (to keep only the latest)
    await queries.deleteUserSubmissions(gameId, user.id);
    
    // Save all submissions
    for (const evaluation of evaluations) {
      await queries.createSubmission(
        gameId,
        user.id,
        evaluation.scenarioId,
        evaluation.prompt,
        evaluation.score,
        evaluation.feedback,
        evaluation.refinedPrompt
      );
    }
    
    // Calculate total score
    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    
    // Get updated leaderboard
    const leaderboard = await queries.getLeaderboard(gameId);
    
    logger.apiResponse("POST", `/api/games/${id}/submit`, 200, Date.now() - startTime, { 
      gameId, 
      userId: user.id, 
      totalScore,
      submissionCount: evaluations.length 
    });
    
    return NextResponse.json({
      evaluations,
      totalScore,
      leaderboard,
    });
  } catch (error) {
    logger.apiError("POST", `/api/games/${id}/submit`, error);
    return NextResponse.json(
      { error: "Failed to submit prompts" },
      { status: 500 }
    );
  }
}

