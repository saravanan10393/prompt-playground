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
    <div className="space-y-6">
      {/* Prompts Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="text-xs font-semibold text-red-400">Before</span>
            </div>
            <span className="text-sm text-muted-foreground">Basic Prompt</span>
          </div>
          <CodeExampleBlock code={beforePrompt} />
        </div>

        {/* Arrow (desktop) */}
        <div className="hidden md:flex items-center justify-center absolute left-1/2 top-12 transform -translate-x-1/2 z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* After */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="text-xs font-semibold text-green-400">After</span>
            </div>
            <span className="text-sm text-muted-foreground">Enhanced with Strategy</span>
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

          <div className="grid md:grid-cols-2 gap-4">
            {/* Before Result */}
            {beforeResult && (
              <div className="p-4 rounded-xl bg-[#22293a] border border-slate-600/30 shadow-md">
                <div className="text-xs font-medium text-muted-foreground mb-2">Basic Response:</div>
                <p className="text-sm text-slate-100 leading-relaxed italic">{beforeResult}</p>
              </div>
            )}

            {/* After Result */}
            {afterResult && (
              <div className="p-4 rounded-xl bg-[#22293a] border-2 border-green-500/50 shadow-md shadow-green-500/10">
                <div className="text-xs font-medium text-green-400 mb-2">Enhanced Response:</div>
                <p className="text-sm text-slate-100 leading-relaxed">{afterResult}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
