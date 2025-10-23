"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
  order_index: number;
}

interface Game {
  id: number;
  title: string;
  creator_name: string;
  scenarios: Scenario[];
}

interface LeaderboardEntry {
  name: string;
  token: string;
  total_score: number;
  scenarios_completed: number;
  last_submission: string;
}

export default function AdminLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = parseInt(params.id as string);
  
  const [game, setGame] = useState<Game | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [gameId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch game details
      const gameResponse = await fetch(`/api/games/${gameId}`);
      if (!gameResponse.ok) {
        throw new Error("Failed to fetch game details");
      }
      const gameData = await gameResponse.json();
      setGame(gameData.game);
      
      // Fetch leaderboard
      const resultsResponse = await fetch(`/api/games/${gameId}/results`);
      if (!resultsResponse.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const resultsData = await resultsResponse.json();
      setLeaderboard(resultsData.leaderboard || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen relative">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen relative">
          <div className="glass-card p-12 rounded-2xl text-center">
            <p className="text-xl text-foreground mb-4">{error || "Game not found"}</p>
            <Button onClick={() => router.push("/admin")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const maxScore = game.scenarios.length * 10;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        <div className="mb-8">
          <Button 
            onClick={() => router.push("/admin")} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 gradient-text">{game.title}</h1>
          <p className="text-muted-foreground">
            Leaderboard - {game.scenarios.length} {game.scenarios.length === 1 ? 'challenge' : 'challenges'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              Rankings of all participants who completed all {game.scenarios.length} {game.scenarios.length === 1 ? 'challenge' : 'challenges'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No completed submissions yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.token}
                    className="flex items-center justify-between p-4 glass-card rounded-xl hover-lift"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${index < 3 ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-muted text-foreground'}`}>
                        #{index + 1}
                      </div>
                      <span className="font-medium text-foreground">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg gradient-text">{entry.total_score}/{maxScore}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.last_submission).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

