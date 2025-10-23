import { NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";

// GET all games
export async function GET() {
  const startTime = Date.now();
  logger.apiRequest("GET", "/api/games");
  
  try {
    const games = await queries.getAllGames();
    logger.apiResponse("GET", "/api/games", 200, Date.now() - startTime, { count: games.length });
    return NextResponse.json({ games });
  } catch (error) {
    logger.apiError("GET", "/api/games", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST create new game
export async function POST(request: Request) {
  const startTime = Date.now();
  logger.apiRequest("POST", "/api/games");
  
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      logger.warn("Unauthorized game creation attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, scenarios } = body;
    
    logger.debug("Creating game", { userId: user.id, title });
    
    if (!title || !scenarios || !Array.isArray(scenarios) || scenarios.length < 1 || scenarios.length > 10) {
      return NextResponse.json(
        { error: "Invalid request. Title and 1-10 scenarios required." },
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
    
    logger.apiResponse("POST", "/api/games", 200, Date.now() - startTime, { gameId, scenarioCount: scenarios.length });
    
    return NextResponse.json({
      game: {
        ...game,
        scenarios: gameScenarios,
      },
    });
  } catch (error) {
    logger.apiError("POST", "/api/games", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}

