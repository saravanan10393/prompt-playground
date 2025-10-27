"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, RefreshCw, Check } from "lucide-react";
import { Response } from "@/components/ai-elements/response";

interface SystemPromptRefinerProps {
  originalPrompt: string;
  refinedPrompt: string;
  strategy: string;
  isRefining: boolean;
  onToggleUse: (useRefined: boolean) => void;
  onEditRefined: (newValue: string) => void;
  onRefineAgain: () => void;
}

export function SystemPromptRefiner({
  originalPrompt: _originalPrompt,
  refinedPrompt,
  strategy,
  isRefining,
  onToggleUse,
  onEditRefined,
  onRefineAgain,
}: SystemPromptRefinerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRefined, setEditedRefined] = useState(refinedPrompt || "");

  const handleEdit = () => {
    setIsEditing(true);
    setEditedRefined(refinedPrompt || "");
  };

  const handleSave = () => {
    onEditRefined(editedRefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRefined(refinedPrompt || "");
    setIsEditing(false);
  };

  const hasRefinedContent = (refinedPrompt || "").trim().length > 0;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">✨ Refined System Prompt</span>
            <Badge variant="secondary" className="text-xs">
              {strategy}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {hasRefinedContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefineAgain}
                disabled={isRefining}
                className="h-8 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${isRefining ? "animate-spin" : ""}`} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {isRefining ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Refining system prompt...
              </div>
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          ) : hasRefinedContent ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Refined Prompt</label>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="h-8 px-2 text-xs"
                    >
                      Edit
                    </Button>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedRefined}
                      onChange={(e) => setEditedRefined(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded font-mono text-sm">
                    <Response>{refinedPrompt}</Response>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-refined"
                  checked={true}
                  onChange={(e) => onToggleUse(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="use-refined" className="text-sm">
                  Use refined system prompt for chat
                </label>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Select a prompting strategy to refine your system prompt</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
