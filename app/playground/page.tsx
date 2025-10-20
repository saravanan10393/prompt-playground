"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StrategyRefiner } from "@/components/strategy-refiner";
import { SystemPromptRefiner } from "@/components/system-prompt-refiner";
import { StrategyInfoCard } from "@/components/strategy-info-card";
import { useDebounce } from "@/hooks/use-debounce";
import { Response } from "@/components/ai-elements/response";
import { Simmer } from "@/components/ai-elements/simmer";
import { Sparkles, Trash2 } from "lucide-react";

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "o1", label: "O1" },
  { value: "o1-mini", label: "O1 Mini" },
  { value: "o3-mini", label: "O3 Mini" },
];

const STRATEGIES = [
  { value: "none", label: "None" },
  { value: "zero-shot", label: "Zero-shot" },
  { value: "few-shot", label: "Few-shot" },
  { value: "chain-of-thought", label: "Chain-of-Thought" },
  { value: "react", label: "ReAct" },
  { value: "reflexion", label: "Reflexion" },
  { value: "tree-of-thoughts", label: "Tree of Thoughts" },
  { value: "meta-prompting", label: "Meta Prompting" },
];

export default function PlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState([0.7]);
  const [selectedStrategy, setSelectedStrategy] = useState("none");
  const [currentInput, setCurrentInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinementResult, setRefinementResult] = useState<{
    original: string;
    refined: string;
    explanation: string;
    strategy: string;
  } | null>(null);
  const [showRefiner, setShowRefiner] = useState(false);

  // System prompt refinement state
  const [refinedSystemPrompt, setRefinedSystemPrompt] = useState("");
  const [isRefiningSystem, setIsRefiningSystem] = useState(false);
  const [useRefinedSystem, setUseRefinedSystem] = useState(true);
  const [systemRefinementResult, setSystemRefinementResult] = useState<{
    original: string;
    refined: string;
    explanation: string;
    strategy: string;
  } | null>(null);

  // User message refinement state
  const [refinedUserPrompt, setRefinedUserPrompt] = useState("");
  const [isRefiningUser, setIsRefiningUser] = useState(false);
  const [useRefinedUser, setUseRefinedUser] = useState(false);

  const [messages, setMessages] = useState<Array<{ role: string; content: string; id: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debounce system prompt changes
  const debouncedSystemPrompt = useDebounce(systemPrompt, 800);

  // Auto-refine system prompt when strategy changes or system prompt changes
  useEffect(() => {
    if (selectedStrategy !== "none" && debouncedSystemPrompt.trim()) {
      handleRefineSystemPrompt();
    }
  }, [selectedStrategy, debouncedSystemPrompt]);

  const handleRefineUserPrompt = async () => {
    if (!input.trim() || selectedStrategy === "none") {
      alert("Please enter a message and select a strategy");
      return;
    }

    setIsRefiningUser(true);

    try {
      const response = await fetch("/api/playground/refine-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
          strategy: selectedStrategy,
          isSystemPrompt: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refine prompt");
      }

      const data = await response.json();
      setRefinedUserPrompt(data.refined);
      setUseRefinedUser(true);
    } catch (error) {
      console.error("Error refining user prompt:", error);
      alert("Failed to refine prompt. Please try again.");
    } finally {
      setIsRefiningUser(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
    setCurrentInput("");
    setRefinedUserPrompt("");
    setUseRefinedUser(false);
  };

  const handleRefineSystemPrompt = async () => {
    if (!systemPrompt.trim() || selectedStrategy === "none") {
      return;
    }

    setIsRefiningSystem(true);

    try {
      const response = await fetch("/api/playground/refine-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: systemPrompt,
          strategy: selectedStrategy,
          isSystemPrompt: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refine system prompt");
      }

      const data = await response.json();
      setRefinedSystemPrompt(data.refined);
      setSystemRefinementResult(data);
    } catch (error) {
      console.error("Error refining system prompt:", error);
      // Don't show alert for auto-refinement failures
    } finally {
      setIsRefiningSystem(false);
    }
  };

  const handleRefinePrompt = async () => {
    if (!currentInput.trim()) {
      alert("Please enter a prompt to refine");
      return;
    }

    if (selectedStrategy === "none") {
      alert("Please select a prompting strategy");
      return;
    }

    setIsRefining(true);

    try {
      const response = await fetch("/api/playground/refine-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentInput,
          strategy: selectedStrategy,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refine prompt");
      }

      const data = await response.json();
      setRefinementResult(data);
      setShowRefiner(true);
    } catch (error) {
      console.error("Error refining prompt:", error);
      alert("Failed to refine prompt. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleUseRefined = (refined: string) => {
    setCurrentInput(refined);
    setInput(refined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Use refined message if enabled, otherwise use original input
    const messageContent = useRefinedUser && refinedUserPrompt.trim() ? refinedUserPrompt : input;
    const userMessage = { role: "user", content: messageContent, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setCurrentInput("");
    setRefinedUserPrompt("");
    setUseRefinedUser(false);
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/playground/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          temperature: temperature[0],
          systemPrompt: useRefinedSystem && refinedSystemPrompt.trim() ? refinedSystemPrompt : systemPrompt,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage = "";
      const assistantId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantId }]);
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        assistantMessage += chunk;
        
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: assistantMessage } : m)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Panel - Configuration */}
      <div className="w-96 border-r p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Configuration</h2>

        <div className="space-y-6">
          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder="Enter system instructions (optional)"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature: {temperature[0].toFixed(2)}
            </Label>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onValueChange={setTemperature}
              disabled={selectedModel.startsWith("o1") || selectedModel.startsWith("o3")}
            />
            {(selectedModel.startsWith("o1") || selectedModel.startsWith("o3")) && (
              <p className="text-xs text-muted-foreground">
                Temperature is not supported for reasoning models
              </p>
            )}
          </div>

          {/* Strategy Selection */}
          <div className="space-y-2">
            <Label htmlFor="strategy">Prompting Strategy</Label>
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger id="strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System Prompt Refiner - Only show when strategy is selected */}
          {selectedStrategy !== "none" && systemPrompt.trim() && (
            <SystemPromptRefiner
              originalPrompt={systemPrompt}
              refinedPrompt={refinedSystemPrompt}
              strategy={selectedStrategy}
              isRefining={isRefiningSystem}
              onToggleUse={setUseRefinedSystem}
              onEditRefined={setRefinedSystemPrompt}
              onRefineAgain={handleRefineSystemPrompt}
            />
          )}

          {/* Strategy Info Card - Only show when strategy is selected */}
          {selectedStrategy !== "none" && (
            <StrategyInfoCard selectedStrategy={selectedStrategy} />
          )}

          {/* Apply Strategy */}
          {selectedStrategy !== "none" && (
            <Button
              onClick={handleRefinePrompt}
              disabled={isRefining || !currentInput.trim()}
              className="w-full"
              variant="outline"
            >
              {isRefining ? "Refining..." : "Apply Strategy"}
            </Button>
          )}

          {/* User Message Refinement */}
          {input.trim() && selectedStrategy !== "none" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Refine Your Message</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefineUserPrompt}
                  disabled={isRefiningUser || !input.trim()}
                  className="h-8 px-2"
                >
                  <Sparkles className={`h-3 w-3 ${isRefiningUser ? "animate-spin" : ""}`} />
                </Button>
              </div>
              
              {refinedUserPrompt && (
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded text-sm">
                    <div className="text-xs text-muted-foreground mb-1">Refined:</div>
                    <div className="whitespace-pre-wrap">{refinedUserPrompt}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-refined-user"
                      checked={useRefinedUser}
                      onChange={(e) => setUseRefinedUser(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="use-refined-user" className="text-xs">
                      Use refined message
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How it works</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>1. Configure your model and settings</p>
              <p>2. Select a prompting strategy (optional)</p>
              <p>3. Type your message and click "Apply Strategy" to refine</p>
              <p>4. Review the refined prompt and use it or edit further</p>
              <p>5. Send your message to chat with the AI</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header with Clear Button */}
        {messages.length > 0 && (
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-sm font-medium">Chat</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="h-8 px-3"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Chat
            </Button>
          </div>
        )}
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Type a message below to begin chatting with the AI
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${message.role === "user" ? "" : ""}`}>
                  <div className="text-xs font-semibold mb-1 opacity-70">
                    {message.role === "user" ? "You" : selectedModel}
                  </div>
                  <Response
                    isAnimating={isLoading && message.id === messages[messages.length - 1]?.id}
                    className="bg-muted rounded-lg p-4"
                  >
                    {message.content}
                  </Response>
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                <Simmer />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCurrentInput(e.target.value);
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Strategy Refiner Dialog */}
      {refinementResult && (
        <StrategyRefiner
          isOpen={showRefiner}
          onClose={() => setShowRefiner(false)}
          original={refinementResult.original}
          refined={refinementResult.refined}
          explanation={refinementResult.explanation}
          strategy={refinementResult.strategy}
          onUseRefined={handleUseRefined}
        />
      )}
    </div>
  );
}

