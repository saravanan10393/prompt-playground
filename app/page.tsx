import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Master Prompt Engineering
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Improve your prompt engineering skills through competitive games and hands-on experimentation 
          with multiple GPT models and proven prompting strategies.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="p-6 border rounded-lg space-y-4 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold">Competitive Games</h2>
            <p className="text-muted-foreground">
              Test your prompt writing skills against other users. Write prompts for scenarios, 
              get AI-powered feedback, and climb the leaderboard.
            </p>
            <Link href="/games">
              <Button size="lg" className="w-full">
                Play Games
              </Button>
            </Link>
          </div>
          
          <div className="p-6 border rounded-lg space-y-4 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold">Playground</h2>
            <p className="text-muted-foreground">
              Experiment with different models, temperatures, and prompting strategies. 
              Apply zero-shot, few-shot, chain-of-thought, and ReAct techniques.
            </p>
            <Link href="/playground">
              <Button size="lg" variant="outline" className="w-full">
                Open Playground
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-16 p-8 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-medium mb-2">🎯 Real-time Evaluation</h4>
              <p className="text-sm text-muted-foreground">
                Get instant AI-powered feedback on your prompts with scores and improvement suggestions
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚀 Multiple Models</h4>
              <p className="text-sm text-muted-foreground">
                Test with GPT-4o, O1, O3, and their mini variants to see how different models respond
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📚 Proven Strategies</h4>
              <p className="text-sm text-muted-foreground">
                Learn and apply industry-standard prompting techniques with real-time refinement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
