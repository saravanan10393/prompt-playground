"use client";

import { ArrowRight } from "lucide-react";
import { CodeExampleBlock } from "./code-example-block";

interface BeforeAfterComparisonProps {
  beforePrompt: string;
  afterPrompt: string;
  beforeResult?: string;
  afterResult?: string;
}

export function BeforeAfterComparison({
  beforePrompt,
  afterPrompt,
  beforeResult,
  afterResult,
}: BeforeAfterComparisonProps) {
  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Prompts Comparison */}
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4 relative">
        {/* Before */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="text-xs font-semibold text-red-400">Before</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Basic Prompt</span>
          </div>
          <CodeExampleBlock code={beforePrompt} />
        </div>

        {/* Arrow (desktop only) - positioned relative to grid */}
        <div className="hidden md:flex items-start justify-center md:absolute md:left-1/2 md:top-12 md:transform md:-translate-x-1/2 md:z-10 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* After */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="text-xs font-semibold text-green-400">After</span>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">Enhanced with Strategy</span>
          </div>
          <CodeExampleBlock code={afterPrompt} />
        </div>
      </div>

      {/* Results Comparison (if provided) */}
      {(beforeResult || afterResult) && (
        <>
          <div className="flex items-center gap-3 pt-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
            <span className="text-sm font-medium text-muted-foreground">Expected Results</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {/* Before Result */}
            {beforeResult && (
              <div className="p-3 sm:p-4 rounded-xl bg-[#22293a] border border-slate-600/30 shadow-md min-w-0">
                <div className="text-xs font-medium text-muted-foreground mb-2">Basic Response:</div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed italic break-words">{beforeResult}</p>
              </div>
            )}

            {/* After Result */}
            {afterResult && (
              <div className="p-3 sm:p-4 rounded-xl bg-[#22293a] border-2 border-green-500/50 shadow-md shadow-green-500/10 min-w-0">
                <div className="text-xs font-medium text-green-400 mb-2">Enhanced Response:</div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed break-words">{afterResult}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
