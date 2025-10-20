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
    
    const game = await queries.getGameById(gameId);
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }
    
    const scenarios = await queries.getScenariosByGameId(gameId);
    
    return NextResponse.json({
      game: {
        ...game,
        scenarios,
      },
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify user is the creator
    const game = await queries.getGameByIdAndCreator(gameId, user.id);
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { title, scenarios } = body;
    
    if (!title || !scenarios || !Array.isArray(scenarios) || scenarios.length !== 3) {
      return NextResponse.json(
        { error: "Invalid request. Title and 3 scenarios required." },
        { status: 400 }
      );
    }
    
    // Validate scenarios
    for (const scenario of scenarios) {
      if (!scenario.title || !scenario.description) {
        return NextResponse.json(
          { error: "Each scenario must have a title and description" },
          { status: 400 }
        );
      }
    }
    
    // Update game and scenarios
    // Update game title
    await queries.updateGame(gameId, title, user.id);
    
    // Update scenarios
    for (const scenario of scenarios) {
      await queries.updateScenario(
        scenario.id,
        scenario.title,
        scenario.description,
        gameId
      );
    }
    
    // Fetch the updated game with scenarios
    const updatedGame = await queries.getGameById(gameId);
    const gameScenarios = await queries.getScenariosByGameId(gameId);
    
    return NextResponse.json({
      game: {
        ...updatedGame,
        scenarios: gameScenarios,
      },
    });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify user is the creator
    const game = await queries.getGameByIdAndCreator(gameId, user.id);
    
    if (!game) {
      return NextResponse.json(
        { error: "Game not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }
    
    // Delete the game (CASCADE will handle scenarios and submissions)
    await queries.deleteGame(gameId, user.id);
    
    return NextResponse.json({
      message: "Game deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}

