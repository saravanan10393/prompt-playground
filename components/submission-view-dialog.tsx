"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Submission {
  id: number;
  scenario_id: number;
  prompt: string;
  score: number;
  feedback: string;
  refined_prompt: string | null;
  scenario_title: string;
  scenario_description: string;
  order_index: number;
}

interface SubmissionData {
  user: {
    name: string;
    token: string;
  };
  game: {
    title: string;
    scenarios: number;
  };
  submissions: Submission[];
  totalScore: number;
  maxScore: number;
}

interface SubmissionViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: number;
  userToken: string;
}

export function SubmissionViewDialog({
  isOpen,
  onClose,
  gameId,
  userToken,
}: SubmissionViewDialogProps) {
  const [data, setData] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && gameId && userToken) {
      fetchSubmissions();
    }
  }, [isOpen, gameId, userToken]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/games/${gameId}/submissions/${userToken}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch submissions");
      }
      
      const submissionData = await response.json();
      setData(submissionData);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError(error instanceof Error ? error.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setData(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Submissions</DialogTitle>
          <DialogDescription>
            View all submitted prompts and scores for this user
          </DialogDescription>
        </DialogHeader>
        
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading submissions...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSubmissions} variant="outline">
              Try Again
            </Button>
          </div>
        )}
        
        {data && !isLoading && (
          <div className="space-y-6">
            {/* User Info Header */}
            <div className="text-center space-y-2 p-4">
              <h2 className="text-xl font-bold text-foreground">
                Name: {data.user.name}
              </h2>
            </div>

            {/* Submissions */}
            <div className="space-y-4">
              {data.submissions.map((submission, index) => (
                <div key={submission.id} className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Prompt:
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 text-foreground leading-relaxed">
                    {submission.prompt}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
