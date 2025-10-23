# Quick Setup Guide

## Prerequisites Checklist
- ✅ Bun.js is installed
- ⚠️ OpenAI API key required
- ⚠️ Turso account and CLI required

## Setup Steps

### 1. Install and Setup Turso

#### Install Turso CLI

macOS/Linux:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

Windows (PowerShell):
```powershell
powershell -c "irm https://get.tur.so/install.ps1 | iex"
```

#### Authenticate with Turso

```bash
turso auth signup
# or if you already have an account:
turso auth login
```

#### Create Your Database

```bash
# Create a new database
turso db create prompt-playground

# Get the database URL (save this)
turso db show --url prompt-playground

# Create an authentication token (save this)
turso db tokens create prompt-playground
```

More info: https://docs.turso.tech/sdk/ts/quickstart

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with:

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Turso Database Configuration (required)
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token-here
```

**Where to get these:**
- OpenAI API key: https://platform.openai.com/api-keys
- Turso URL and token: Run the commands from Step 1 above

### 3. Start the Development Server

```bash
bun dev
```

The app will be available at: http://localhost:3000

The database schema will be automatically initialized on first connection.

### 4. Test the Application

#### Test Game Flow:
1. Go to http://localhost:3000/admin
2. Create a new game with title and scenarios
3. Submit to create the game
4. Click "Play Game" on any game
5. Write prompts for all scenarios
6. Click "Submit All Prompts"
7. View your scores, feedback, and leaderboard

#### Test Admin Features:
1. Visit http://localhost:3000/admin
2. Everyone has full admin access to create, edit, and delete games
3. You'll see "Create Game" and "Manage Games" tabs
4. Create games, edit existing ones, or delete them

#### Test Playground:
1. Go to http://localhost:3000/playground
2. Configure system prompt, model, and temperature
3. Select a prompting strategy (e.g., "Chain-of-Thought")
4. Type a prompt and click "Apply Strategy"
5. Review the refined prompt
6. Click "Use Refined Prompt" and send to chat
7. See the streaming AI response

## Database

This project uses **Turso** - a distributed SQLite database built on libSQL.

### Why Turso?
- ✅ Built on SQLite (familiar SQL syntax)
- ✅ Distributed and edge-ready
- ✅ Automatic backups and replication
- ✅ Generous free tier
- ✅ Low latency worldwide

### Database Schema
The database schema is automatically initialized when the app starts. It includes:
- **users**: User authentication and profiles
- **games**: Prompt engineering challenges
- **scenarios**: Individual scenarios within games
- **submissions**: User prompt submissions and scores

### Database Management

View your database in the Turso dashboard:
```bash
turso db shell prompt-playground
```

Or access the web UI:
```bash
turso db show prompt-playground
```

### Local Development Alternative

If you want to develop locally without Turso Cloud, you can use a local database file:
```bash
# In .env.local, use a local file URL:
TURSO_DATABASE_URL=file:prompt-playground.db
# Leave TURSO_AUTH_TOKEN empty or omit it
```

## Troubleshooting

### Error: "OpenAI API key not found"
- Make sure `.env.local` file exists in the root directory
- Ensure the API key is correctly formatted: `OPENAI_API_KEY=sk-...`
- Restart the dev server after adding the key

### Error: "Database connection failed" or Turso errors
- Verify your `TURSO_DATABASE_URL` is correct (should start with `libsql://`)
- Check that your `TURSO_AUTH_TOKEN` is valid
- Run `turso db show prompt-playground` to verify your database exists
- Create a new token: `turso db tokens create prompt-playground`
- Restart the dev server after updating `.env.local`

### Error: "Turso CLI not found"
- Install Turso CLI using the commands in Step 1
- After installation, restart your terminal
- Verify installation: `turso --version`

### Port 3000 already in use
- Stop other Next.js apps or use a different port:
  ```bash
  bun dev --port 3001
  ```

## Features Implemented

✅ User authentication with cookie-based tokens
✅ Admin page for game management (create, edit, delete)
✅ Public admin access - everyone can manage games
✅ Game creation with flexible scenarios (1-10 scenarios)
✅ Public game play page accessible to all
✅ Batch prompt submission
✅ AI-powered evaluation with GPT-4o
✅ Detailed feedback and improvement suggestions
✅ Real-time leaderboard
✅ Local storage for user results
✅ Playground with multiple models (GPT-4o, O1, O3, and mini variants)
✅ System prompt configuration
✅ Temperature control
✅ Prompting strategies (Zero-shot, Few-shot, Chain-of-Thought, ReAct)
✅ LLM-based prompt refinement
✅ Streaming chat responses
✅ Modern, responsive UI with shadcn/ui
✅ AI Elements integration for chat interface
✅ Clean interface without navigation bar

## Workshop Demo Tips

1. **Start with a quick overview** of the landing page
2. **Demo game creation** - use interesting scenarios like:
   - "Write a prompt to generate creative product descriptions"
   - "Create a prompt for explaining complex technical concepts"
   - "Design a prompt for code review feedback"
3. **Show the evaluation process** - emphasize the AI feedback
4. **Highlight the leaderboard** - competitive aspect
5. **Switch to playground** - show strategy application
6. **Compare different strategies** - same prompt, different strategies
7. **Try multiple models** - show how responses differ

## Next Steps (Optional Enhancements)

- Add user profiles and authentication
- Implement game search and filtering
- Add more prompting strategies
- Create a prompt library
- Add analytics and insights
- Export results as PDF/CSV
- Add social sharing features
- Implement rate limiting for API calls

## Support

For issues or questions, check:
- README.md for detailed documentation
- Next.js docs: https://nextjs.org/docs
- Vercel AI SDK: https://sdk.vercel.ai/docs
- OpenAI API: https://platform.openai.com/docs

