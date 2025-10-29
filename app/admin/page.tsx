"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScenarioForm } from "@/components/scenario-form";
import { GameCard } from "@/components/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Scenario {
  title: string;
  description: string;
}

interface Game {
  id: number;
  title: string;
  creator_name: string;
  created_at: string;
  creator_id: number;
}

export default function AdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameTitle, setGameTitle] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { title: "", description: "" },
  ]);

  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/games");
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoadingGames(false);
    }
  };

  const updateScenario = (index: number, field: "title" | "description", value: string) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = value;
    setScenarios(newScenarios);
  };

  const addScenario = () => {
    if (scenarios.length < 10) {
      setScenarios([...scenarios, { title: "", description: "" }]);
    }
  };

  const deleteScenario = (index: number) => {
    if (scenarios.length > 1) {
      const newScenarios = scenarios.filter((_, i) => i !== index);
      setScenarios(newScenarios);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameTitle.trim()) {
      alert("Please enter a game title");
      return;
    }
    
    for (let i = 0; i < scenarios.length; i++) {
      if (!scenarios[i].title.trim()) {
        alert(`Please enter a title for scenario ${i + 1}`);
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: gameTitle,
          scenarios,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create game");
      }

      await response.json();

      // Reset form
      setGameTitle("");
      setScenarios([{ title: "", description: "" }]);
      
      // Refresh games list
      fetchGames();
      
      alert("Game created successfully!");
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGameUpdated = () => {
    fetchGames();
  };

  const handleGameDeleted = () => {
    fetchGames();
  };

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/8 via-transparent to-slate-800/8 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Game Admin</h1>
            <p className="text-muted-foreground">Create and manage prompt engineering games</p>
          </div>
          <Link href="/playground">
            <Button variant="outline" size="lg">
              Go to Playground
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">Create Game</TabsTrigger>
            <TabsTrigger value="manage">Manage Games</TabsTrigger>
          </TabsList>

          {/* Create Game Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Game</CardTitle>
                <CardDescription>
                  Design scenarios to challenge prompt engineering skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="game-title">
                      Game Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="game-title"
                      placeholder="Enter a descriptive title for your game"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Scenarios</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Create scenarios that participants will write prompts for
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addScenario}
                        disabled={scenarios.length >= 10 || isSubmitting}
                        className="shrink-0"
                      >
                        Add Question
                      </Button>
                    </div>
                    
                    {scenarios.map((scenario, index) => (
                      <ScenarioForm
                        key={index}
                        index={index}
                        title={scenario.title}
                        description={scenario.description}
                        onChange={(field, value) => updateScenario(index, field, value)}
                        onDelete={() => deleteScenario(index)}
                        canDelete={scenarios.length > 1}
                      />
                    ))}
                    
                    {scenarios.length < 10 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addScenario}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        Add Question ({scenarios.length}/10)
                      </Button>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                    {isSubmitting ? "Creating..." : "Create Game"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Games Tab */}
          <TabsContent value="manage">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Games</CardTitle>
                  <CardDescription>
                    View, edit, and delete existing games
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingGames ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                      <p className="text-muted-foreground mt-4">Loading games...</p>
                    </div>
                  ) : games.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No games created yet. Start by creating your first game!</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {games.map((game) => (
                        <GameCard
                          key={game.id}
                          id={game.id}
                          title={game.title}
                          creator_name={game.creator_name}
                          created_at={game.created_at}
                          onGameUpdated={handleGameUpdated}
                          onGameDeleted={handleGameDeleted}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

