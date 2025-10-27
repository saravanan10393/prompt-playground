import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GamesPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/8 via-transparent to-slate-800/8 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="text-center max-w-2xl mx-auto">
          <div className="glass-card p-12 rounded-2xl space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-orange-500 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-foreground">Ready to Play?</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Test your prompting skills with our AI-generated scenarios. Get instant feedback and improve your techniques!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/game">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Playing
                </Button>
              </Link>
              <Link href="/playground">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Go to Playground
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

