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
        const evals = data.userSubmissions.map((sub: any) => ({
          scenarioId: sub.scenario_id,
          prompt: sub.prompt,
          score: sub.score,
          feedback: sub.feedback,
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Game not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{game.title}</h1>
        <p className="text-muted-foreground">Created by {game.creator_name}</p>
      </div>

      {!hasSubmitted ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Write Your Prompts</CardTitle>
              <CardDescription>
                Write a prompt for each scenario below. All prompts will be evaluated together after submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {game.scenarios.map((scenario, index) => {
                const submission = submissions.find((s) => s.scenarioId === scenario.id);
                return (
                  <div key={scenario.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Scenario {index + 1}: {scenario.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {scenario.description}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {submission?.prompt.trim() ? "✓" : "Empty"}
                      </Badge>
                    </div>
                    <Textarea
                      placeholder="Write your prompt here..."
                      value={submission?.prompt || ""}
                      onChange={(e) => updatePrompt(scenario.id, e.target.value)}
                      rows={6}
                      disabled={isSubmitting}
                    />
                  </div>
                );
              })}
              
              <Button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? "Evaluating..." : "Submit All Prompts"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList>
            <TabsTrigger value="results">Your Results</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Score: {totalScore}/30</CardTitle>
                <CardDescription>
                  Here's how your prompts performed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {evaluations.map((evaluation, index) => {
                  const scenario = game.scenarios.find((s) => s.id === evaluation.scenarioId);
                  return (
                    <div key={evaluation.scenarioId} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          Scenario {index + 1}: {scenario?.title}
                        </h3>
                        <Badge variant={evaluation.score >= 7 ? "default" : "secondary"}>
                          Score: {evaluation.score}/10
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Your Prompt:</h4>
                        <p className="text-sm bg-muted p-3 rounded font-mono">
                          {evaluation.prompt}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Feedback & Suggestions:</h4>
                        <p className="text-sm text-muted-foreground">
                          {evaluation.feedback}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Refined Prompt Example:</h4>
                        <p className="text-sm bg-green-50 dark:bg-green-950 p-3 rounded font-mono border border-green-200 dark:border-green-800">
                          {evaluation.refinedPrompt}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  Rankings of all participants who completed all scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No completed submissions yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.token}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{entry.total_score}/30</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.last_submission).toLocaleString()}
                          </p>
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
    </div>
  );
}

