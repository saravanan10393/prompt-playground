import { createClient, type Client, type ResultSet, type InStatement } from "@libsql/client";

// Lazy initialization - client is created only when needed
let tursoClient: Client | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Get or create the database client
function getRawClient(): Client {
  try {
    if (!tursoClient) {
      if (!process.env.prompt_playground_TURSO_DATABASE_URL) {
        console.error("Database configuration error: TURSO_DATABASE_URL environment variable is not set");
        throw new Error("Database configuration error: TURSO_DATABASE_URL is not set");
      }

      tursoClient = createClient({
        url: process.env.prompt_playground_TURSO_DATABASE_URL,
        authToken: process.env.prompt_playground_TURSO_AUTH_TOKEN,
      });
    }
    return tursoClient;
  } catch (error) {
    console.error(`Failed to create database client: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Database client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Initialize database schema (called lazily on first query)
async function initializeDatabase() {
  // If already initialized or initialization is in progress, return
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const client = getRawClient();

      // Users table
      await client.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Games table
      await client.execute(`
        CREATE TABLE IF NOT EXISTS games (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          creator_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creator_id) REFERENCES users(id)
        );
      `);

      // Scenarios table
      await client.execute(`
        CREATE TABLE IF NOT EXISTS scenarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        );
      `);

      // Submissions table
      await client.execute(`
        CREATE TABLE IF NOT EXISTS submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          scenario_id INTEGER NOT NULL,
          prompt TEXT NOT NULL,
          score INTEGER NOT NULL,
          feedback TEXT NOT NULL,
          refined_prompt TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
          UNIQUE(game_id, user_id, scenario_id)
        );
      `);

      // Create indexes for better performance
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_scenarios_game ON scenarios(game_id);
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_game_user ON submissions(game_id, user_id);
      `);
      await client.execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_game ON submissions(game_id);
      `);

      isInitialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      initializationPromise = null; // Allow retry on next attempt
      throw error;
    }
  })();

  return initializationPromise;
}

// Auto-initializing database client wrapper
// This wrapper automatically ensures the database is initialized before any query
const db = {
  async execute(stmt: InStatement): Promise<ResultSet> {
    try {
      if (!isInitialized) {
        await initializeDatabase();
      }
      return await getRawClient().execute(stmt);
    } catch (error) {
      console.error(`Database execute failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Database query functions
