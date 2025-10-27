"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeExampleBlockProps {
  code: string;
  title?: string;
  category?: string;
  language?: string;
}

export function CodeExampleBlock({ code, title, category, language = "text" }: CodeExampleBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-600/30 overflow-hidden bg-[#22293a] shadow-lg">
      {/* Header */}
      {(title || category) && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#2a3142] border-b border-slate-600/40">
          <div className="flex items-center gap-2">
            {title && <span className="text-sm font-semibold text-slate-50">{title}</span>}
            {category && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {category}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 hover:bg-slate-700/50"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1 text-green-400" />
                <span className="text-xs text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Code Block */}
      <div className="p-4 overflow-x-auto bg-[#22293a]">
        <pre className="text-sm leading-relaxed font-mono">
          <code className={`language-${language} text-slate-100`}>
            {code}
          </code>
        </pre>
      </div>

      {/* Copy button for mobile (when no header) */}
      {!title && !category && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 bg-[#2a3142] hover:bg-slate-600"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
