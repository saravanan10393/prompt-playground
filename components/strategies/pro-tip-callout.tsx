import { Lightbulb, AlertTriangle, XCircle } from "lucide-react";

interface ProTipCalloutProps {
  tips: string[];
  mistakes?: string[];
  whenNotToUse?: string;
}

export function ProTipCallout({ tips, mistakes, whenNotToUse }: ProTipCalloutProps) {
  return (
    <div className="space-y-4">
      {/* Pro Tips */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">Pro Tips</h4>
            <ul className="space-y-1.5">
              {tips.map((tip, index) => (
                <li key={index} className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Common Mistakes */}
      {mistakes && mistakes.length > 0 && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-2 border-yellow-500/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-2">Common Mistakes to Avoid</h4>
              <ul className="space-y-1.5">
                {mistakes.map((mistake, index) => (
                  <li key={index} className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* When NOT to Use */}
      {whenNotToUse && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">When NOT to Use</h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{whenNotToUse}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