export const queries = {
  // Users
  async getUserByToken(token: string) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM users WHERE token = ?",
        args: [token],
      });
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Failed to get user by token: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to retrieve user by token`);
    }
  },

  async createUser(token: string, name: string) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO users (token, name) VALUES (?, ?)",
        args: [token, name],
      });
      return result;
    } catch (error) {
      console.error(`Failed to create user with name "${name}": ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to create user`);
    }
  },

  // Games
  async getAllGames() {
    try {
      const result = await db.execute(`
        SELECT g.*, u.name as creator_name 
        FROM games g 
        JOIN users u ON g.creator_id = u.id 
        WHERE g.status = 'active' 
        ORDER BY g.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error(`Failed to get all games: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to retrieve games list`);
    }
  },

  async getGameById(id: number) {
    try {
      const result = await db.execute({
        sql: "SELECT g.*, u.name as creator_name FROM games g JOIN users u ON g.creator_id = u.id WHERE g.id = ?",
        args: [id],
      });
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Failed to get game by id ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to retrieve game with id ${id}`);
    }
  },

  async createGame(creatorId: number, title: string) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO games (creator_id, title) VALUES (?, ?)",
        args: [creatorId, title],
      });
      return result;
    } catch (error) {
      console.error(`Failed to create game "${title}" for creator ${creatorId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to create game`);
    }
  },

  // Scenarios
  async getScenariosByGameId(gameId: number) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM scenarios WHERE game_id = ? ORDER BY order_index ASC",
        args: [gameId],
      });
      return result.rows;
    } catch (error) {
      console.error(`Failed to get scenarios for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to retrieve scenarios for game ${gameId}`);
    }
  },

  async createScenario(gameId: number, title: string, description: string, orderIndex: number) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO scenarios (game_id, title, description, order_index) VALUES (?, ?, ?, ?)",
        args: [gameId, title, description, orderIndex],
      });
      return result;
    } catch (error) {
      console.error(`Failed to create scenario "${title}" for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to create scenario`);
    }
  },

  // Submissions
  async createSubmission(gameId: number, userId: number, scenarioId: number, prompt: string, score: number, feedback: string, refinedPrompt?: string) {
    try {
      const result = await db.execute({
        sql: "INSERT INTO submissions (game_id, user_id, scenario_id, prompt, score, feedback, refined_prompt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [gameId, userId, scenarioId, prompt, score, feedback, refinedPrompt || null],
      });
      return result;
    } catch (error) {
      console.error(`Failed to create submission for game ${gameId}, user ${userId}, scenario ${scenarioId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to create submission`);
    }
  },

  async getSubmissionsByGameAndUser(gameId: number, userId: number) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM submissions WHERE game_id = ? AND user_id = ?",
        args: [gameId, userId],
      });
      return result.rows;
    } catch (error) {
      console.error(`Failed to get submissions for game ${gameId} and user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to retrieve submissions`);
    }
  },

  async getLeaderboard(gameId: number) {
    try {
      // First, get the total number of scenarios for this game
      const scenarioCountResult = await db.execute({
        sql: "SELECT COUNT(*) as count FROM scenarios WHERE game_id = ?",
        args: [gameId],
      });
      const totalScenarios = scenarioCountResult.rows[0]?.count || 0;
      
      // Then get the leaderboard for users who completed all scenarios
      const result = await db.execute({
        sql: `
          SELECT 
            u.name,
            u.token,
            SUM(s.score) as total_score,
            COUNT(DISTINCT s.scenario_id) as scenarios_completed,
            MAX(s.created_at) as last_submission
          FROM submissions s
          JOIN users u ON s.user_id = u.id
          WHERE s.game_id = ?
          GROUP BY s.user_id
          HAVING scenarios_completed = ?
          ORDER BY total_score DESC, last_submission ASC
        `,
        args: [gameId, totalScenarios],
      });
      return result.rows;
    } catch (error) {
      console.error(`Failed to get leaderboard for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to retrieve leaderboard`);
    }
  },

  async getUserSubmissionExists(gameId: number, userId: number) {
    try {
      const result = await db.execute({
        sql: "SELECT COUNT(*) as count FROM submissions WHERE game_id = ? AND user_id = ?",
        args: [gameId, userId],
      });
      return result.rows[0]?.count || 0;
    } catch (error) {
      console.error(`Failed to check if user submission exists for game ${gameId} and user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to check submission existence`);
    }
  },

  async deleteUserSubmissions(gameId: number, userId: number) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM submissions WHERE game_id = ? AND user_id = ?",
        args: [gameId, userId],
      });
      return result;
    } catch (error) {
      console.error(`Failed to delete submissions for game ${gameId} and user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to delete submissions`);
    }
  },

  // Game edit/delete queries

  async hasGameSubmissions(gameId: number) {
    try {
      const result = await db.execute({
        sql: "SELECT COUNT(*) as count FROM submissions WHERE game_id = ?",
        args: [gameId],
      });
      return result.rows[0]?.count || 0;
    } catch (error) {
      console.error(`Failed to check submissions for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to check game submissions`);
    }
  },

  async updateGame(id: number, title: string) {
    try {
      const result = await db.execute({
        sql: "UPDATE games SET title = ? WHERE id = ?",
        args: [title, id],
      });
      return result;
    } catch (error) {
      console.error(`Failed to update game ${id} with title "${title}": ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to update game`);
    }
  },

  async updateScenario(id: number, title: string, description: string, gameId: number) {
    try {
      const result = await db.execute({
        sql: "UPDATE scenarios SET title = ?, description = ? WHERE id = ? AND game_id = ?",
        args: [title, description, id, gameId],
      });
      return result;
    } catch (error) {
      console.error(`Failed to update scenario ${id} for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to update scenario`);
    }
  },

  async deleteGame(id: number) {
    try {
      const result = await db.execute({
        sql: "DELETE FROM games WHERE id = ?",
        args: [id],
      });
      return result;
    } catch (error) {
      console.error(`Failed to delete game ${id}: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to delete game`);
    }
  },

  // User management queries
  async updateUserName(id: number, name: string) {
    try {
      const result = await db.execute({
        sql: "UPDATE users SET name = ? WHERE id = ?",
        args: [name, id],
      });
      return result;
    } catch (error) {
      console.error(`Failed to update user ${id} name to "${name}": ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Database error: Failed to update user name`);
    }
  },
};

// Transaction helper for batch operations
export async function executeTransaction(operations: Array<() => Promise<unknown>>) {
  try {
    const results = [];
    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      try {
        const result = await operation();
        results.push(result);
      } catch (error) {
        console.error(`Transaction failed at operation ${i + 1}/${operations.length}: ${error instanceof Error ? error.message : String(error)}`);
        throw new Error(`Database transaction failed at step ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    return results;
  } catch (error) {
    console.error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Global unhandled promise rejection handler for database operations
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection in database module:', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise,
    });
  });
}