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
  logger.apiRequest("GET", `/api/games/${id}/check-editable`);
  
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
    
    // Check if user is the creator
    const game = await queries.getGameByIdAndCreator(gameId, user.id);
    
    if (!game) {
      return NextResponse.json({
        editable: false,
        hasSubmissions: false,
        reason: "You don't have permission to edit this game",
      });
    }
    
    // Check if game has submissions
    const submissionsResult = await queries.hasGameSubmissions(gameId);
    const hasSubmissions = Number(submissionsResult) > 0;
    
    logger.apiResponse("GET", `/api/games/${id}/check-editable`, 200, Date.now() - startTime, { 
      gameId, 
      editable: true, 
      hasSubmissions 
    });
    
    return NextResponse.json({
      editable: true,
      hasSubmissions,
      reason: hasSubmissions 
        ? "Game has submissions. Editing may affect user experience."
        : "Game can be edited safely",
    });
  } catch (error) {
    logger.apiError("GET", `/api/games/${id}/check-editable`, error);
    return NextResponse.json(
      { error: "Failed to check edit permissions" },
      { status: 500 }
    );
  }
}
