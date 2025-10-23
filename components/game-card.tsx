"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, BarChart3 } from "lucide-react";
import { GameEditDialog } from "@/components/game-edit-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

interface Scenario {
  id: number;
  title: string;
  description: string;
}

interface Game {
  id: number;
  title: string;
  creator_name: string;
  created_at: string;
  scenarios: Scenario[];
}

interface GameCardProps {
  id: number;
  title: string;
  creator_name: string;
  created_at: string;
  onGameUpdated?: () => void;
  onGameDeleted?: () => void;
}

export function GameCard({ 
  id, 
  title, 
  creator_name, 
  created_at, 
  onGameUpdated,
  onGameDeleted
}: GameCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [hasSubmissions, setHasSubmissions] = useState(false);
  
  const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleEdit = async () => {
    try {
      // Fetch game details
      const response = await fetch(`/api/games/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setGame(data.game);
        
        // Check if game has submissions
        const editCheckResponse = await fetch(`/api/games/${id}/check-editable`);
        const editData = await editCheckResponse.json();
        
        if (editCheckResponse.ok) {
          setHasSubmissions(editData.hasSubmissions);
        }
        
        setIsEditDialogOpen(true);
      } else {
        alert("Failed to load game details");
      }
    } catch (error) {
      console.error("Error loading game:", error);
      alert("Failed to load game details");
    }
  };

  const handleSave = async (gameId: number, newTitle: string, newScenarios: Omit<Scenario, "id">[]) => {
    const response = await fetch(`/api/games/${gameId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        scenarios: newScenarios,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update game");
    }

    onGameUpdated?.();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete game");
      }

      onGameDeleted?.();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting game:", error);
      alert(error instanceof Error ? error.message : "Failed to delete game");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <Card className="hover-lift group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-foreground group-hover:text-purple-400 transition-colors">{title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                Created by <span className="text-purple-400">{creator_name}</span> on {formattedDate}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Game
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Game
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/games/${id}`}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Results
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Link href={`/games/${id}`}>
            <Button className="w-full shadow-lg shadow-purple-500/30">Play Game</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {game && (
        <GameEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          game={game}
          onSave={handleSave}
          hasSubmissions={hasSubmissions}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Game"
        message="Are you sure you want to delete this game? This will permanently remove the game and all associated submissions. This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
}

