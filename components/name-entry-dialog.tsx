"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, User } from "lucide-react";

interface NameEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onNameChange: (newName: string) => void;
  onContinue: () => void;
}

export function NameEntryDialog({
  isOpen,
  onClose,
  currentName,
  onNameChange,
  onContinue,
}: NameEntryDialogProps) {
  const [name, setName] = useState(currentName);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleGenerateNew = async () => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setName(data.user.name);
      }
    } catch (error) {
      console.error("Error generating new name:", error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (name.trim() === currentName) {
      onContinue();
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/auth", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        onNameChange(data.user.name);
        onContinue();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <DialogTitle>Welcome to Prompt Playground!</DialogTitle>
          </div>
          <DialogDescription>
            Choose your display name for the games and leaderboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isUpdating}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNew}
                disabled={isUpdating}
                className="px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click the refresh button to generate a new random name
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || !name.trim()}
            >
              {isUpdating ? "Saving..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
