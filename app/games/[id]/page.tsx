"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveGameResults } from "@/lib/storage";
import { NameEntryDialog } from "@/components/name-entry-dialog";
import { useAuth } from "@/components/auth-provider";
import { SubmissionViewDialog } from "@/components/submission-view-dialog";
import { Eye } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  description: string;
  order_index: number;
}

interface Game {
  id: number;
  title: string;
  creator_name: string;
  scenarios: Scenario[];
}

interface Submission {
  scenarioId: number;
  prompt: string;
}

interface Evaluation {
  scenarioId: number;
  prompt: string;
  score: number;
  feedback: string;
  refinedPrompt: string;
}

interface LeaderboardEntry {
  name: string;
  token: string;
  total_score: number;
  scenarios_completed: number;
  last_submission: string;
}

export default function GamePage() {
  const params = useParams();
  const gameId = parseInt(params.id as string);
  const { user, updateUserName } = useAuth();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Name confirmation state
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [nameConfirmed, setNameConfirmed] = useState(false);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserToken, setSelectedUserToken] = useState<string | null>(null);

  useEffect(() => {
    fetchGame();
    fetchResults();
    
    // Check if name has been confirmed
    const confirmed = localStorage.getItem('name_confirmed');
    setNameConfirmed(!!confirmed);
    if (!confirmed) {
      setShowNameEntry(true);
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      const data = await response.json();
      setGame(data.game);
      
      // Initialize submissions array
      if (data.game.scenarios) {
        setSubmissions(
          data.game.scenarios.map((s: Scenario) => ({
            scenarioId: s.id,
            prompt: "",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/results`);
      const data = await response.json();
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      
      if (data.userSubmissions && data.userSubmissions.length > 0) {
        setHasSubmitted(true);
        
        // Reconstruct evaluations from submissions
        const evals = data.userSubmissions.map((sub: { scenario_id: number; prompt: string; score: number; feedback: string; refined_prompt: string }) => ({
          scenarioId: sub.scenario_id,
          prompt: sub.prompt,
          score: sub.score,
          feedback: sub.feedback,
          refinedPrompt: sub.refined_prompt,
        }));
        
        setEvaluations(evals);
        setTotalScore(evals.reduce((sum: number, e: Evaluation) => sum + e.score, 0));
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const handleNameConfirmed = () => {
    localStorage.setItem('name_confirmed', 'true');
    setNameConfirmed(true);
    setShowNameEntry(false);
  };


  const updatePrompt = (scenarioId: number, prompt: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.scenarioId === scenarioId ? { ...s, prompt } : s))
    );
  };

  const handleSubmitAll = async () => {
    // Validate all prompts are filled
    for (const submission of submissions) {
      if (!submission.prompt.trim()) {
        alert("Please fill in all prompts before submitting");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/games/${gameId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit prompts");
      }

      const data = await response.json();
      
      setEvaluations(data.evaluations);
      setTotalScore(data.totalScore);
      setLeaderboard(data.leaderboard);
      setHasSubmitted(true);
      
      // Save to local storage
      saveGameResults(gameId, {
        scenarioScores: data.evaluations.map((e: Evaluation) => ({
          scenarioId: e.scenarioId,
          score: e.score,
          feedback: e.feedback,
        })),
        totalScore: data.totalScore,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error submitting prompts:", error);
      alert(error instanceof Error ? error.message : "Failed to submit prompts. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSubmissions = (userToken: string) => {
    setSelectedUserToken(userToken);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUserToken(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="glass-card p-12 rounded-2xl text-center">
          <p className="text-xl text-foreground">Game not found</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic max-width based on number of scenarios
  const getMaxWidth = () => {
    if (!game) return "max-w-6xl";
    const scenarioCount = game.scenarios.length;
    if (scenarioCount <= 2) return "max-w-2xl";
    if (scenarioCount <= 5) return "max-w-4xl";
    return "max-w-6xl";
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none" />
      
      <div className={`container mx-auto px-4 py-8 ${getMaxWidth()} relative`}>
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 gradient-text leading-tight">{game.title}</h1>
          {/* <p className="text-gray-400">Created by <span className="text-purple-400">{game.creator_name}</span></p> */}
          <div className="w-24 h-1 mx-auto mt-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        </div>

      {!hasSubmitted ? (
        <div className="space-y-8">
          {/* Introductory header */}
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-3xl font-bold gradient-text">
              {game.scenarios.length === 1 ? 'Your Challenge' : `${game.scenarios.length} Challenges`}
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Write a prompt for {game.scenarios.length === 1 ? 'the challenge' : 'each challenge'} below. Make your prompts clear, specific, and effective.
            </p>
          </div>

          {/* Individual scenario cards */}
          {game.scenarios.map((scenario, index) => {
            const submission = submissions.find((s) => s.scenarioId === scenario.id);
            return (
              <Card key={scenario.id} className="overflow-hidden border-2 hover-lift">
                <CardHeader className="pb-4 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Numbered badge */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">#{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-2xl font-bold text-foreground leading-tight">
                        {scenario.title}
                      </CardTitle>
                      <CardDescription 
                        className="text-base text-foreground/80 leading-relaxed break-words overflow-wrap-anywhere"
                        dangerouslySetInnerHTML={{
                          __html: scenario.description
                            .replace(/\n/g, '<br>')
                            .replace(
                              /(https?:\/\/[^\s]+)/g,
                              '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-400 underline decoration-blue-500/50 hover:decoration-blue-400 transition-colors">$1</a>'
                            )
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-2">
                  <Textarea
                    placeholder="Write your prompt here... Be specific and clear about what you want to achieve."
                    value={submission?.prompt || ""}
                    onChange={(e) => updatePrompt(scenario.id, e.target.value)}
                    rows={6}
                    disabled={isSubmitting}
                    className="text-xl md:text-xl leading-relaxed resize-y border-2 focus:border-purple-500/50 min-h-[140px] placeholder:text-xl"
                  />
                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Think about clarity, specificity, and desired outcomes when crafting your prompt.
                  </p>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Submit button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              size="lg"
              className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Evaluating Your Prompts...
                </>
              ) : (
                <>Submit All Prompts</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList>
            <TabsTrigger value="results">Your Results</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-6">
            {/* Score header */}
            <div className="text-center space-y-4 p-8 glass-card rounded-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl mb-2">
                <span className="text-3xl font-bold text-white">{totalScore}</span>
              </div>
              <h2 className="text-3xl font-bold gradient-text">
                Your Score: {totalScore}/{game.scenarios.length * 10}
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Here&apos;s how your {game.scenarios.length === 1 ? 'prompt' : 'prompts'} performed
              </p>
            </div>

            {/* Individual evaluation cards */}
            {evaluations.map((evaluation, index) => {
              const scenario = game.scenarios.find((s) => s.id === evaluation.scenarioId);
              const scenarioIndex = game.scenarios.findIndex((s) => s.id === evaluation.scenarioId);
              return (
                <Card key={evaluation.scenarioId} className="overflow-hidden border-2">
                  <CardHeader className="pb-4 space-y-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Numbered badge */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">#{scenarioIndex + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold text-foreground leading-tight">
                            {scenario?.title}
                          </CardTitle>
                        </div>
                      </div>
                      
                      {/* Score badge */}
                      <Badge 
                        variant={evaluation.score >= 7 ? "default" : "secondary"}
                        className="flex-shrink-0 px-4 py-2 text-base font-bold"
                      >
                        {evaluation.score}/10
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pt-6">
                    {/* Your Prompt */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <span className="text-purple-500">📝</span> Your Prompt
                      </h4>
                      <div className="bg-muted/80 text-foreground p-4 rounded-xl font-mono text-sm border-2 border-purple-500/20 leading-relaxed">
                        {evaluation.prompt}
                      </div>
                    </div>
                    
                    {/* Feedback */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <span className="text-blue-500">💬</span> Feedback & Suggestions
                      </h4>
                      <p className="text-base text-foreground/80 leading-relaxed p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                        {evaluation.feedback}
                      </p>
                    </div>
                    
                    {/* Refined Prompt */}
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <span className="text-green-500">✨</span> Refined Prompt Example
                      </h4>
                      <div className="bg-green-500/10 text-green-700 dark:text-green-300 p-4 rounded-xl font-mono text-sm border-2 border-green-500/30 leading-relaxed">
                        {evaluation.refinedPrompt}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Card className="overflow-hidden border-2">
              <CardHeader className="space-y-2 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                <CardTitle className="text-3xl font-bold gradient-text">
                  🏆 Leaderboard
                </CardTitle>
                <CardDescription className="text-base">
                  Rankings of all participants who completed all {game.scenarios.length} {game.scenarios.length === 1 ? 'challenge' : 'challenges'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-lg text-muted-foreground">
                      No completed submissions yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Be the first to complete all challenges!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.token}
                        className="flex items-center justify-between p-5 glass-card rounded-xl hover-lift border-2 border-transparent hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Rank badge */}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                            index === 0 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' 
                              : index === 1 
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                              : index === 2
                              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                              : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                          }`}>
                            <span className="text-xl">#{index + 1}</span>
                          </div>
                          
                          {/* Name */}
                          <div className="flex-1">
                            <span className="font-semibold text-lg text-foreground">{entry.name}</span>
                            {index < 3 && (
                              <span className="ml-2 text-xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Score */}
                          <div className="text-right">
                            <p className="font-bold text-2xl gradient-text">
                              {entry.total_score}
                              <span className="text-sm text-muted-foreground font-normal">/{game.scenarios.length * 10}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.last_submission).toLocaleDateString()} at {new Date(entry.last_submission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          
                          {/* View Button */}
                          <Button
                            onClick={() => handleViewSubmissions(entry.token)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Name Entry Dialog */}
      {showNameEntry && user && (
        <NameEntryDialog
          isOpen={showNameEntry}
          onClose={() => setShowNameEntry(false)}
          currentName={user.name}
          onNameChange={updateUserName}
          onContinue={handleNameConfirmed}
        />
      )}
      
      {/* Submission View Dialog */}
      {selectedUserToken && (
        <SubmissionViewDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          gameId={gameId}
          userToken={selectedUserToken}
        />
      )}
      </div>
    </div>
  );
}

