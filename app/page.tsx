import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6 mb-16">
            <h1 className="text-6xl font-bold tracking-tight gradient-text animate-gradient bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
              Master Prompt Engineering
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Improve your prompt engineering skills through competitive games and hands-on experimentation 
              with multiple GPT models and proven prompting strategies.
            </p>
          </div>
          
          {/* Main Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="glass-card p-8 rounded-2xl space-y-4 hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">Competitive Games</h2>
              <p className="text-gray-400">
                Test your prompt writing skills against other users. Write prompts for scenarios, 
                get AI-powered feedback, and climb the leaderboard.
              </p>
              <Link href="/games">
                <Button size="lg" className="w-full mt-4">
                  Play Games
                </Button>
              </Link>
            </div>
            
            <div className="glass-card p-8 rounded-2xl space-y-4 hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">Playground</h2>
              <p className="text-gray-400">
                Experiment with different models, temperatures, and prompting strategies. 
                Apply zero-shot, few-shot, chain-of-thought, and ReAct techniques.
              </p>
              <Link href="/playground">
                <Button size="lg" variant="outline" className="w-full mt-4">
                  Open Playground
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Features Section */}
          {/* <div className="mt-16 glass-card p-8 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-8 gradient-text">Features</h3>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-3 group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h4 className="font-semibold text-white text-lg">Real-time Evaluation</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Get instant AI-powered feedback on your prompts with scores and improvement suggestions
                </p>
              </div>
              <div className="space-y-3 group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🚀
                </div>
                <h4 className="font-semibold text-white text-lg">Multiple Models</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Test with GPT-4o, O1, O3, and their mini variants to see how different models respond
                </p>
              </div>
              <div className="space-y-3 group">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📚
                </div>
                <h4 className="font-semibold text-white text-lg">Proven Strategies</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Learn and apply industry-standard prompting techniques with real-time refinement
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
