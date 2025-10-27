interface StrategyDiagramProps {
  type: "zero-shot" | "few-shot" | "chain-of-thought" | "react" | "reflexion" | "tree-of-thoughts" | "meta-prompting";
}

export function StrategyDiagram({ type }: StrategyDiagramProps) {
  const diagrams = {
    "zero-shot": (
      <svg viewBox="0 0 400 120" className="w-full max-w-md mx-auto">
        {/* Instruction box */}
        <rect x="20" y="40" width="120" height="40" rx="8" fill="#F59E0B20" stroke="#F59E0B" strokeWidth="2" />
        <text x="80" y="65" textAnchor="middle" fill="#D97706" className="text-sm font-semibold">Instruction</text>

        {/* Arrow */}
        <path d="M 150 60 L 230 60" stroke="#F97316" strokeWidth="3" markerEnd="url(#arrowhead)" />

        {/* Output box */}
        <rect x="240" y="40" width="120" height="40" rx="8" fill="#10B98120" stroke="#10B981" strokeWidth="2" />
        <text x="300" y="65" textAnchor="middle" fill="#059669" className="text-sm font-semibold">Output</text>

        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),

    "few-shot": (
      <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto">
        {/* Examples */}
        <rect x="20" y="20" width="100" height="30" rx="6" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="70" y="40" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Example 1</text>

        <rect x="20" y="60" width="100" height="30" rx="6" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="70" y="80" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Example 2</text>

        <rect x="20" y="100" width="100" height="30" rx="6" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="70" y="120" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Example 3</text>

        {/* Arrows to pattern */}
        <path d="M 130 35 Q 170 35 180 70" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead2)" />
        <path d="M 130 75 L 180 75" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead2)" />
        <path d="M 130 115 Q 170 115 180 80" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead2)" />

        {/* Pattern box */}
        <rect x="190" y="60" width="80" height="30" rx="6" fill="#A855F720" stroke="#A855F7" strokeWidth="2" />
        <text x="230" y="80" textAnchor="middle" fill="#9333EA" className="text-xs font-semibold">Pattern</text>

        {/* Arrow to output */}
        <path d="M 280 75 L 330 75" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead2)" />

        {/* Output */}
        <rect x="340" y="60" width="80" height="30" rx="6" fill="#10B98120" stroke="#10B981" strokeWidth="2" />
        <text x="380" y="80" textAnchor="middle" fill="#059669" className="text-xs font-semibold">Output</text>

        <defs>
          <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),

    "chain-of-thought": (
      <svg viewBox="0 0 500 100" className="w-full max-w-2xl mx-auto">
        {/* Problem */}
        <rect x="10" y="30" width="80" height="40" rx="8" fill="#A855F720" stroke="#A855F7" strokeWidth="2" />
        <text x="50" y="55" textAnchor="middle" fill="#9333EA" className="text-xs font-semibold">Problem</text>

        {/* Steps */}
        <rect x="120" y="30" width="70" height="40" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="155" y="55" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Step 1</text>

        <rect x="220" y="30" width="70" height="40" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="255" y="55" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Step 2</text>

        <rect x="320" y="30" width="70" height="40" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="355" y="55" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Step 3</text>

        {/* Solution */}
        <rect x="420" y="30" width="80" height="40" rx="8" fill="#10B98120" stroke="#10B981" strokeWidth="2" />
        <text x="460" y="55" textAnchor="middle" fill="#059669" className="text-xs font-semibold">Solution</text>

        {/* Arrows */}
        <path d="M 95 50 L 115 50" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead3)" />
        <path d="M 195 50 L 215 50" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead3)" />
        <path d="M 295 50 L 315 50" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead3)" />
        <path d="M 395 50 L 415 50" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead3)" />

        <defs>
          <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),

    "react": (
      <svg viewBox="0 0 300 250" className="w-full max-w-sm mx-auto">
        {/* Cycle */}
        <circle cx="150" cy="125" r="100" fill="none" stroke="#F9731620" strokeWidth="2" strokeDasharray="5,5" />

        {/* Thought */}
        <rect x="110" y="20" width="80" height="35" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="150" y="42" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Thought</text>

        {/* Action */}
        <rect x="220" y="105" width="70" height="35" rx="8" fill="#F9731620" stroke="#F97316" strokeWidth="2" />
        <text x="255" y="127" textAnchor="middle" fill="#EA580C" className="text-xs font-semibold">Action</text>

        {/* Observation */}
        <rect x="110" y="195" width="80" height="35" rx="8" fill="#10B98120" stroke="#10B981" strokeWidth="2" />
        <text x="150" y="217" textAnchor="middle" fill="#059669" className="text-xs font-semibold">Observation</text>

        {/* Repeat */}
        <rect x="10" y="105" width="70" height="35" rx="8" fill="#A855F720" stroke="#A855F7" strokeWidth="2" />
        <text x="45" y="127" textAnchor="middle" fill="#9333EA" className="text-xs font-semibold">Repeat</text>

        {/* Arrows */}
        <path d="M 190 55 Q 240 80 220 105" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead4)" />
        <path d="M 220 140 Q 180 180 150 195" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead4)" />
        <path d="M 110 213 Q 60 170 45 140" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead4)" />
        <path d="M 45 105 Q 80 50 110 38" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead4)" />

        <defs>
          <marker id="arrowhead4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),

    "reflexion": (
      <svg viewBox="0 0 400 180" className="w-full max-w-lg mx-auto">
        {/* Try */}
        <rect x="20" y="70" width="60" height="35" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="50" y="92" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Try</text>

        {/* Evaluate */}
        <rect x="110" y="70" width="70" height="35" rx="8" fill="#A855F720" stroke="#A855F7" strokeWidth="2" />
        <text x="145" y="92" textAnchor="middle" fill="#9333EA" className="text-xs font-semibold">Evaluate</text>

        {/* Reflect */}
        <rect x="210" y="70" width="70" height="35" rx="8" fill="#14B8A620" stroke="#14B8A6" strokeWidth="2" />
        <text x="245" y="92" textAnchor="middle" fill="#0D9488" className="text-xs font-semibold">Reflect</text>

        {/* Improve */}
        <rect x="310" y="70" width="70" height="35" rx="8" fill="#F59E0B20" stroke="#F59E0B" strokeWidth="2" />
        <text x="345" y="92" textAnchor="middle" fill="#D97706" className="text-xs font-semibold">Improve</text>

        {/* Arrows forward */}
        <path d="M 85 87 L 105 87" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead5)" />
        <path d="M 185 87 L 205 87" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead5)" />
        <path d="M 285 87 L 305 87" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead5)" />

        {/* Loop back arrow */}
        <path d="M 345 105 Q 200 145 50 105" stroke="#F97316" strokeWidth="2" fill="none" markerEnd="url(#arrowhead5)" strokeDasharray="5,3" />
        <text x="200" y="150" textAnchor="middle" fill="#EA580C" className="text-xs italic">Retry with improvements</text>

        <defs>
          <marker id="arrowhead5" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),

    "tree-of-thoughts": (
      <svg viewBox="0 0 400 220" className="w-full max-w-lg mx-auto">
        {/* Root */}
        <rect x="160" y="10" width="80" height="35" rx="8" fill="#10B98120" stroke="#10B981" strokeWidth="2" />
        <text x="200" y="32" textAnchor="middle" fill="#059669" className="text-xs font-semibold">Problem</text>

        {/* Branch 1 */}
        <rect x="30" y="90" width="80" height="35" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="70" y="112" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Path A</text>

        {/* Branch 2 */}
        <rect x="160" y="90" width="80" height="35" rx="8" fill="#A855F720" stroke="#A855F7" strokeWidth="2" />
        <text x="200" y="112" textAnchor="middle" fill="#9333EA" className="text-xs font-semibold">Path B</text>

        {/* Branch 3 */}
        <rect x="290" y="90" width="80" height="35" rx="8" fill="#EC489920" stroke="#EC4899" strokeWidth="2" />
        <text x="330" y="112" textAnchor="middle" fill="#DB2777" className="text-xs font-semibold">Path C</text>

        {/* Evaluation */}
        <rect x="145" y="170" width="110" height="35" rx="8" fill="#F9731620" stroke="#F97316" strokeWidth="2" />
        <text x="200" y="192" textAnchor="middle" fill="#EA580C" className="text-xs font-semibold">Best Solution</text>

        {/* Connecting lines */}
        <path d="M 180 45 L 70 90" stroke="#10B98180" strokeWidth="2" />
        <path d="M 200 45 L 200 90" stroke="#10B98180" strokeWidth="2" />
        <path d="M 220 45 L 330 90" stroke="#10B98180" strokeWidth="2" />

        <path d="M 70 125 L 180 170" stroke="#F9731680" strokeWidth="2" markerEnd="url(#arrowhead6)" />
        <path d="M 200 125 L 200 170" stroke="#F97316" strokeWidth="3" markerEnd="url(#arrowhead6)" />
        <path d="M 330 125 L 220 170" stroke="#F9731680" strokeWidth="2" markerEnd="url(#arrowhead6)" />

        <defs>
          <marker id="arrowhead6" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),

    "meta-prompting": (
      <svg viewBox="0 0 400 140" className="w-full max-w-lg mx-auto">
        {/* Role */}
        <rect x="20" y="50" width="80" height="40" rx="8" fill="#EC489920" stroke="#EC4899" strokeWidth="2" />
        <text x="60" y="75" textAnchor="middle" fill="#DB2777" className="text-xs font-semibold">Role</text>

        {/* Task */}
        <rect x="130" y="50" width="80" height="40" rx="8" fill="#A855F720" stroke="#A855F7" strokeWidth="2" />
        <text x="170" y="75" textAnchor="middle" fill="#9333EA" className="text-xs font-semibold">Task</text>

        {/* Format */}
        <rect x="240" y="50" width="80" height="40" rx="8" fill="#3B82F620" stroke="#3B82F6" strokeWidth="2" />
        <text x="280" y="75" textAnchor="middle" fill="#2563EB" className="text-xs font-semibold">Format</text>

        {/* Output */}
        <rect x="330" y="50" width="60" height="40" rx="8" fill="#10B98120" stroke="#10B981" strokeWidth="2" />
        <text x="360" y="75" textAnchor="middle" fill="#059669" className="text-xs font-semibold">Output</text>

        {/* Arrows */}
        <path d="M 105 70 L 125 70" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead7)" />
        <path d="M 215 70 L 235 70" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead7)" />
        <path d="M 325 70 L 325 70" stroke="#F97316" strokeWidth="2" markerEnd="url(#arrowhead7)" />

        <defs>
          <marker id="arrowhead7" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#F97316" />
          </marker>
        </defs>
      </svg>
    ),
  };

  return (
    <div className="p-6 rounded-xl bg-slate-900/20 border border-slate-500/10">
      <h4 className="text-sm font-semibold text-muted-foreground mb-4 text-center">How it works</h4>
      {diagrams[type]}
    </div>
  );
}
