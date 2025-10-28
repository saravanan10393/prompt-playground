import { neon } from '@neondatabase/serverless';

// Lazy initialization - client is created only when needed
let neonClient: ReturnType<typeof neon> | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Get or create the database client
function getRawClient() {
  try {
    if (!neonClient) {
      if (!process.env.prompt_playground_DATABASE_URL) {
        console.error("Database configuration error: DATABASE_URL environment variable is not set");
        throw new Error("Database configuration error: DATABASE_URL is not set");
      }

      neonClient = neon(process.env.prompt_playground_DATABASE_URL);
    }
    return neonClient;
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
      const sql = getRawClient();

      // Users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          token TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Games table
      await sql`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          creator_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (creator_id) REFERENCES users(id)
        );
      `;

      // Scenarios table
      await sql`
        CREATE TABLE IF NOT EXISTS scenarios (
          id SERIAL PRIMARY KEY,
          game_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        );
      `;

      // Submissions table
      await sql`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          game_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          scenario_id INTEGER NOT NULL,
          prompt TEXT NOT NULL,
          score INTEGER NOT NULL,
          feedback TEXT NOT NULL,
          refined_prompt TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
          UNIQUE(game_id, user_id, scenario_id)
        );
      `;

      // API Rate Limits table
      await sql`
        CREATE TABLE IF NOT EXISTS api_rate_limits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          endpoint TEXT NOT NULL,
          request_count INTEGER DEFAULT 1,
          window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, endpoint)
        );
      `;

      // Create indexes for better performance
      await sql`CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_scenarios_game ON scenarios(game_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_game_user ON submissions(game_id, user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_game ON submissions(game_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint);`;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(stmt: string | { sql: string; args?: any[] }): Promise<{ rows: any[] }> {
    try {
      if (!isInitialized) {
        await initializeDatabase();
      }

      const sql = getRawClient();

      // Handle different input formats
      if (typeof stmt === 'string') {
        // Direct SQL string - use sql.query() with no params
        const result = await sql.query(stmt, []);
        return { rows: Array.isArray(result) ? result : [] };
      } else {
        // Parameterized query object
        const { sql: query, args = [] } = stmt;

        // For Neon, use sql.query() method with placeholders ($1, $2, etc.)
        const result = await sql.query(query, args);
        return { rows: Array.isArray(result) ? result : [] };
      }
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
        sql: "SELECT * FROM users WHERE token = $1",
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
        sql: "INSERT INTO users (token, name) VALUES ($1, $2) RETURNING id",
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
        sql: "SELECT g.*, u.name as creator_name FROM games g JOIN users u ON g.creator_id = u.id WHERE g.id = $1",
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
        sql: "INSERT INTO games (creator_id, title) VALUES ($1, $2) RETURNING id",
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
        sql: "SELECT * FROM scenarios WHERE game_id = $1 ORDER BY order_index ASC",
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
        sql: "INSERT INTO scenarios (game_id, title, description, order_index) VALUES ($1, $2, $3, $4) RETURNING id",
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
        sql: "INSERT INTO submissions (game_id, user_id, scenario_id, prompt, score, feedback, refined_prompt) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
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
        sql: "SELECT * FROM submissions WHERE game_id = $1 AND user_id = $2",
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
        sql: "SELECT COUNT(*) as count FROM scenarios WHERE game_id = $1",
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
          WHERE s.game_id = $1
          GROUP BY s.user_id
          HAVING scenarios_completed = $2
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
        sql: "SELECT COUNT(*) as count FROM submissions WHERE game_id = $1 AND user_id = $2",
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
        sql: "DELETE FROM submissions WHERE game_id = $1 AND user_id = $2",
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
        sql: "SELECT COUNT(*) as count FROM submissions WHERE game_id = $1",
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
        sql: "UPDATE games SET title = $1 WHERE id = $2",
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
        sql: "UPDATE scenarios SET title = $1, description = $2 WHERE id = $3 AND game_id = $4",
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
        sql: "DELETE FROM games WHERE id = $1",
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
        sql: "UPDATE users SET name = $1 WHERE id = $2",
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