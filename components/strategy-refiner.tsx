"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StrategyRefinerProps {
  isOpen: boolean;
  onClose: () => void;
  original: string;
  refined: string;
  explanation: string;
  strategy: string;
  onUseRefined: (refined: string) => void;
}

export function StrategyRefiner({
  isOpen,
  onClose,
  original,
  refined,
  explanation,
  strategy,
  onUseRefined,
}: StrategyRefinerProps) {
  const handleUse = () => {
    onUseRefined(refined);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Refined Prompt
            <Badge variant="secondary">{strategy}</Badge>
          </DialogTitle>
          <DialogDescription>{explanation}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Original Prompt</h4>
            <Textarea
              value={original}
              readOnly
              className="bg-muted"
              rows={4}
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Refined Prompt</h4>
            <Textarea
              value={refined}
              readOnly
              rows={8}
              className="bg-muted font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUse}>
              Use Refined Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

