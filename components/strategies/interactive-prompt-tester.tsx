"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Response } from "@/components/ai-elements/response";

interface InteractivePromptTesterProps {
  strategy: string;
  initialPrompt?: string;
  placeholder?: string;
}

export function InteractivePromptTester({
  strategy,
  initialPrompt = "",
  placeholder = "Enter your prompt here...",
}: InteractivePromptTesterProps) {
  const [input, setInput] = useState(initialPrompt);
  const [enhanced, setEnhanced] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnhance = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/playground/refine-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          strategy,
          isSystemPrompt: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to enhance prompt");

      const data = await response.json();
      setEnhanced(data.refined);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      setEnhanced("Error: Unable to enhance prompt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-2 border-orange-500/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Try it Yourself</h3>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Prompt:</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full"
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={handleEnhance}
          disabled={!input.trim() || isLoading}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Apply {strategy.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Strategy
            </>
          )}
        </Button>

        {/* Enhanced Output */}
        {enhanced && (
          <div className="space-y-2 transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-green-400">Enhanced Prompt:</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-400" />
                    <span className="text-xs text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-[#22293a] border-2 border-green-500/50 shadow-md">
              <Response className="text-sm text-slate-50 prose prose-invert max-w-none">
                {enhanced}
              </Response>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
