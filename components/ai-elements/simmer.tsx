"use client";

import { cn } from "@/lib/utils";

interface SimmerProps {
  className?: string;
}

export const Simmer = ({ className }: SimmerProps) => {
  return (
    <div
      className={cn(
        "animate-pulse space-y-2",
        className
      )}
    >
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
      <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
      <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
    </div>
  );
};

Simmer.displayName = "Simmer";
