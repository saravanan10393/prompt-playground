"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ScenarioFormProps {
  index: number;
  title: string;
  description: string;
  onChange: (field: "title" | "description", value: string) => void;
}

export function ScenarioForm({ index, title, description, onChange }: ScenarioFormProps) {
  return (
    <div className="space-y-4 p-6 glass-card rounded-xl">
      <h3 className="font-semibold text-lg text-white">Scenario {index + 1}</h3>
      
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
          Description <span className="text-gray-500">(optional)</span>
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

