"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [, setSystemRefinementResult] = useState<{
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

  // Mobile chat visibility state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Debounce system prompt changes
  const debouncedSystemPrompt = useDebounce(systemPrompt, 800);

  const handleRefineSystemPrompt = useCallback(async () => {
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
  }, [systemPrompt, selectedStrategy]);

  // Auto-refine system prompt when strategy changes or system prompt changes
  useEffect(() => {
    if (selectedStrategy !== "none" && debouncedSystemPrompt.trim()) {
      handleRefineSystemPrompt();
    }
  }, [selectedStrategy, debouncedSystemPrompt, handleRefineSystemPrompt]);

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
          systemPrompt: useRefinedSystem && refinedSystemPrompt.trim() ? refinedSystemPrompt : systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();

      let assistantMessage = "";
      const assistantId = (Date.now() + 1).toString();
      let chunkCount = 0;

      setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantId }]);

      console.log("Starting to read stream...");

      while (reader) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("Stream done. Total chunks:", chunkCount);
          break;
        }

        const chunk = decoder.decode(value);
        chunkCount++;

        if (chunkCount === 1) {
          console.log("First chunk received, length:", chunk.length);
          console.log("First chunk preview:", chunk.substring(0, 100));
        }

        assistantMessage += chunk;

        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: assistantMessage } : m)
        );
      }

      console.log("Stream completed. Chunks:", chunkCount, "Message length:", assistantMessage.length);

      // Check if message is empty after streaming
      if (!assistantMessage.trim()) {
        console.error("Empty response received from API");
        throw new Error("Received empty response from AI. This may be due to:\n• API configuration issues\n• Model unavailable\n• Rate limiting\n\nPlease check the console for details and try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Get the assistant message ID if it exists
      const assistantId = (Date.now() + 1).toString();

      // Remove any empty assistant message and add error message
      setMessages(prev => {
        const filtered = prev.filter(m => !(m.role === "assistant" && !m.content.trim()));
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        return [...filtered, {
          role: "assistant",
          content: `❌ **Error**: ${errorMessage}\n\nPlease try again or check your configuration.`,
          id: assistantId
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:flex h-[calc(100vh-73px)]">
      {/* Left Panel - Configuration */}
      <div className="w-full md:w-96 glass md:border-r border-slate-500/20 p-6 overflow-y-auto h-full">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Experiment with different prompting strategies to see how they enhance your system prompts and improve AI responses.
        </p>
        <h2 className="text-2xl font-bold mb-6 gradient-text">Configuration</h2>

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
          {/* {selectedStrategy !== "none" && (
            <Button
              onClick={handleRefinePrompt}
              disabled={isRefining || !currentInput.trim()}
              className="w-full"
              variant="outline"
            >
              {isRefining ? "Refining..." : "Apply Strategy"}
            </Button>
          )} */}

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
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-slate-400 dark:text-slate-300">How it works</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>1. Configure your model and settings</p>
              <p>2. Select a prompting strategy (optional)</p>
              <p>3. Type your message and click &quot;Apply Strategy&quot; to refine</p>
              <p>4. Review the refined prompt and use it or edit further</p>
              <p>5. Send your message to chat with the AI</p>
            </CardContent>
          </Card>

          {/* Mobile: Test the prompt button */}
          <Button
            onClick={() => setIsChatOpen(true)}
            className="w-full md:hidden bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Test the prompt
          </Button>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className={`${isChatOpen ? 'fixed inset-x-0 top-16 bottom-0 z-50 bg-background flex' : 'hidden'} md:flex md:flex-1 md:static md:z-auto flex-col bg-gradient-to-br from-transparent via-transparent to-slate-900/5`}>
        {/* Chat Header with Clear Button */}
        <div className="flex justify-between items-center p-3 md:p-4 border-b border-slate-500/20 glass">
          {/* Mobile: Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsChatOpen(false)}
            className="md:hidden h-8 w-8 p-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>

          {/* Title - always visible */}
          <h3 className="text-sm font-medium text-slate-400 dark:text-slate-300 flex-1 text-center md:text-left md:flex-none">Chat</h3>

          {/* Clear button - only when messages exist */}
          {messages.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="h-8 px-2 md:px-3"
            >
              <Trash2 className="h-3 w-3 md:mr-1" />
              <span className="hidden md:inline">Clear Chat</span>
            </Button>
          ) : (
            <div className="w-8 md:w-0" />
          )}
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 md:px-6 md:pt-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2 md:space-y-4 glass-card p-4 md:p-12 rounded-2xl max-w-md mx-auto">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-slate-600 to-orange-500 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-xl font-semibold text-foreground">Start a conversation</h3>
                <p className="text-xs md:text-base text-muted-foreground">
                  Type a message below to begin testing your system prompt
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
                  <div className={`text-xs font-semibold mb-1 ${message.role === "user" ? "text-orange-500 dark:text-orange-400 text-right" : "text-slate-500 dark:text-slate-400"}`}>
                    {message.role === "user" ? "You" : "AI"}
                  </div>
                  <Response
                    isAnimating={isLoading && message.id === messages[messages.length - 1]?.id}
                    className={`${message.role === "user" ? "bg-gradient-to-br from-orange-600/30 to-orange-700/30 border border-orange-500/30" : "glass-card"} rounded-xl p-4 text-foreground`}
                  >
                    {message.content}
                  </Response>
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-4 glass-card">
                <Simmer>Generating your response...</Simmer>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-500/20 p-3 md:p-4 glass">
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

