import { NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// GET all games
export async function GET() {
  try {
    const games = await queries.getAllGames();
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST create new game
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
      if (!scenario.title) {
        return NextResponse.json(
          { error: "Each scenario must have a title" },
          { status: 400 }
        );
      }
    }
    
    // Create game and scenarios in a transaction
    const gameResult = await queries.createGame(user.id, title);
    const gameId = Number(gameResult.lastInsertRowid);
    
    // Create scenarios
    for (const [index, scenario] of scenarios.entries()) {
      await queries.createScenario(
        gameId,
        scenario.title,
        scenario.description,
        index
      );
    }
    
    // Fetch the created game with scenarios
    const game = await queries.getGameById(gameId);
    const gameScenarios = await queries.getScenariosByGameId(gameId);
    
    return NextResponse.json({
      game: {
        ...game,
        scenarios: gameScenarios,
      },
    });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}

