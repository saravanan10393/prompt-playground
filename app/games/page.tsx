"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";

interface Game {
  id: number;
  title: string;
  creator_name: string;
  created_at: string;
  creator_id: number;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchGames();
    fetchCurrentUser();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/games");
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user?.id || null);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleGameUpdated = () => {
    fetchGames(); // Refresh the games list
  };

  const handleGameDeleted = () => {
    fetchGames(); // Refresh the games list
  };

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Games</h1>
            <p className="text-muted-foreground">Challenge your prompt engineering skills</p>
          </div>
          <Link href="/game-create">
            <Button className="shadow-lg shadow-purple-500/30">Create New Game</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-muted-foreground mt-4">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="glass-card max-w-md mx-auto p-12 rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No games available yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to create a game and challenge others!</p>
              <Link href="/game-create">
                <Button size="lg" className="shadow-lg shadow-purple-500/30">Create the First Game</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                creator_name={game.creator_name}
                created_at={game.created_at}
                currentUserId={currentUserId || undefined}
                creatorId={game.creator_id}
                onGameUpdated={handleGameUpdated}
                onGameDeleted={handleGameDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

