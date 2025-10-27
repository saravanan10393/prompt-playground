import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Hero gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/15 via-transparent to-slate-800/15 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative min-h-[calc(100vh-4rem)] flex items-center">
        <div className="max-w-4xl mx-auto text-center space-y-12 w-full">
          {/* Hero Section */}
          <div className="space-y-8">
            <h1 className="text-6xl font-bold tracking-tight gradient-text animate-gradient bg-gradient-to-r from-slate-500 via-slate-600 to-orange-400">
              Prompt Playground
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Master the art of prompt engineering through games and experimentation
            </p>
          </div>
          
          {/* Navigation Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Game Card */}
            <Link href="/game" className="group">
              <div className="glass-card p-8 rounded-2xl space-y-6 hover-lift transition-all duration-300 group-hover:scale-105">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-orange-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Game</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Test your prompting skills with AI-generated scenarios. Get instant feedback and improve your techniques.
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Start Playing
                </Button>
              </div>
            </Link>

            {/* Playground Card */}
            <Link href="/playground" className="group">
              <div className="glass-card p-8 rounded-2xl space-y-6 hover-lift transition-all duration-300 group-hover:scale-105">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-orange-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Playground</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Experiment with different models, strategies, and prompting techniques in a sandbox environment.
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Start Experimenting
                </Button>
              </div>
            </Link>

            {/* Strategies Card */}
            <Link href="/strategies" className="group">
              <div className="glass-card p-8 rounded-2xl space-y-6 hover-lift transition-all duration-300 group-hover:scale-105">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-orange-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Strategies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Learn proven prompting strategies with examples, best practices, and interactive demonstrations.
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  Learn Strategies
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
