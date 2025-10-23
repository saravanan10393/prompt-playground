"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioForm } from "@/components/scenario-form";
import { AlertTriangle } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
}

interface Game {
  id: number;
  title: string;
  scenarios: Scenario[];
}

interface GameEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  onSave: (gameId: number, title: string, scenarios: Omit<Scenario, "id">[]) => Promise<void>;
  hasSubmissions: boolean;
}

export function GameEditDialog({
  isOpen,
  onClose,
  game,
  onSave,
  hasSubmissions,
}: GameEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameTitle, setGameTitle] = useState("");
  const [scenarios, setScenarios] = useState<Omit<Scenario, "id">[]>([
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ]);

  // Initialize form when game changes
  useEffect(() => {
    if (game) {
      setGameTitle(game.title);
      setScenarios(
        game.scenarios.map((s) => ({
          title: s.title,
          description: s.description,
        }))
      );
    }
  }, [game]);

  const updateScenario = (index: number, field: "title" | "description", value: string) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = value;
    setScenarios(newScenarios);
  };

  const handleSave = async () => {
    if (!game) return;
    
    if (!gameTitle.trim()) {
      alert("Please enter a game title");
      return;
    }
    
    for (let i = 0; i < scenarios.length; i++) {
      if (!scenarios[i].title.trim() || !scenarios[i].description.trim()) {
        alert(`Please complete scenario ${i + 1}`);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(game.id, gameTitle, scenarios);
      onClose();
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>
            Modify your game title and scenarios. Changes will be visible to all users.
          </DialogDescription>
        </DialogHeader>
        
        {hasSubmissions && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Warning: This game has submissions</p>
              <p>Editing may affect the experience of users who have already participated.</p>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-game-title">Game Title</Label>
            <Input
              id="edit-game-title"
              placeholder="Enter a descriptive title for your game"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scenarios</h3>
            <p className="text-sm text-muted-foreground">
              Update the 3 scenarios that participants will write prompts for.
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
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
