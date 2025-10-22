"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioForm } from "@/components/scenario-form";

interface Scenario {
  title: string;
  description: string;
}

export default function GameCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameTitle, setGameTitle] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ]);

  const updateScenario = (index: number, field: "title" | "description", value: string) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = value;
    setScenarios(newScenarios);
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
      
      const data = await response.json();
      router.push(`/games/${data.game.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Create New Game</h1>
        <p className="text-muted-foreground mb-8">Design scenarios to challenge prompt engineering skills</p>
      
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
          <h2 className="text-xl font-semibold text-foreground">Scenarios</h2>
          <p className="text-sm text-muted-foreground">
            Create 3 scenarios that participants will write prompts for. Each scenario should describe
            a situation where a well-crafted prompt would be needed.
          </p>
          
          {scenarios.map((scenario, index) => (
            <ScenarioForm
              key={index}
              index={index}
              title={scenario.title}
              description={scenario.description}
              onChange={(field, value) => updateScenario(index, field, value)}
            />
          ))}
        </div>
        
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/games")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Game"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

