import { NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id } = await params;
  logger.apiRequest("GET", `/api/games/${id}/results`);
  
  try {
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }
    
    const user = await getUserFromRequest(request);
    
    // Get leaderboard (all participants who completed all 3 scenarios)
    const leaderboard = await queries.getLeaderboard(gameId);
    
    // If user is logged in, get their specific submissions
    let userSubmissions = null;
    if (user) {
      userSubmissions = await queries.getSubmissionsByGameAndUser(gameId, user.id);
    }
    
    logger.apiResponse("GET", `/api/games/${id}/results`, 200, Date.now() - startTime, { 
      gameId, 
      leaderboardCount: leaderboard.length,
      hasUserSubmissions: !!userSubmissions 
    });
    
    return NextResponse.json({
      leaderboard,
      userSubmissions,
    });
  } catch (error) {
    logger.apiError("GET", `/api/games/${id}/results`, error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

