"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface StrategyInfo {
  name: string;
  shortDescription: string;
  detailedExplanation: string;
  useCases: string[];
  keyBenefits: string[];
  exampleStructure: string;
  reference: string;
}

const STRATEGY_INFO: Record<string, StrategyInfo> = {
  "zero-shot": {
    name: "Zero-shot Prompting",
    shortDescription: "Direct task instructions without examples, relying on the model's pre-trained knowledge.",
    detailedExplanation: "Zero-shot prompting involves giving clear, direct instructions to the AI without providing any examples. The model relies entirely on its pre-trained knowledge to understand and execute the task. This approach works best when the task is straightforward and the model has sufficient training data for similar tasks.",
    useCases: [
      "Simple classification tasks",
      "Direct question answering",
      "Text summarization",
      "Basic reasoning problems",
      "Creative writing with clear instructions"
    ],
    keyBenefits: [
      "No need to provide examples",
      "Quick to implement",
      "Works well for common tasks",
      "Leverages pre-trained knowledge effectively"
    ],
    exampleStructure: "Task: [Clear instruction]\nContext: [Relevant background]\nOutput format: [Specific requirements]",
    reference: "https://www.promptingguide.ai/techniques/zeroshot"
  },
  "few-shot": {
    name: "Few-shot Prompting",
    shortDescription: "Learning from 2-3 example demonstrations to understand the desired pattern.",
    detailedExplanation: "Few-shot prompting provides the model with a small number of input-output examples (typically 2-5) to demonstrate the desired pattern or behavior. The model learns from these examples and applies the same pattern to new inputs. This is particularly effective when the task requires specific formatting, style, or reasoning patterns.",
    useCases: [
      "Learning specific output formats",
      "Style transfer tasks",
      "Complex reasoning patterns",
      "Domain-specific tasks",
      "Code generation with examples"
    ],
    keyBenefits: [
      "Demonstrates exact desired behavior",
      "Handles complex patterns well",
      "Reduces ambiguity",
      "Improves consistency"
    ],
    exampleStructure: "Example 1:\nInput: [example input]\nOutput: [example output]\n\nExample 2:\nInput: [example input]\nOutput: [example output]\n\nNow solve:\nInput: [new input]",
    reference: "https://www.promptingguide.ai/techniques/fewshot"
  },
  "chain-of-thought": {
    name: "Chain-of-Thought Prompting",
    shortDescription: "Encouraging step-by-step reasoning by breaking down complex problems into logical steps.",
    detailedExplanation: "Chain-of-thought prompting encourages the model to show its reasoning process step by step. This technique is particularly effective for complex reasoning tasks, mathematical problems, and multi-step problem solving. By making the model 'think out loud', it often produces more accurate and reliable results.",
    useCases: [
      "Mathematical problem solving",
      "Complex reasoning tasks",
      "Multi-step planning",
      "Logical deduction",
      "Scientific problem solving"
    ],
    keyBenefits: [
      "Improves accuracy on complex tasks",
      "Makes reasoning transparent",
      "Helps identify errors",
      "Enables better debugging"
    ],
    exampleStructure: "Let's think step by step:\n1. [First step]\n2. [Second step]\n3. [Continue reasoning]\nTherefore, [conclusion]",
    reference: "https://www.promptingguide.ai/techniques/cot"
  },
  "reflexion": {
    name: "Reflexion Prompting",
    shortDescription: "Self-reflection and iterative improvement cycles to enhance response quality.",
    detailedExplanation: "Reflexion prompting involves having the model evaluate and improve its own responses through self-reflection. The model first generates an answer, then reflects on its quality, identifies potential issues, and generates an improved version. This iterative process can significantly enhance the quality and accuracy of responses.",
    useCases: [
      "Complex problem solving",
      "Creative writing refinement",
      "Code debugging and optimization",
      "Academic writing",
      "Quality assurance tasks"
    ],
    keyBenefits: [
      "Self-correcting capability",
      "Higher quality outputs",
      "Identifies and fixes errors",
      "Iterative improvement"
    ],
    exampleStructure: "Initial response: [first attempt]\n\nReflection: What could be improved?\n- [identify issues]\n- [suggest improvements]\n\nRevised response: [improved version]",
    reference: "https://www.promptingguide.ai/techniques/reflexion"
  },
  "react": {
    name: "ReAct Prompting",
    shortDescription: "Reasoning + Acting framework that combines thinking with taking actions in a structured loop.",
    detailedExplanation: "ReAct (Reasoning + Acting) is a framework that combines reasoning with action-taking. The model alternates between thinking about what to do next and taking concrete actions, creating a structured loop of thought-action-observation. This is particularly useful for tasks that require tool use, multi-step problem solving, or interaction with external systems.",
    useCases: [
      "Tool-augmented tasks",
      "Multi-step problem solving",
      "Interactive problem solving",
      "Agent-based workflows",
      "Complex decision making"
    ],
    keyBenefits: [
      "Structured reasoning process",
      "Enables tool use",
      "Handles complex workflows",
      "Transparent decision making"
    ],
    exampleStructure: "Thought: [reasoning about next step]\nAction: [specific action to take]\nObservation: [result of action]\n\nThought: [reasoning about next step]\nAction: [next action]\n...",
    reference: "https://www.promptingguide.ai/techniques/react"
  },
  "tree-of-thoughts": {
    name: "Tree of Thoughts",
    shortDescription: "Exploring multiple reasoning paths systematically to find the best solution approach.",
    detailedExplanation: "Tree of Thoughts prompting encourages the model to explore multiple reasoning paths simultaneously, evaluate each approach, and select the most promising ones to develop further. This technique is particularly effective for complex problems where there might be multiple valid approaches or when the optimal solution path is not immediately obvious.",
    useCases: [
      "Complex problem solving",
      "Creative brainstorming",
      "Strategic planning",
      "Research and analysis",
      "Multi-perspective reasoning"
    ],
    keyBenefits: [
      "Explores multiple approaches",
      "Finds optimal solutions",
      "Handles complex problems",
      "Comprehensive analysis"
    ],
    exampleStructure: "Approach 1: [first reasoning path]\nApproach 2: [second reasoning path]\nApproach 3: [third reasoning path]\n\nEvaluation: [compare approaches]\nBest approach: [selected path]\nRefined solution: [developed solution]",
    reference: "https://www.promptingguide.ai/techniques/tot"
  },
  "meta-prompting": {
    name: "Meta Prompting",
    shortDescription: "Strategic prompt optimization by having the AI analyze and improve its own prompting approach.",
    detailedExplanation: "Meta prompting involves asking the AI to think about prompt engineering itself - analyzing what makes prompts effective, identifying weaknesses in current prompts, and suggesting improvements. This self-referential approach can lead to more sophisticated and effective prompts by leveraging the AI's understanding of its own capabilities and limitations.",
    useCases: [
      "Prompt optimization",
      "Strategy selection",
      "Prompt debugging",
      "Advanced prompt engineering",
      "Self-improving systems"
    ],
    keyBenefits: [
      "Self-optimizing prompts",
      "Strategic thinking",
      "Identifies prompt weaknesses",
      "Continuous improvement"
    ],
    exampleStructure: "Analyze this prompt: [current prompt]\n\nWhat makes it effective?\nWhat could be improved?\n\nSuggested improvements:\n1. [improvement 1]\n2. [improvement 2]\n\nOptimized prompt: [improved version]",
    reference: "https://www.promptingguide.ai/techniques/metaprompting"
  }
};

interface StrategyInfoCardProps {
  selectedStrategy: string;
}

export function StrategyInfoCard({ selectedStrategy }: StrategyInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedStrategy === "none" || !STRATEGY_INFO[selectedStrategy]) {
    return null;
  }

  const strategy = STRATEGY_INFO[selectedStrategy];

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">📚 Strategy Guide</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {strategy.name}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {strategy.shortDescription}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">How it works</h4>
            <p className="text-xs text-muted-foreground">
              {strategy.detailedExplanation}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">When to use</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {strategy.useCases.map((useCase, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {useCase}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Key benefits</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {strategy.keyBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Example structure</h4>
            <div className="p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
              {strategy.exampleStructure}
            </div>
          </div>

          <div className="pt-2 border-t">
            <a
              href={strategy.reference}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
