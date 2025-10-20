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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Games</h1>
        <Link href="/game-create">
          <Button>Create New Game</Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">No games available yet.</p>
          <Link href="/game-create">
            <Button>Create the First Game</Button>
          </Link>
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
  );
}

