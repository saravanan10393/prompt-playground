import { ReactNode } from "react";

interface UseCaseCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
}

export function UseCaseCard({ icon, title, description, color = "orange" }: UseCaseCardProps) {
  const colorClasses = {
    orange: "from-orange-500/10 to-orange-600/5 border-orange-500/30",
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/30",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/30",
    green: "from-green-500/10 to-green-600/5 border-green-500/30",
    teal: "from-teal-500/10 to-teal-600/5 border-teal-500/30",
    pink: "from-pink-500/10 to-pink-600/5 border-pink-500/30",
    yellow: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/30",
  };

  const iconColorClasses = {
    orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
    green: "from-green-500 to-green-600 shadow-green-500/20",
    teal: "from-teal-500 to-teal-600 shadow-teal-500/20",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/20",
    yellow: "from-yellow-500 to-yellow-600 shadow-yellow-500/20",
  };

  const gradientClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.orange;
  const iconGradient = iconColorClasses[color as keyof typeof iconColorClasses] || iconColorClasses.orange;

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${gradientClass} border hover:scale-[1.02] transition-transform`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
