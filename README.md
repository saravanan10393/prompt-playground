# Prompt Playground

Master prompt engineering through competitive games and hands-on experimentation with multiple GPT models and proven prompting strategies.

## Features

### 🎮 Competitive Games
- Create and join prompt engineering challenges
- Write prompts for 3 scenarios per game
- Get AI-powered evaluation and scoring (1-10 per scenario)
- Receive detailed feedback and improvement suggestions
- Compete on real-time leaderboards

### 🛝 Playground
- Chat with multiple GPT models (GPT-4o, O1, O3, and mini variants)
- Configure system prompts and temperature
- Apply prompting strategies:
  - **Zero-shot**: Direct, clear instructions
  - **Few-shot**: Learn from examples
  - **Chain-of-Thought**: Step-by-step reasoning
  - **ReAct**: Reasoning + Action framework
- See refined prompts before sending
- Real-time streaming responses

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Bun.js
- **Database**: SQLite (Bun native)
- **AI SDK**: Vercel AI SDK 5
- **LLM Provider**: OpenAI
- **UI Components**: shadcn/ui + AI Elements
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd prompt-playground
```

2. Install dependencies:
```bash
bun install
```

3. Create `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
prompt-playground/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # User authentication
│   │   ├── games/        # Game CRUD operations
│   │   └── playground/   # Chat & prompt refinement
│   ├── games/            # Game pages
│   ├── game-create/      # Create new game
│   ├── playground/       # AI playground
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/              # shadcn components
│   └── ai-elements/     # AI Elements components
├── lib/
│   ├── db.ts            # SQLite database setup
│   ├── auth.ts          # User authentication
│   └── storage.ts       # Local storage utilities
└── prompt-playground.db # SQLite database (auto-created)
```

## How It Works

### Game Flow

1. **Create Game**: A user creates a game with 3 scenarios
2. **Join & Write**: Other users write prompts for each scenario
3. **Submit All**: User submits all 3 prompts at once
4. **Evaluation**: AI evaluates each prompt and assigns scores
5. **Results**: View scores, feedback, and leaderboard

### Playground Flow

1. **Configure**: Set system prompt, model, temperature, and strategy
2. **Refine** (Optional): Apply a prompting strategy to transform your prompt
3. **Review**: See the refined prompt with explanations
4. **Chat**: Send messages and get streaming responses

## Database Schema

- **users**: User tokens and names
- **games**: Game metadata
- **scenarios**: 3 scenarios per game
- **submissions**: User prompts with scores and feedback

## API Routes

### Authentication
- `POST /api/auth` - Create/verify user session
- `GET /api/auth` - Get current user

### Games
- `GET /api/games` - List all games
- `POST /api/games` - Create new game
- `GET /api/games/[id]` - Get game details
- `POST /api/games/[id]/submit` - Submit prompts (batch)
- `GET /api/games/[id]/results` - Get results & leaderboard

### Playground
- `POST /api/playground/chat` - Streaming chat
- `POST /api/playground/refine-prompt` - Apply strategy to prompt

## Development

### Run linter:
```bash
bun run lint
```

### Build for production:
```bash
bun run build
```

### Start production server:
```bash
bun start
```

## Workshop Showcase Ready

This application demonstrates:
- Real-time AI evaluation and feedback
- Multiple GPT model integration
- Prompting strategy transformation
- Competitive gaming mechanics
- Modern Next.js patterns
- SQLite database with Bun
- Streaming AI responses
- Component-based architecture

## License

MIT
