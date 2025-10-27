"use client";

import { cn } from "@/lib/utils";

interface SimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export const Simmer = ({ className, children }: SimmerProps) => {
  return (
    <div className={cn("animate-pulse", className)}>
      {children || (
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
      )}
    </div>
  );
};

Simmer.displayName = "Simmer";
