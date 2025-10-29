"use client";

import { BookOpen, Code, Lightbulb, MessageSquare, PenTool, FileText, Sparkles } from "lucide-react";
import { StrategyCard } from "@/components/strategies/strategy-card";
import { BeforeAfterComparison } from "@/components/strategies/before-after-comparison";
import { CodeExampleBlock } from "@/components/strategies/code-example-block";
import { InteractivePromptTester } from "@/components/strategies/interactive-prompt-tester";
import { ProTipCallout } from "@/components/strategies/pro-tip-callout";
import { StrategyDiagram } from "@/components/strategies/strategy-diagram";
import { TableOfContents } from "@/components/strategies/table-of-contents";
import { UseCaseCard } from "@/components/strategies/use-case-card";

const tocItems = [
  { id: "zero-shot", title: "Zero-shot", icon: "⚡", color: "yellow" },
  { id: "few-shot", title: "Few-shot", icon: "📚", color: "blue" },
  { id: "chain-of-thought", title: "Chain-of-Thought", icon: "🔗", color: "purple" },
  { id: "react", title: "ReAct", icon: "🎯", color: "orange" },
  { id: "reflexion", title: "Reflexion", icon: "🔄", color: "teal" },
  { id: "tree-of-thoughts", title: "Tree of Thoughts", icon: "🌳", color: "green" },
  { id: "meta-prompting", title: "Meta Prompting", icon: "🎭", color: "pink" },
];

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-transparent via-transparent to-slate-900/5 overflow-x-hidden">
      {/* Hero Header */}
      <div className="border-b border-slate-500/20 bg-gradient-to-r from-orange-500/10 via-transparent to-purple-500/10">
        <div className="container mx-auto px-3 sm:px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  Complete Guide
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              Master the Art of Prompting
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Learn 7 powerful prompting strategies with interactive examples and real-world use cases.
              From beginners to experts, discover techniques that will transform how you work with AI.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-12">
        <div className="flex gap-8">
          {/* Left Sidebar - Table of Contents (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents items={tocItems} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl w-full min-w-0">
            {/* Zero-shot Strategy */}
            <StrategyCard
              id="zero-shot"
              icon="⚡"
              title="Zero-shot"
              tagline="Clear instructions, instant results"
              difficulty="Beginner"
              color="yellow"
            >
              {/* What is it */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Zero-shot?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Zero-shot prompting means giving the AI clear, direct instructions without providing any examples.
                  It&apos;s the simplest and most straightforward approach - you tell the AI exactly what you want,
                  and it delivers based purely on its training.
                </p>
                <StrategyDiagram type="zero-shot" />
              </div>

              {/* When to use */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use Zero-shot?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<MessageSquare className="w-5 h-5 text-white" />}
                    title="Quick Answers"
                    description="Get immediate responses to straightforward questions or simple tasks."
                    color="yellow"
                  />
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Content Generation"
                    description="Create emails, summaries, or basic content with clear specifications."
                    color="yellow"
                  />
                  <UseCaseCard
                    icon={<Code className="w-5 h-5 text-white" />}
                    title="Simple Commands"
                    description="Execute direct tasks like translations, formatting, or basic coding."
                    color="yellow"
                  />
                  <UseCaseCard
                    icon={<PenTool className="w-5 h-5 text-white" />}
                    title="Creative Writing"
                    description="Generate stories, poems, or creative content with specific guidelines."
                    color="yellow"
                  />
                </div>
              </div>

              {/* Before/After */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Write an email to a customer"
                  afterPrompt={`Write a professional email to a customer with the following requirements:
- Tone: Friendly yet professional
- Purpose: Apologize for delayed shipment
- Include: Estimated delivery date (May 15th), discount code for next purchase (SAVE20)
- Length: 3-4 paragraphs
- Signature: Use company name "TechStore"`}
                  beforeResult="Basic email without clear direction or structure..."
                  afterResult="Well-structured, professional email with all required elements, appropriate tone, and proper formatting."
                />
              </div>

              {/* Example Prompts */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Email Writing"
                    category="Business"
                    code={`Write a professional email to schedule a meeting with a client. Include:
- Greeting with client's name (John)
- Purpose: Discuss Q2 product roadmap
- Suggest 3 time slots next week
- Keep it under 150 words
- Professional but friendly tone`}
                  />
                  <CodeExampleBlock
                    title="Content Summarization"
                    category="Content"
                    code={`Summarize this article in 3 bullet points, focusing on:
- Main findings
- Key statistics
- Actionable takeaways
Keep each bullet point under 20 words.`}
                  />
                </div>
              </div>

              {/* Interactive Tester */}
              <InteractivePromptTester
                strategy="zero-shot"
                placeholder="Try: 'Write a product description for wireless headphones'"
              />

              {/* Pro Tips */}
              <ProTipCallout
                tips={[
                  "Be specific about tone, length, and format requirements",
                  "Include concrete details instead of vague descriptions",
                  "Specify the output structure (bullet points, paragraphs, etc.)",
                  "Define your audience to help the AI adjust appropriately"
                ]}
                mistakes={[
                  "Being too vague (e.g., 'write something good')",
                  "Assuming the AI knows your context without explaining",
                  "Not specifying format or length, leading to inconsistent results"
                ]}
                whenNotToUse="Avoid zero-shot for complex tasks requiring specific patterns, formats that need examples to understand, or when you need the AI to follow a very particular style."
              />
            </StrategyCard>

            {/* Few-shot Strategy */}
            <StrategyCard
              id="few-shot"
              icon="📚"
              title="Few-shot"
              tagline="Learn by example"
              difficulty="Beginner"
              color="blue"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Few-shot?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Few-shot prompting provides the AI with 2-3 example input-output pairs before asking it to complete your task.
                  The AI learns the pattern from your examples and applies it to new inputs. It&apos;s like showing someone how to do something
                  a few times before asking them to do it themselves.
                </p>
                <StrategyDiagram type="few-shot" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use Few-shot?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Formatting Tasks"
                    description="Transform data into specific formats by showing examples of desired output."
                    color="blue"
                  />
                  <UseCaseCard
                    icon={<PenTool className="w-5 h-5 text-white" />}
                    title="Style Matching"
                    description="Replicate a particular writing style, tone, or voice consistently."
                    color="blue"
                  />
                  <UseCaseCard
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    title="Pattern Recognition"
                    description="Classify or categorize items based on demonstrated patterns."
                    color="blue"
                  />
                  <UseCaseCard
                    icon={<Code className="w-5 h-5 text-white" />}
                    title="Code Generation"
                    description="Generate code following specific conventions shown in examples."
                    color="blue"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Convert product descriptions to bullet points"
                  afterPrompt={`Convert product descriptions to bullet points following this format:

Example 1:
Input: "This comfortable cotton t-shirt is perfect for everyday wear. Features a classic crew neck and comes in 5 colors."
Output:
• Material: 100% cotton
• Style: Classic crew neck
• Use: Everyday wear
• Colors: 5 options available

Example 2:
Input: "Premium leather wallet with RFID protection, multiple card slots, and coin compartment. Dimensions: 4.5 x 3.5 inches."
Output:
• Material: Premium leather
• Feature: RFID protection
• Storage: Multiple card slots, coin compartment
• Size: 4.5 x 3.5 inches

Now convert this:
"Wireless noise-cancelling headphones with 30-hour battery life, comfortable over-ear design, and included carrying case."`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Customer Service Responses"
                    category="Support"
                    code={`Respond to customer inquiries using this template:

Example 1:
Customer: "Where is my order?"
Response: "Thank you for reaching out! I've checked your order #12345, and it's currently in transit. Expected delivery is May 15th. You'll receive a tracking link via email shortly. Is there anything else I can help with?"

Example 2:
Customer: "Can I return this item?"
Response: "Absolutely! We accept returns within 30 days of purchase. Please visit our returns portal at returns.com and use order #12345. You'll receive a prepaid shipping label. Let me know if you need any assistance!"

Now respond to:
Customer: "Do you ship internationally?"`}
                  />
                </div>
              </div>

              <InteractivePromptTester
                strategy="few-shot"
                placeholder="Try: 'Classify these customer reviews as positive, neutral, or negative'"
              />

              <ProTipCallout
                tips={[
                  "Use 2-3 examples - more than that rarely improves results",
                  "Make sure your examples are diverse but follow the same pattern",
                  "Keep examples consistent in format and structure",
                  "Choose examples that cover edge cases or variations"
                ]}
                mistakes={[
                  "Providing inconsistent examples that confuse the pattern",
                  "Using too many examples (diminishing returns after 3-4)",
                  "Choosing examples that are too similar to each other"
                ]}
                whenNotToUse="Skip few-shot when the task is simple enough for zero-shot, or when you can't provide good representative examples. Also avoid if examples would take up too much token space."
              />
            </StrategyCard>

            {/* Chain-of-Thought Strategy */}
            <StrategyCard
              id="chain-of-thought"
              icon="🔗"
              title="Chain-of-Thought"
              tagline="Think step by step"
              difficulty="Intermediate"
              color="purple"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Chain-of-Thought?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Chain-of-Thought (CoT) prompting encourages the AI to break down complex problems into logical steps
                  and show its reasoning process. Instead of jumping to an answer, the AI &quot;thinks out loud&quot; through
                  each step, leading to more accurate and explainable results.
                </p>
                <StrategyDiagram type="chain-of-thought" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use Chain-of-Thought?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<Lightbulb className="w-5 h-5 text-white" />}
                    title="Math & Logic"
                    description="Solve mathematical problems or logical puzzles requiring multi-step reasoning."
                    color="purple"
                  />
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Analysis Tasks"
                    description="Analyze complex situations that require breaking down into components."
                    color="purple"
                  />
                  <UseCaseCard
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    title="Decision Making"
                    description="Evaluate options and make informed decisions with clear reasoning."
                    color="purple"
                  />
                  <UseCaseCard
                    icon={<Code className="w-5 h-5 text-white" />}
                    title="Debugging"
                    description="Trace through code or processes to identify and fix issues."
                    color="purple"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Calculate 15% tip on $47.50"
                  afterPrompt={`Calculate 15% tip on $47.50. Let's think step by step:

1. First, convert the percentage to decimal
2. Multiply the bill amount by the decimal
3. Round to 2 decimal places
4. Show the total with tip included

Please show your work for each step.`}
                  beforeResult="The tip is $7.13"
                  afterResult="Step 1: 15% = 0.15\nStep 2: $47.50 × 0.15 = $7.125\nStep 3: Rounded to $7.13\nStep 4: Total = $47.50 + $7.13 = $54.63\n\nThe tip is $7.13 and your total is $54.63"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Problem Solving"
                    category="Logic"
                    code={`A train leaves Station A at 2:00 PM traveling at 60 mph. Another train leaves Station B (180 miles away) at 2:30 PM traveling at 80 mph toward Station A.

Let's solve this step by step:
1. Calculate how far the first train travels before the second starts
2. Determine the combined speed of both trains approaching each other
3. Calculate the remaining distance to cover
4. Find the time until they meet
5. Determine the exact meeting time

Please show all calculations clearly.`}
                  />
                </div>
              </div>

              <InteractivePromptTester
                strategy="chain-of-thought"
                placeholder="Try: 'Explain how to prioritize tasks for a product launch'"
              />

              <ProTipCallout
                tips={[
                  "Use phrases like 'Let\\'s think step by step' or 'Let\\'s break this down'",
                  "Ask the AI to explain its reasoning at each stage",
                  "Request numbered steps for clarity",
                  "Encourage showing calculations or intermediate results"
                ]}
                mistakes={[
                  "Skipping the step-by-step instruction - AI might still jump to conclusion",
                  "Not allowing enough space for reasoning (token limits)",
                  "Using CoT for simple tasks that don't need it"
                ]}
                whenNotToUse="Avoid for simple, straightforward tasks where step-by-step reasoning adds unnecessary complexity. Also skip if you need very quick, concise responses."
              />
            </StrategyCard>

            {/* ReAct Strategy */}
            <StrategyCard
              id="react"
              icon="🎯"
              title="ReAct"
              tagline="Think, then act"
              difficulty="Advanced"
              color="orange"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is ReAct?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  ReAct (Reasoning + Acting) combines reasoning traces with task-specific actions. The AI alternates between
                  thinking about what to do (Thought), taking an action (Action), and observing the result (Observation).
                  This creates a feedback loop that allows for adaptive problem-solving.
                </p>
                <StrategyDiagram type="react" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use ReAct?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    title="Research Tasks"
                    description="Gather information through multiple steps with intermediate decisions."
                    color="orange"
                  />
                  <UseCaseCard
                    icon={<Lightbulb className="w-5 h-5 text-white" />}
                    title="Iterative Problem Solving"
                    description="Tackle problems that require trying different approaches and learning."
                    color="orange"
                  />
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Planning & Strategy"
                    description="Develop plans that adapt based on intermediate outcomes."
                    color="orange"
                  />
                  <UseCaseCard
                    icon={<Code className="w-5 h-5 text-white" />}
                    title="Complex Workflows"
                    description="Execute multi-step processes with decision points along the way."
                    color="orange"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Find information about electric cars and their environmental impact"
                  afterPrompt={`Research electric cars and their environmental impact using the Thought-Action-Observation framework:

Thought: I need to understand both the benefits and drawbacks of electric cars environmentally.
Action: List key environmental factors to research (battery production, energy sources, lifetime emissions).
Observation: [What did we learn from this step?]

Thought: Now I need to compare these factors to traditional vehicles.
Action: Identify comparison points.
Observation: [What insights did we gain?]

Continue this pattern to build a comprehensive understanding.`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Market Research"
                    category="Business"
                    code={`Analyze the market opportunity for a new fitness app using ReAct:

Thought: I need to understand the current market size and trends.
Action: Identify key market metrics to analyze.
Observation: [Record findings]

Thought: Now I should analyze the competition.
Action: List main competitors and their strengths/weaknesses.
Observation: [Record findings]

Thought: Based on the above, where are the gaps?
Action: Identify underserved segments or unmet needs.
Observation: [Record findings]

Thought: Finally, what's the recommended strategy?
Action: Synthesize findings into actionable recommendations.`}
                  />
                </div>
              </div>

              <InteractivePromptTester
                strategy="react"
                placeholder="Try: 'Plan a marketing campaign for a new product launch'"
              />

              <ProTipCallout
                tips={[
                  "Explicitly structure prompts with 'Thought', 'Action', 'Observation' labels",
                  "Allow the AI to iterate and adjust based on observations",
                  "Use this for tasks that benefit from adaptive decision-making",
                  "Encourage the AI to learn from each observation"
                ]}
                mistakes={[
                  "Not clearly separating thought from action",
                  "Skipping the observation step - loses the feedback loop",
                  "Using for simple linear tasks that don't need iteration"
                ]}
                whenNotToUse="Avoid for straightforward tasks without decision points, or when you need a single direct answer without intermediate steps."
              />
            </StrategyCard>

            {/* Reflexion Strategy */}
            <StrategyCard
              id="reflexion"
              icon="🔄"
              title="Reflexion"
              tagline="Learn from mistakes"
              difficulty="Advanced"
              color="teal"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Reflexion?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Reflexion adds a self-evaluation and improvement layer to problem-solving. The AI tries an approach,
                  evaluates its own output, reflects on what could be better, and then refines the solution.
                  It&apos;s like having built-in quality control and continuous improvement.
                </p>
                <StrategyDiagram type="reflexion" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use Reflexion?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<PenTool className="w-5 h-5 text-white" />}
                    title="Quality Improvement"
                    description="Refine outputs iteratively until they meet high-quality standards."
                    color="teal"
                  />
                  <UseCaseCard
                    icon={<Code className="w-5 h-5 text-white" />}
                    title="Error Correction"
                    description="Identify and fix mistakes or issues through self-evaluation."
                    color="teal"
                  />
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Content Editing"
                    description="Polish writing, code, or creative work through multiple refinement cycles."
                    color="teal"
                  />
                  <UseCaseCard
                    icon={<Lightbulb className="w-5 h-5 text-white" />}
                    title="Strategy Refinement"
                    description="Develop and improve strategies based on evaluation feedback."
                    color="teal"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Write a compelling product description"
                  afterPrompt={`Write a compelling product description, then refine it:

Step 1 - Initial Draft:
Write the first version of the product description.

Step 2 - Self-Evaluate:
Analyze the draft for:
- Clarity of benefits
- Emotional appeal
- Call to action strength
- Readability

Step 3 - Reflect:
Identify specific weaknesses and opportunities for improvement.

Step 4 - Refine:
Rewrite the description addressing the identified issues.

Step 5 - Final Check:
Confirm all improvements have been made.`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Email Improvement"
                    category="Communication"
                    code={`Compose and refine a sales email using Reflexion:

1. DRAFT: Write initial sales email for our new software product.

2. EVALUATE: Score the draft on:
   - Subject line effectiveness (1-10)
   - Opening hook strength (1-10)
   - Value proposition clarity (1-10)
   - Call to action power (1-10)

3. REFLECT: For any score below 8, explain what's missing or weak.

4. REFINE: Rewrite the email addressing each weakness.

5. VERIFY: Confirm all scores are now 8+ or explain remaining tradeoffs.`}
                  />
                </div>
              </div>

              <InteractivePromptTester
                strategy="reflexion"
                placeholder="Try: 'Create and refine a social media post for a product launch'"
              />

              <ProTipCallout
                tips={[
                  "Build in explicit evaluation criteria",
                  "Ask for specific scores or assessments",
                  "Request the AI explain what to improve and why",
                  "Allow multiple refinement cycles for best results"
                ]}
                mistakes={[
                  "Not providing clear evaluation criteria - leads to vague feedback",
                  "Stopping after first evaluation without refinement",
                  "Using for tasks where the first output is usually good enough"
                ]}
                whenNotToUse="Skip Reflexion for time-sensitive tasks requiring quick responses, or simple tasks where quality is already high in first attempt."
              />
            </StrategyCard>

            {/* Tree of Thoughts Strategy */}
            <StrategyCard
              id="tree-of-thoughts"
              icon="🌳"
              title="Tree of Thoughts"
              tagline="Explore multiple paths"
              difficulty="Advanced"
              color="green"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Tree of Thoughts?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Tree of Thoughts (ToT) explores multiple reasoning paths simultaneously, like branches on a tree.
                  Instead of following one line of thinking, the AI generates several different approaches, evaluates
                  each one, and then selects or combines the best elements. It&apos;s perfect for complex problems with
                  multiple viable solutions.
                </p>
                <StrategyDiagram type="tree-of-thoughts" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use Tree of Thoughts?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<Lightbulb className="w-5 h-5 text-white" />}
                    title="Creative Brainstorming"
                    description="Generate and evaluate multiple creative ideas before selecting the best."
                    color="green"
                  />
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Strategic Planning"
                    description="Explore different strategies and compare their potential outcomes."
                    color="green"
                  />
                  <UseCaseCard
                    icon={<Code className="w-5 h-5 text-white" />}
                    title="Architecture Design"
                    description="Consider multiple design approaches before committing to one."
                    color="green"
                  />
                  <UseCaseCard
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    title="Decision Analysis"
                    description="Evaluate pros and cons of different options systematically."
                    color="green"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Design a customer retention strategy"
                  afterPrompt={`Design a customer retention strategy by exploring multiple approaches:

Step 1 - Generate 3 Different Approaches:
Path A: Loyalty rewards program approach
Path B: Personalization and engagement approach
Path C: Community building approach

Step 2 - Develop Each Path:
For each approach, outline:
- Key features
- Implementation requirements
- Expected costs
- Potential ROI

Step 3 - Evaluate Each Path:
Score each on:
- Ease of implementation (1-10)
- Cost effectiveness (1-10)
- Customer impact (1-10)
- Scalability (1-10)

Step 4 - Select or Combine:
Choose the best approach or combine strengths from multiple paths.`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Product Feature Planning"
                    category="Product"
                    code={`Explore different approaches for our app's next major feature:

Branch 1: AI-Powered Recommendations
- Core functionality
- Technical requirements
- User benefits
- Development timeline

Branch 2: Social Collaboration Features
- Core functionality
- Technical requirements
- User benefits
- Development timeline

Branch 3: Advanced Analytics Dashboard
- Core functionality
- Technical requirements
- User benefits
- Development timeline

Evaluation Matrix:
Compare all three on: User demand, Development effort, Revenue potential, Strategic fit

Recommendation:
Based on the evaluation, which path should we pursue? Or should we combine elements?`}
                  />
                </div>
              </div>

              <InteractivePromptTester
                strategy="tree-of-thoughts"
                placeholder="Try: 'Explore different approaches to reduce customer churn'"
              />

              <ProTipCallout
                tips={[
                  "Generate 3-5 distinct approaches, not minor variations",
                  "Use consistent evaluation criteria across all paths",
                  "Consider combining strengths from multiple approaches",
                  "Be explicit about what makes each path unique"
                ]}
                mistakes={[
                  "Creating paths that are too similar to each other",
                  "Not fully developing each path before evaluation",
                  "Bias toward the first generated path"
                ]}
                whenNotToUse="Avoid for simple problems with obvious solutions, or when you need quick decisions without exploring alternatives. Also skip if token limits prevent exploring multiple paths fully."
              />
            </StrategyCard>

            {/* Meta Prompting Strategy */}
            <StrategyCard
              id="meta-prompting"
              icon="🎭"
              title="Meta Prompting"
              tagline="Assign the perfect role"
              difficulty="Intermediate"
              color="pink"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">What is Meta Prompting?</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Meta prompting assigns the AI a specific expert role or persona tailored to your task. By defining who
                  the AI should &quot;be&quot; (e.g., a marketing strategist, senior developer, or financial advisor), you help it
                  access the most relevant knowledge and adopt the appropriate perspective and communication style.
                </p>
                <StrategyDiagram type="meta-prompting" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">When to use Meta Prompting?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <UseCaseCard
                    icon={<BookOpen className="w-5 h-5 text-white" />}
                    title="Domain Expertise"
                    description="Access specialized knowledge by assigning expert roles in specific fields."
                    color="pink"
                  />
                  <UseCaseCard
                    icon={<FileText className="w-5 h-5 text-white" />}
                    title="Specific Output Formats"
                    description="Get results in professional formats by defining the role and standards."
                    color="pink"
                  />
                  <UseCaseCard
                    icon={<PenTool className="w-5 h-5 text-white" />}
                    title="Tone & Style"
                    description="Match a specific writing style or communication approach through role-play."
                    color="pink"
                  />
                  <UseCaseCard
                    icon={<Lightbulb className="w-5 h-5 text-white" />}
                    title="Perspective Shifts"
                    description="View problems from different professional angles by changing roles."
                    color="pink"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">See the Difference</h3>
                <BeforeAfterComparison
                  beforePrompt="Help me improve my website's conversion rate"
                  afterPrompt={`You are a senior conversion rate optimization (CRO) specialist with 10+ years of experience in e-commerce. You've helped over 100 companies increase their conversion rates by an average of 40%.

Your approach:
- Data-driven analysis
- Evidence-based recommendations
- Clear prioritization of changes by impact
- Specific, actionable next steps

Task: Analyze my website and provide a CRO improvement plan.

Input Format: I'll describe my website and current metrics
Output Format:
1. Executive Summary
2. Key Issues (prioritized)
3. Recommended Changes (with expected impact)
4. Implementation Roadmap

Please analyze in your expert capacity.`}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Example Prompts</h3>
                <div className="space-y-4">
                  <CodeExampleBlock
                    title="Code Review"
                    category="Development"
                    code={`You are a Staff Software Engineer at a FAANG company, specializing in Python and system design. You have:
- 15+ years of experience
- Led architecture reviews for high-scale systems
- Mentored 50+ junior developers
- Strong focus on performance, security, and maintainability

Your code review approach:
1. Correctness and logic
2. Security vulnerabilities
3. Performance implications
4. Code maintainability
5. Best practices adherence

Review Style: Constructive, specific, with examples

Please review this Python code: [code here]

Provide feedback in this format:
- Critical Issues (must fix)
- Improvements (should fix)
- Suggestions (nice to have)
- What's done well`}
                  />
                  <CodeExampleBlock
                    title="Marketing Strategy"
                    category="Marketing"
                    code={`You are a Chief Marketing Officer with expertise in SaaS B2B marketing. Your background:
- Built marketing teams at 3 successful startups
- Expert in growth marketing, content strategy, and demand generation
- Data-driven approach with focus on CAC, LTV, and conversion metrics

Your framework:
1. Understand business goals and current metrics
2. Identify target audience and positioning
3. Recommend multi-channel strategy
4. Define success metrics and timeline
5. Provide implementation roadmap

Task: Develop a go-to-market strategy for our new product.

Please provide strategy in format:
- Situation Analysis
- Strategy Recommendations
- Channel Plan
- Budget Allocation
- Success Metrics
- 90-Day Action Plan`}
                  />
                </div>
              </div>

              <InteractivePromptTester
                strategy="meta-prompting"
                placeholder="Try: 'You are a UX designer. Review my app's onboarding flow.'"
              />

              <ProTipCallout
                tips={[
                  "Be specific about the role - include experience level and specialties",
                  "Define the expert's approach or framework",
                  "Specify desired output format and structure",
                  "Include relevant context about the expert's background"
                ]}
                mistakes={[
                  "Vague roles like 'expert' without specifics",
                  "Not defining what makes this expert qualified",
                  "Skipping output format specifications"
                ]}
                whenNotToUse="Skip meta prompting for general tasks that don't benefit from specialized expertise, or when you want a neutral, objective perspective without role bias."
              />
            </StrategyCard>
          </main>
        </div>
      </div>
    </div>
  );
}
