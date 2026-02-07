"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Response } from "@/components/ai-elements/response";

const SCENARIO = {
  title: "Product Review Summarizer",
  description: "Write a prompt that takes multiple customer reviews of a product and generates a concise summary highlighting the key pros, cons, and overall sentiment."
};

const SAMPLE_REVIEWS = [
  {
    stars: 5,
    title: "Absolutely stunning for gaming!",
    body: "The 27\" 4K display is crystal clear with vibrant colors. The 144Hz refresh rate makes gameplay incredibly smooth. HDR support is fantastic for modern games. Setup was a breeze and the stand is very sturdy. Best monitor I've ever owned!"
  },
  {
    stars: 2,
    title: "Disappointed with quality control",
    body: "Received my unit with a dead pixel in the center of the screen. The backlight bleeding in the corners is very noticeable during dark scenes. For a $500 monitor, I expected better. Customer service was unhelpful about returns. Would not recommend."
  },
  {
    stars: 4,
    title: "Great monitor, minor backlight issue",
    body: "Picture quality is excellent and colors are accurate out of the box. The USB-C hub is super convenient for my MacBook. Only complaint is slight backlight bleed in the bottom left corner, but it's only visible in completely dark rooms. Overall very satisfied."
  },
  {
    stars: 1,
    title: "Broke after 3 months",
    body: "Monitor worked great initially but developed a flickering issue after 3 months. Now it randomly turns off during use. LG warranty process is a nightmare - been waiting 6 weeks for a replacement. Save your money and buy a different brand."
  },
  {
    stars: 5,
    title: "Perfect for professional work",
    body: "As a graphic designer, color accuracy is everything. This monitor delivers 99% sRGB and the factory calibration is spot-on. The ergonomic stand lets me adjust height and tilt perfectly. Eye strain is noticeably reduced with the flicker-free technology. Worth every penny for creative professionals."
  }
];

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= stars ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}>
          ★
        </span>
      ))}
    </div>
  );
}

interface PracticeState {
  mode: 'playing' | 'results';
  prompt: string;
  evaluation: {
    score: number;
    feedback: string;
    refinedPrompt: string;
  } | null;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "from-green-500 to-green-600";
  if (score >= 6) return "from-yellow-500 to-orange-500";
  return "from-red-500 to-red-600";
}

function getScoreBorderColor(score: number): string {
  if (score >= 8) return "border-green-500/30";
  if (score >= 6) return "border-yellow-500/30";
  return "border-red-500/30";
}

function getScoreLabel(score: number): string {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  return "Needs Work";
}

export default function PracticePage() {
  const [practiceState, setPracticeState] = useState<PracticeState>({
    mode: 'playing',
    prompt: '',
    evaluation: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyReviews = async () => {
    const reviewsText = SAMPLE_REVIEWS.map((review, i) =>
      `Review ${i + 1} (${review.stars}/5 stars): "${review.title}"\n${review.body}`
    ).join('\n\n');

    await navigator.clipboard.writeText(reviewsText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const submitPrompt = async () => {
    if (!practiceState.prompt.trim()) {
      alert('Please write a prompt before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/game/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: `${SCENARIO.title}: ${SCENARIO.description}`,
          prompt: practiceState.prompt
        })
      });

      if (!response.ok) throw new Error('Failed to evaluate prompt');

      const evaluation = await response.json();
      setPracticeState(prev => ({
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

  const startFresh = () => {
    setPracticeState({
      mode: 'playing',
      prompt: '',
      evaluation: null
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/8 via-transparent to-slate-800/8 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3 gradient-text">Prompt Practice</h1>
          <p className="text-lg text-muted-foreground">Master the art of prompt engineering</p>
        </div>

        {practiceState.mode === 'playing' && (
          <div className="space-y-6">
            {/* Scenario Card */}
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">
                      Scenario
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{SCENARIO.title}</CardTitle>
                  <CardDescription className="text-lg leading-relaxed">
                    {SCENARIO.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* Sample Data Accordion */}
                <div className="border border-slate-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span className="font-medium">Sample Data: LG UltraGear Monitor Reviews</span>
                    </div>
                    {isReviewsExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {isReviewsExpanded && (
                    <div className="p-4 space-y-4 border-t border-slate-500/20">
                      {SAMPLE_REVIEWS.map((review, index) => (
                        <div key={index} className={index < SAMPLE_REVIEWS.length - 1 ? "pb-4 border-b border-slate-500/10" : ""}>
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating stars={review.stars} />
                            <span className="font-semibold text-sm">&quot;{review.title}&quot;</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {review.body}
                          </p>
                        </div>
                      ))}

                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={copyReviews}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy All Reviews
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prompt Input Card */}
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
                  value={practiceState.prompt}
                  onChange={(e) => setPracticeState(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={6}
                  className="text-lg leading-relaxed"
                />
                <div className="flex justify-center">
                  <Button
                    onClick={submitPrompt}
                    disabled={isLoading || !practiceState.prompt.trim()}
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

        {practiceState.mode === 'results' && practiceState.evaluation && (
          <div className="space-y-6">
            {/* Score Header */}
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(practiceState.evaluation.score)} shadow-xl mb-4`}>
                  <span className="text-4xl font-bold text-white">{practiceState.evaluation.score}</span>
                </div>
                <h2 className="text-3xl font-bold gradient-text mb-2">
                  Your Score: {practiceState.evaluation.score}/10
                </h2>
                <Badge className={`${getScoreBorderColor(practiceState.evaluation.score)} bg-transparent px-4 py-1.5 text-base`}>
                  {getScoreLabel(practiceState.evaluation.score)}
                </Badge>
              </CardContent>
            </Card>

            {/* Task Recap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>🎯</span> Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">{SCENARIO.title}</h3>
                  <p className="text-muted-foreground">{SCENARIO.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Editable Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-orange-500">📝</span> Your Prompt
                </CardTitle>
                <CardDescription>
                  Edit your prompt and resubmit to improve your score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={practiceState.prompt}
                  onChange={(e) => setPracticeState(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={6}
                  className="text-lg leading-relaxed font-mono"
                />
                <div className="flex justify-center">
                  <Button
                    onClick={submitPrompt}
                    disabled={isLoading || !practiceState.prompt.trim()}
                    size="lg"
                    className="px-8 py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Resubmit Prompt'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>💬</span> Feedback & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-500/5 p-4 rounded-xl border border-slate-500/20">
                  <Response className="text-lg leading-relaxed prose prose-lg max-w-none [&>*]:text-foreground/90">
                    {practiceState.evaluation.feedback}
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
                    {practiceState.evaluation.refinedPrompt}
                  </Response>
                </div>
              </CardContent>
            </Card>

            {/* Start Fresh Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={startFresh}
                variant="outline"
                size="lg"
                className="px-8 py-3"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Start Fresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
