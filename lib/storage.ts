/**
 * Client-side local storage utilities for game results
 */

export interface GameResult {
  gameId: number;
  scenarioScores: {
    scenarioId: number;
    score: number;
    feedback: string;
  }[];
  totalScore: number;
  timestamp: string;
}

const STORAGE_KEY = "prompt_playground_results";

/**
 * Save game results to local storage
 */
export function saveGameResults(gameId: number, results: Omit<GameResult, "gameId">): void {
  try {
    const allResults = getAllUserResults();
    const newResult: GameResult = {
      gameId,
      ...results,
    };
    
    // Replace existing result for this game or add new one
    const filteredResults = allResults.filter(r => r.gameId !== gameId);
    filteredResults.push(newResult);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResults));
  } catch (error) {
    console.error("Error saving game results:", error);
  }
}

/**
 * Get results for a specific game
 */
export function getGameResults(gameId: number): GameResult | null {
  try {
    const allResults = getAllUserResults();
    return allResults.find(r => r.gameId === gameId) || null;
  } catch (error) {
    console.error("Error getting game results:", error);
    return null;
  }
}

/**
 * Get all user results
 */
export function getAllUserResults(): GameResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting all results:", error);
    return [];
  }
}

/**
 * Clear all results (for testing/debugging)
 */
export function clearAllResults(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing results:", error);
  }
}

