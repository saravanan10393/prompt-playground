"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ScenarioFormProps {
  index: number;
  title: string;
  description: string;
  onChange: (field: "title" | "description", value: string) => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function ScenarioForm({ index, title, description, onChange, onDelete, canDelete = false }: ScenarioFormProps) {
  return (
    <div className="space-y-4 p-6 glass-card rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Scenario {index + 1}</h3>
        {canDelete && onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
          >
            Delete
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`scenario-title-${index}`}>
          Title <span className="text-red-400">*</span>
        </Label>
        <Input
          id={`scenario-title-${index}`}
          placeholder="Enter scenario title"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`scenario-description-${index}`}>
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={`scenario-description-${index}`}
          placeholder="Describe the scenario and what kind of prompt you're looking for (optional)"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}

