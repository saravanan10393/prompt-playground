import { NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    return NextResponse.json({
      leaderboard,
      userSubmissions,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

