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
Student brings LLM API key (Groq/OpenAI/Together/Ollama)
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
| LLM API | **FREE** | Student's own Groq key |
| Hosting | **FREE** | Vercel Hobby |
| Database | **FREE** | Turso Starter |
| **Total** | **$0** | — |

## Getting Started

### Local Development

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

### Deploy to Vercel (Free)

#### Step 1: Create a Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create vaathi

# Get connection URL
turso db show vaathi --url

# Create auth token
turso db tokens create vaathi
```

#### Step 2: Push Schema to Turso

```bash
# Set env vars
export DATABASE_URL="libsql://vaathi-your-org.turso.io"
export TURSO_AUTH_TOKEN="your-token"

# Push schema
npx prisma db push
```

#### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Import your GitHub repo
3. Add environment variables:
   - `DATABASE_URL` = `libsql://vaathi-your-org.turso.io`
   - `TURSO_AUTH_TOKEN` = `your-turso-auth-token`
4. Deploy!

#### Alternative: Netlify / Railway

Both work similarly — just set the env vars and connect your repo.

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

| Provider | Free? | Setup |
|---|---|---|
| **Groq** | ✅ Yes | Sign up, get key — instant |
| OpenAI | ❌ Paid | API key from platform.openai.com |
| Together AI | ✅ Trial | API key from together.ai |
| Ollama (Local) | ✅ Yes | `ollama pull llama3`, no key needed |
| Custom (OpenAI-compatible) | Varies | Any endpoint that matches OpenAI API |

**Recommendation for students:** Use [Groq](https://console.groq.com) — it's 100% free and fast.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| State | Zustand |
| Database | Prisma ORM + SQLite (local) / Turso (deployed) |
| LLM | Student's own API key (BYOLLM) |

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
