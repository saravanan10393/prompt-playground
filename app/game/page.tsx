"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RotateCcw, Play, RefreshCw, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Response } from "@/components/ai-elements/response";

const THEMES = [
  "Any Theme",
  "Productivity",
  "Content Creation & Writing",
  "Data Analysis & Processing",
  "Business & Professional",
  "E-commerce & Marketing",
  "Education & Learning",
  "Personal & Lifestyle",
  "Technology & Development",
  "Creative & Design",
  "Health & Wellness",
  "Customer Service",
  "Finance & Accounting",
  "Project Management",
  "Communication & Social",
  "Startup & Entrepreneurship",
  "Manufacturing & Operations",
  "Real Estate & Property",
  "Gaming & Entertainment",
  "Sustainability & Environment",
  "Arts & Culture",
  "Custom Theme"
];

interface GameState {
  mode: 'start' | 'playing' | 'results';
  taskName: string;
  description: string;
  prompt: string;
  complexity: 'simple' | 'medium' | 'complex';
  theme: string;
  customTheme: string;
  evaluation: {
    score: number;
    feedback: string;
    refinedPrompt: string;
  } | null;
}

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>({
    mode: 'start',
    taskName: '',
    description: '',
    prompt: '',
    complexity: 'medium',
    theme: 'Any Theme',
    customTheme: '',
    evaluation: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

  const startGame = async (complexity?: 'simple' | 'medium' | 'complex') => {
    setIsGeneratingScenario(true);
    try {
      const response = await fetch('/api/game/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          complexity: complexity || gameState.complexity,
          theme: gameState.theme === 'Custom Theme' ? gameState.customTheme : gameState.theme
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate scenario');
      
      const data = await response.json();
      setGameState(prev => ({
        ...prev,
        mode: 'playing',
        taskName: data.taskName,
        description: data.description,
        prompt: '',
        evaluation: null,
        complexity: complexity || prev.complexity
      }));
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const regenerateScenario = async () => {
    await startGame(gameState.complexity);
  };

  const submitPrompt = async () => {
    if (!gameState.prompt.trim()) {
      alert('Please write a prompt before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/game/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: `${gameState.taskName}: ${gameState.description}`,
          prompt: gameState.prompt
        })
      });
      
      if (!response.ok) throw new Error('Failed to evaluate prompt');
      
      const evaluation = await response.json();
      setGameState(prev => ({
        ...prev,
        mode: 'results',
        evaluation
      }));
    } catch (error) {
      console.error('Error evaluating prompt:', error);
      alert('Failed to evaluate prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const replay = () => {
    setGameState(prev => ({
      ...prev,
      mode: 'playing',
      prompt: '',
      evaluation: null
    }));
  };

  const restart = async () => {
    await startGame();
  };

  const getComplexityBadgeColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'complex': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/8 via-transparent to-slate-800/8 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3 gradient-text">Prompt Engineering Game</h1>
          <p className="text-lg text-muted-foreground">Test your prompting skills with AI-generated scenarios</p>
        </div>

        {gameState.mode === 'start' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-orange-500 flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl">Let&apos;s test your prompting skills!</CardTitle>
              <CardDescription className="text-lg">
                You&apos;ll be given a random real-world scenario and asked to write a prompt for it. 
                Get instant feedback and see how you can improve!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Complexity Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <label className="text-sm font-medium">Scenario Complexity</label>
                </div>
                <Select 
                  value={gameState.complexity} 
                  onValueChange={(value: 'simple' | 'medium' | 'complex') => 
                    setGameState(prev => ({ ...prev, complexity: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Simple - Basic scenarios for beginners</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Medium - Balanced complexity (Default)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="complex">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Complex - Advanced scenarios for experts</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <label className="text-sm font-medium">Theme</label>
                </div>
                <Select 
                  value={gameState.theme} 
                  onValueChange={(value: string) => 
                    setGameState(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Custom Theme Input */}
                {gameState.theme === 'Custom Theme' && (
                  <Input
                    placeholder="Enter your custom theme..."
                    value={gameState.customTheme}
                    onChange={(e) => setGameState(prev => ({ ...prev, customTheme: e.target.value }))}
                    className="w-full"
                  />
                )}
              </div>
              
              <Button 
                onClick={() => startGame()} 
                disabled={isGeneratingScenario}
                size="lg"
                className="w-full px-8 py-3 text-lg"
              >
                {isGeneratingScenario ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Scenario...
                  </>
                ) : (
                  'Start Game'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState.mode === 'playing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <span className="text-orange-500">🎯</span> Your Challenge
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Write a prompt to accomplish this task:
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Complexity:</span>
                        <Select
                          value={gameState.complexity}
                          onValueChange={(value: 'simple' | 'medium' | 'complex') =>
                            setGameState(prev => ({ ...prev, complexity: value }))
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Simple</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span>Medium</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="complex">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>Complex</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Theme:</span>
                        <Select
                          value={gameState.theme}
                          onValueChange={(value: string) =>
                            setGameState(prev => ({ ...prev, theme: value }))
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {THEMES.map((theme) => (
                              <SelectItem key={theme} value={theme}>
                                {theme}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={regenerateScenario}
                      disabled={isGeneratingScenario}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGeneratingScenario ? 'animate-spin' : ''}`} />
                      New Scenario
                    </Button>
                  </div>
                  
                  {/* Custom Theme Input for Playing Mode */}
                  {gameState.theme === 'Custom Theme' && (
                    <Input
                      placeholder="Enter your custom theme..."
                      value={gameState.customTheme}
                      onChange={(e) => setGameState(prev => ({ ...prev, customTheme: e.target.value }))}
                      className="w-full max-w-md"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 px-3 py-1 text-sm font-semibold">
                      📋 YOUR TASK
                    </Badge>
                  </div>
                  <div className="bg-muted/50 p-6 rounded-xl border-2 border-orange-500/20">
                    <div className="space-y-3">
                      <h3 className="text-center text-2xl font-bold text-foreground">{gameState.taskName}</h3>
                      <Response className="text-muted-foreground text-lg leading-relaxed prose prose-lg max-w-none [&>*]:text-muted-foreground">
                        {gameState.description}
                      </Response>
                      <p className="text-sm text-muted-foreground">Write a prompt to accomplish this task</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your Prompt</CardTitle>
                <CardDescription>
                  Write a clear, specific prompt that would help an AI accomplish this task
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Write your prompt here... Be specific and clear about what you want to achieve."
                  value={gameState.prompt}
                  onChange={(e) => setGameState(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={6}
                  className="text-lg leading-relaxed"
                />
                <div className="flex justify-center">
                  <Button 
                    onClick={submitPrompt} 
                    disabled={isLoading || !gameState.prompt.trim()}
                    size="lg"
                    className="px-8 py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Submit Prompt'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState.mode === 'results' && gameState.evaluation && (
          <div className="space-y-6">
            {/* Score Header */}
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-600 to-orange-500 shadow-xl mb-4">
                  <span className="text-3xl font-bold text-white">{gameState.evaluation.score}</span>
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2">
                  Your Score: {gameState.evaluation.score}/10
                </h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className={`${getComplexityBadgeColor(gameState.complexity)} px-3 py-1`}>
                    {gameState.complexity.charAt(0).toUpperCase() + gameState.complexity.slice(1)} Complexity
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                  Here&apos;s how your prompt performed
                </p>
              </CardContent>
            </Card>

            {/* Original Task */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-slate-500">📋</span> Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-6 rounded-xl text-center space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">{gameState.taskName}</h3>
                  <Response className="text-muted-foreground text-lg leading-relaxed prose prose-lg max-w-none [&>*]:text-muted-foreground">
                    {gameState.description}
                  </Response>
                </div>
              </CardContent>
            </Card>

            {/* Your Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-orange-500">📝</span> Your Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/80 p-4 rounded-xl font-mono text-sm border-2 border-orange-500/20">
                  {gameState.prompt}
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-slate-500">💬</span> Feedback & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-500/5 p-4 rounded-xl border border-slate-500/20">
                  <Response className="text-lg leading-relaxed prose prose-lg max-w-none [&>*]:text-foreground/90">
                    {gameState.evaluation.feedback}
                  </Response>
                </div>
              </CardContent>
            </Card>

            {/* Refined Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-green-500">✨</span> Refined Prompt Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-500/10 p-4 rounded-xl border-2 border-green-500/30">
                  <Response className="text-sm text-green-700 dark:text-green-300 prose prose-sm prose-green max-w-none [&>*]:text-green-700 dark:[&>*]:text-green-300">
                    {gameState.evaluation.refinedPrompt}
                  </Response>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-6">
              {/* Complexity and Theme Selectors */}
              <div className="flex justify-center">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Complexity:</span>
                    <Select 
                      value={gameState.complexity} 
                      onValueChange={(value: 'simple' | 'medium' | 'complex') => 
                        setGameState(prev => ({ ...prev, complexity: value }))
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Simple</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="complex">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Complex</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Theme:</span>
                    <Select 
                      value={gameState.theme} 
                      onValueChange={(value: string) => 
                        setGameState(prev => ({ ...prev, theme: value }))
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map((theme) => (
                          <SelectItem key={theme} value={theme}>
                            {theme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Custom Theme Input for Results */}
              {gameState.theme === 'Custom Theme' && (
                <div className="flex justify-center">
                  <Input
                    placeholder="Enter your custom theme..."
                    value={gameState.customTheme}
                    onChange={(e) => setGameState(prev => ({ ...prev, customTheme: e.target.value }))}
                    className="w-full max-w-md"
                  />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={replay}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Replay Same Scenario
                </Button>
                <Button 
                  onClick={regenerateScenario}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  disabled={isGeneratingScenario}
                >
                  {isGeneratingScenario ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      New {gameState.complexity} Scenario
                    </>
                  )}
                </Button>
                <Button 
                  onClick={restart}
                  size="lg"
                  className="px-8 py-3"
                  disabled={isGeneratingScenario}
                >
                  {isGeneratingScenario ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Over
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
