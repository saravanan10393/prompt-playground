export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16 relative min-h-screen flex items-center">
        <div className="max-w-5xl mx-auto text-center space-y-12 w-full">
          {/* Hero Section */}
          <div className="space-y-8">
            <h1 className="text-7xl font-bold tracking-tight gradient-text animate-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
              Prompt Playground
            </h1>
            
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master the art of prompt engineering through competitive games and hands-on experimentation
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl space-y-4 hover-lift group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Competitive Games</h3>
              <p className="text-muted-foreground leading-relaxed">
                Challenge yourself with scenario-based prompt writing. Get AI-powered feedback, scores, and climb the leaderboard.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl space-y-4 hover-lift group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Experimentation Lab</h3>
              <p className="text-muted-foreground leading-relaxed">
                Test different models, temperatures, and advanced prompting strategies in a sandbox environment.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl space-y-4 hover-lift group">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Proven Techniques</h3>
              <p className="text-muted-foreground leading-relaxed">
                Learn and apply industry-standard approaches: zero-shot, few-shot, chain-of-thought, and ReAct.
              </p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mt-16 glass-card p-10 rounded-2xl">
            <h2 className="text-3xl font-semibold mb-8 gradient-text">Why Prompt Engineering Matters</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg mb-1">Unlock AI Potential</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Better prompts lead to more accurate, useful, and creative AI responses
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg mb-1">Boost Productivity</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Save time and effort by crafting prompts that work right the first time
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg mb-1">Learn by Doing</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Practice with real scenarios and get instant feedback on your techniques
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg mb-1">Community Learning</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Compare your approaches with others and discover new strategies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
