import { ReactNode } from "react";

interface StrategyCardProps {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  children: ReactNode;
}

export function StrategyCard({ id, icon, title, tagline, difficulty, color, children }: StrategyCardProps) {
  const difficultyColors = {
    Beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    Intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const gradientColors = {
    yellow: "from-yellow-500 to-yellow-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    teal: "from-teal-500 to-teal-600",
    green: "from-green-500 to-green-600",
    pink: "from-pink-500 to-pink-600",
  };

  const gradient = gradientColors[color as keyof typeof gradientColors] || gradientColors.orange;

  return (
    <section id={id} className="scroll-mt-24 py-16 border-b border-slate-500/10 last:border-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg text-3xl`}>
            {icon}
          </div>

          {/* Title and badges */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${difficultyColors[difficulty]}`}>
                {difficulty}
              </span>
            </div>
            <p className="text-lg text-muted-foreground italic">&quot;{tagline}&quot;</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {children}
      </div>
    </section>
  );
}
