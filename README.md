# 🛡️ Vaathi — India's Open Source Cybersecurity Learning OS

> *"Bring Your Own LLM. No servers. No subscriptions. Just your API key and Vaathi as the wrapper."*

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## What is Vaathi?

Vaathi is an AI-powered cybersecurity learning platform where **students bring their own LLM API key** (Groq is free!) and Vaathi acts as the intelligent wrapper that orchestrates their entire learning journey.

The AI dynamically assesses their skills, generates a personalized roadmap, teaches concepts, creates hands-on micro-tasks, and evaluates their progress — all in their preferred Indian language.

**Total cost for any student: $0 forever.**

## 🚀 One-Command Deploy (3 minutes)

Want your own Vaathi instance? Fork this repo and run:

```bash
git clone https://github.com/YOUR_USERNAME/vaathi.git
cd vaathi
npm install
bash deploy.sh
```

That's it. The script automatically:
1. Checks prerequisites (Node.js, npm, git)
2. Installs Turso CLI + Vercel CLI if needed
3. Signs you into Turso (browser-based, no passwords)
4. Creates a free Turso database and pushes the schema
5. Deploys to Vercel with all environment variables set
6. Gives you your live URL

> **Requirements:** Node.js 18+, npm, git, a GitHub account, and a Turso account (free, created during setup).

## Why Vaathi?

| Problem | Solution |
|---|---|
| TryHackMe/HackTheBox costs $14/month | **Free** — student brings their own LLM key |
| Everything is in English | **6 languages** — Tamil, Hindi, Telugu, Malayalam, Kannada, English |
| One-size-fits-all content | **AI assessment** → personalized roadmap based on what YOU know |
| Need VMs for labs | **Micro-tasks** — code analysis, decode challenges, log forensics (no VMs!) |
| No real tutor | **Guru AI** — always available, adapts to your level, remembers you |

## Architecture

```
Student brings LLM API key (Groq/OpenRouter/OpenAI/Together/Ollama)
         │
         ▼
    ┌─────────────┐
    │   VAATHI     │  ← The wrapper
    │  (Next.js)   │
    └──────┬──────┘
           │
    ┌──────┴──────────────────────────────┐
    │                                     │
    ▼                                     ▼
Phase 1: Skill Assessment          Phase 2: Guided Learning
─────────────────────────         ──────────────────────
• AI asks nerdy questions         • AI explains concepts
• Student explains in own words   • Micro-tasks (code analysis,
• AI evaluates depth                command challenges, decode,
• Generates personalized            scenario response, log analysis)
  roadmap based on gaps           • MCQ quizzes
                                   • Guru AI chat (ask anything)
    ┌──────┴──────────────────────────────┐
    │                                     │
    ▼                                     ▼
Phase 3: Practice                   Phase 4: Re-assess
─────────────────────────         ──────────────────────
• CTF Arena (AI-generated)        • Periodic check-ins
• Dynamic labs via Guru           • Updated roadmap
• XP, levels, badges              • Track growth
```

## Cost Breakdown

| Component | Cost | Provider |
|---|---|---|
| LLM API | **FREE** | Student's own Groq/OpenRouter key |
| Hosting | **FREE** | Vercel Hobby |
| Database | **FREE** | Turso Starter |
| **Total** | **$0** | — |

## Getting Started

### Option A: Deploy Your Own Instance (Recommended)

```bash
git clone https://github.com/bb1nfosec/vaathi.git
cd vaathi
npm install
bash deploy.sh
```

The script handles everything. Just follow the prompts.

### Option B: Local Development

```bash
# Clone
git clone https://github.com/bb1nfosec/vaathi.git
cd vaathi

# Install dependencies
npm install

# Setup database (local SQLite)
npx prisma db push

# Start dev server
npm run dev
```

Open http://localhost:3000

### Manual Vercel Deployment

If you prefer doing it manually instead of using `deploy.sh`:

1. **Create Turso database:**
   ```bash
   npm install -g turso
   turso auth login
   turso db create vaathi
   turso db show vaathi --url          # Copy this URL
   turso auth api-tokens create vaathi # Copy this token
   ```

2. **Push schema:**
   ```bash
   TURSO_AUTH_TOKEN=your-token DATABASE_URL="libsql://vaathi-your-org.turso.io" npx prisma db push
   ```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com), import your repo
   - Add environment variables:
     - `DATABASE_URL` = your Turso URL
     - `TURSO_AUTH_TOKEN` = your Turso token
   - Deploy!

## Features

### 🧠 Dynamic Skill Assessment
- AI asks nerdy cybersecurity questions conversationally
- Student explains in their own words (not multiple choice)
- AI evaluates depth of understanding across 6 domains
- Generates personalized learning roadmap

### ⚡ Micro Tasks (No VMs needed!)
- **Code Analysis** — Find the vulnerability in a snippet
- **Command Challenge** — Explain what this nmap/tcpdump command does
- **Decode/Encode** — Decode Base64, Hex, ROT13 to find flags
- **Scenario Response** — You see this security alert, what do you do?
- **Log Analysis** — Find the attack in this log excerpt
- **Concept Explain** — Teach this topic to a beginner

Each task: 2-5 minutes. AI generates AND evaluates your answer.

### 🧑‍💻 Guru AI Chat
- Free-form cybersecurity chat with streaming responses
- Generates labs and CTF challenges on demand
- Adapts difficulty to your tier
- Teaches in your preferred language
- Uses Indian cybersecurity context (CERT-In, UPI frauds, UIDAI)

### 🗺️ Personalized Learning Roadmap
- Generated from assessment results
- Topics ordered by priority (fundamentals first)
- Learn → Practice Tasks → Quiz flow per topic
- Progress tracking with XP, levels, badges

### 🏆 CTF Arena
- AI-generated CTF challenges
- Difficulty scales with your tier
- Points system with badges

### 📊 Tier System
- 🥚 Egg (0 XP) → 🐣 Hatchling (100) → 💻 Script Kiddie (500) → 🖥️ Hacker (2000) → 🔥 Burn (5000)

## Supported LLM Providers

| Provider | Free? | Get Key |
|---|---|---|
| **Groq** | ✅ Free | [console.groq.com](https://console.groq.com) |
| **OpenRouter** | ✅ Free models | [openrouter.ai](https://openrouter.ai) |
| **Together AI** | ✅ Trial | [together.ai](https://together.ai) |
| OpenAI | ❌ Paid | [platform.openai.com](https://platform.openai.com) |
| Ollama (Local) | ✅ Free | `ollama pull llama3`, no key needed |
| Custom | Varies | Any OpenAI-compatible endpoint |

**Recommendation:** Use [Groq](https://console.groq.com) for a free API key — instant signup, no credit card.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| State | Zustand |
| Database | Prisma ORM + SQLite (local) / Turso (deployed) |
| LLM | Student's own API key (BYOLLM) |
| Deployment | Vercel (free) + Turso (free) |

## Contributing

1. Fork the repo
2. Create a feature branch
3. Build something awesome
4. Open a PR

Priority areas: new micro-task types, language translations, curriculum suggestions.

## License

MIT License — free forever, open always.

---

**Made with 💚 for India's cybersecurity future.**
