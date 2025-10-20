import { createClient } from "@libsql/client";

// Create Turso client
export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Users table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Games table
    await turso.execute(`
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
    await turso.execute(`
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
    await turso.execute(`
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
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_scenarios_game ON scenarios(game_id);
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_submissions_game_user ON submissions(game_id, user_id);
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_submissions_game ON submissions(game_id);
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Initialize database on module load
initializeDatabase().catch(console.error);

// Database query functions
export const queries = {
  // Users
  async getUserByToken(token: string) {
    const result = await turso.execute({
      sql: "SELECT * FROM users WHERE token = ?",
      args: [token],
    });
    return result.rows[0] || null;
  },

  async createUser(token: string, name: string) {
    const result = await turso.execute({
      sql: "INSERT INTO users (token, name) VALUES (?, ?)",
      args: [token, name],
    });
    return result;
  },

  // Games
  async getAllGames() {
    const result = await turso.execute(`
      SELECT g.*, u.name as creator_name 
      FROM games g 
      JOIN users u ON g.creator_id = u.id 
      WHERE g.status = 'active' 
      ORDER BY g.created_at DESC
    `);
    return result.rows;
  },

  async getGameById(id: number) {
    const result = await turso.execute({
      sql: "SELECT g.*, u.name as creator_name FROM games g JOIN users u ON g.creator_id = u.id WHERE g.id = ?",
      args: [id],
    });
    return result.rows[0] || null;
  },

  async createGame(creatorId: number, title: string) {
    const result = await turso.execute({
      sql: "INSERT INTO games (creator_id, title) VALUES (?, ?)",
      args: [creatorId, title],
    });
    return result;
  },

  // Scenarios
  async getScenariosByGameId(gameId: number) {
    const result = await turso.execute({
      sql: "SELECT * FROM scenarios WHERE game_id = ? ORDER BY order_index ASC",
      args: [gameId],
    });
    return result.rows;
  },

  async createScenario(gameId: number, title: string, description: string, orderIndex: number) {
    const result = await turso.execute({
      sql: "INSERT INTO scenarios (game_id, title, description, order_index) VALUES (?, ?, ?, ?)",
      args: [gameId, title, description, orderIndex],
    });
    return result;
  },

  // Submissions
  async createSubmission(gameId: number, userId: number, scenarioId: number, prompt: string, score: number, feedback: string, refinedPrompt?: string) {
    const result = await turso.execute({
      sql: "INSERT INTO submissions (game_id, user_id, scenario_id, prompt, score, feedback, refined_prompt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [gameId, userId, scenarioId, prompt, score, feedback, refinedPrompt || null],
    });
    return result;
  },

  async getSubmissionsByGameAndUser(gameId: number, userId: number) {
    const result = await turso.execute({
      sql: "SELECT * FROM submissions WHERE game_id = ? AND user_id = ?",
      args: [gameId, userId],
    });
    return result.rows;
  },

  async getLeaderboard(gameId: number) {
    const result = await turso.execute({
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
        HAVING scenarios_completed = 3
        ORDER BY total_score DESC, last_submission ASC
      `,
      args: [gameId],
    });
    return result.rows;
  },

  async getUserSubmissionExists(gameId: number, userId: number) {
    const result = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM submissions WHERE game_id = ? AND user_id = ?",
      args: [gameId, userId],
    });
    return result.rows[0]?.count || 0;
  },

  // Game edit/delete queries
  async getGameByIdAndCreator(id: number, creatorId: number) {
    const result = await turso.execute({
      sql: "SELECT * FROM games WHERE id = ? AND creator_id = ?",
      args: [id, creatorId],
    });
    return result.rows[0] || null;
  },

  async hasGameSubmissions(gameId: number) {
    const result = await turso.execute({
      sql: "SELECT COUNT(*) as count FROM submissions WHERE game_id = ?",
      args: [gameId],
    });
    return result.rows[0]?.count || 0;
  },

  async updateGame(id: number, title: string, creatorId: number) {
    const result = await turso.execute({
      sql: "UPDATE games SET title = ? WHERE id = ? AND creator_id = ?",
      args: [title, id, creatorId],
    });
    return result;
  },

  async updateScenario(id: number, title: string, description: string, gameId: number) {
    const result = await turso.execute({
      sql: "UPDATE scenarios SET title = ?, description = ? WHERE id = ? AND game_id = ?",
      args: [title, description, id, gameId],
    });
    return result;
  },

  async deleteGame(id: number, creatorId: number) {
    const result = await turso.execute({
      sql: "DELETE FROM games WHERE id = ? AND creator_id = ?",
      args: [id, creatorId],
    });
    return result;
  },

  // User management queries
  async updateUserName(id: number, name: string) {
    const result = await turso.execute({
      sql: "UPDATE users SET name = ? WHERE id = ?",
      args: [name, id],
    });
    return result;
  },
};

// Transaction helper for batch operations
export async function executeTransaction(operations: Array<() => Promise<any>>) {
  try {
    const results = [];
    for (const operation of operations) {
      const result = await operation();
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}