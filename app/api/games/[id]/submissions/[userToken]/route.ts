import { NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; userToken: string }> }
) {
  const startTime = Date.now();
  const { id, userToken } = await params;
  logger.apiRequest("GET", `/api/games/${id}/submissions/${userToken}`);
  
  try {
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }
    
    // Get user by token
    const user = await queries.getUserByToken(userToken);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get user's submissions for this game
    const submissions = await queries.getSubmissionsByGameAndUser(gameId, user.id as number);
    
    // Get game scenarios for context
    const scenarios = await queries.getScenariosByGameId(gameId);
    
    // Get game details
    const game = await queries.getGameById(gameId);
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    // Calculate total score
    const totalScore = submissions.reduce((sum, sub) => sum + (Number(sub.score) || 0), 0);
    
    // Organize submissions by scenario
    const submissionsWithScenarios = submissions.map(submission => {
      const scenario = scenarios.find(s => s.id === submission.scenario_id);
      return {
        ...submission,
        scenario_title: scenario?.title || 'Unknown Scenario',
        scenario_description: scenario?.description || '',
        order_index: scenario?.order_index || 0
      };
    }).sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
    
    logger.apiResponse("GET", `/api/games/${id}/submissions/${userToken}`, 200, Date.now() - startTime, { 
      gameId, 
      userId: user.id,
      submissionCount: submissions.length,
      totalScore 
    });
    
    return NextResponse.json({
      user: {
        name: user.name,
        token: user.token
      },
      game: {
        title: game.title,
        scenarios: scenarios.length
      },
      submissions: submissionsWithScenarios,
      totalScore,
      maxScore: scenarios.length * 10
    });
  } catch (error) {
    logger.apiError("GET", `/api/games/${id}/submissions/${userToken}`, error);
    return NextResponse.json(
      { error: "Failed to fetch user submissions" },
      { status: 500 }
    );
  }
}
