<div align="center">

<img src="public/vaathi-logo.png" alt="Vaathi Logo" width="96" height="96" />

# VAATHI

### India's Open Source Cybersecurity Learning OS

*"Bring Your Own LLM. No servers. No subscriptions. Just your API key and Vaathi as the wrapper."*

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

**[Live Demo](https://vaathi.vercel.app)** · **[Deploy Your Own](#-one-command-deploy-3-minutes)** · **[Report Bug](https://github.com/bb1nfosec/vaathi/issues)**

---

**Total cost to run Vaathi: $0 forever.**

</div>

---

## What is Vaathi?

Vaathi is an AI-powered cybersecurity learning platform where **students bring their own LLM API key** — Groq is completely free — and Vaathi acts as the intelligent wrapper that orchestrates their entire learning journey.

The AI dynamically **assesses your skills**, **generates a personalized roadmap**, **teaches concepts**, **creates hands-on micro-tasks**, **evaluates your answers**, and **schedules spaced repetition reviews** to lock knowledge into long-term memory — all in your preferred Indian language.

---

## Why Vaathi?

| Problem | Solution |
|:--|:--|
| TryHackMe / HackTheBox costs $14/month | **Free** — you bring your own Groq/OpenRouter key |
| All content is in English | **6 languages** — Tamil, Hindi, Telugu, Malayalam, Kannada, English |
| One-size-fits-all curriculum | **AI skill assessment** → personalized roadmap based on what you actually know |
| Labs need VMs and setup time | **Micro-tasks** — code analysis, CTFs, log forensics, decode challenges (no VMs!) |
| Learned today, forgotten next week | **SM-2 spaced repetition** — scheduled reviews at scientifically optimal intervals |
| No guidance on what to learn next | **Guru AI** — always available, adapts to your level, teaches in your language |
| Have to start from zero every time | **5 curated preset learning paths** — jump straight into structured content |

---

## Features

### 🧠 Dynamic Skill Assessment
Guru AI asks technical cybersecurity questions in a conversation — no boring MCQs. You explain concepts in your own words and the AI evaluates your depth across 6 domains, then generates a **personalized learning roadmap** that starts from your actual knowledge gaps.

### 🛤️ Preset Learning Paths
Skip the assessment and jump straight into structured content. Choose from 5 expert-curated paths:

| Path | Focus | Level |
|:--|:--|:--|
| 🌐 **Web Hacker** | OWASP Top 10, XSS, SQLi, Bug Bounty | Intermediate |
| 🔒 **Network Defender** | Wireshark, firewalls, IDS/IPS, Blue Team ops | Beginner |
| 🦠 **Malware Analyst** | Static/dynamic analysis, reverse engineering, YARA | Advanced |
| 🕵️ **OSINT Investigator** | Google dorking, Shodan, social engineering defence | Beginner |
| ☁️ **Cloud Security** | AWS/GCP misconfigurations, IAM, CloudTrail forensics | Intermediate |

### 🔁 SM-2 Spaced Repetition
Every completed topic is scheduled for review using the **SuperMemo 2 algorithm**. Your quiz score at completion sets the initial interval — perfect score means a longer gap before review. The dashboard always surfaces topics due for review, and the ease factor auto-adjusts so topics you struggle with come back sooner.

### ⚡ Micro-Tasks — No VMs Needed
6 hands-on task types, each taking 2–5 minutes. AI generates AND evaluates:

- **Code Analysis** — find the vulnerability in a snippet
- **Command Challenge** — explain this `nmap`/`tcpdump`/`curl` command
- **Decode/Encode** — Base64, Hex, ROT13, JWT — find the flag
- **Scenario Response** — you see this security alert, what do you do?
- **Log Analysis** — find the attack in this server/firewall log
- **Concept Explain** — teach this topic to a complete beginner

### 🧑‍💻 Guru AI Chat
Streaming AI chat that generates labs and CTF challenges on demand. Adapts to your tier, teaches in your language, uses Indian cybersecurity context (CERT-In alerts, UPI fraud patterns, UIDAI privacy).

### 🏆 CTF Arena
AI-generated capture-the-flag challenges with difficulty scaled to your tier. Earn XP and badges for every solve.

### 📊 Analytics Dashboard
Track your learning journey visually:
- **Activity heatmap** — 12-week GitHub-style contribution graph
- **Domain radar chart** — see your strengths across web, network, crypto, reverse engineering
- **SM-2 stats** — total reviews, average ease factor, average interval
- **Progress rings** — roadmap completion at a glance

### 🔥 Streak & XP System
Daily streak tracking with same-day double-count prevention. Five tiers with XP gates:

```
🥚 Egg (0) → 🐣 Hatchling (100) → 💻 Script Kiddie (500) → 🖥️ Hacker (2000) → 🔥 Burn (5000)
```

### 📱 PWA — Installable App
Vaathi works offline and can be installed on your phone or desktop. Add to home screen and get review reminders as push notifications when topics are due.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VAATHI (Next.js SPA)                     │
│                                                                  │
│  Student's LLM API key → stored in DB, proxied by every route   │
│  Never exposed to the browser after onboarding                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────┐   ┌──────────┐  ┌──────────────┐
  │  Phase 1 │   │  Phase 2 │  │   Phase 3    │
  │Assessment│   │ Learning │  │   Practice   │
  │          │   │          │  │              │
  │AI asks   │   │Explain + │  │ CTF Arena    │
  │questions │   │Quiz +    │  │ Dynamic Labs │
  │Evaluates │   │Microtasks│  │ XP / Badges  │
  │Roadmap ↓ │   │SM-2 ↓    │  │              │
  └──────────┘   └──────────┘  └──────────────┘
                       │
                  ┌────▼────┐
                  │Phase 4  │
                  │Spaced   │
                  │Repetition│
                  │SM-2 algo│
                  │Reviews  │
                  │Push     │
                  │Notifs   │
                  └─────────┘

Database: Turso (libSQL) in production · SQLite locally
LLM: Any OpenAI-compatible provider (student's own key)
```

---

## Cost Breakdown

| Component | Cost | Provider |
|:--|:--|:--|
| LLM API calls | **FREE** | Student's own Groq / OpenRouter key |
| App hosting | **FREE** | Vercel Hobby |
| Database | **FREE** | Turso Starter (9 GB) |
| Push notifications | **FREE** | Web Push (VAPID) |
| **Total** | **$0** | — |

---

## Supported LLM Providers

| Provider | Free? | Best For | Get Key |
|:--|:--|:--|:--|
| **Groq** | ✅ Free tier | Speed — Llama 3.3 70B in <1s | [console.groq.com](https://console.groq.com) |
| **OpenRouter** | ✅ Free models | Variety — Claude, GPT-4o, Gemini | [openrouter.ai](https://openrouter.ai) |
| **Together AI** | ✅ Trial credits | Open-source models | [together.ai](https://together.ai) |
| OpenAI | ❌ Paid | GPT-4o quality | [platform.openai.com](https://platform.openai.com) |
| **Ollama** | ✅ Local | Air-gapped / private use | `ollama pull llama3` |
| Custom | Varies | Any OpenAI-compatible endpoint | Your own URL |

> **Recommendation:** Start with [Groq](https://console.groq.com) — instant signup, no credit card, fast inference.

---

## 🚀 One-Command Deploy (3 minutes)

```bash
git clone https://github.com/bb1nfosec/vaathi.git
cd vaathi
npm install
bash deploy.sh
```

The script automatically:
1. Checks prerequisites (Node.js 18+, npm, git)
2. Installs Turso CLI + Vercel CLI if needed
3. Signs you into Turso (browser-based — no passwords typed)
4. Creates a free Turso database and runs the schema
5. Deploys to Vercel with all environment variables set
6. Prints your live URL

> **Requirements:** Node.js 18+, npm, git, GitHub account, Turso account (free, created during setup)

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/bb1nfosec/vaathi.git
cd vaathi

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Edit .env — set DATABASE_URL=file:./db/dev.db (already the default)

# 4. Database
npx prisma db push

# 5. Start
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Useful Commands

```bash
npm run dev          # Dev server with hot reload
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push schema to DB
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:reset     # Wipe all data (destructive)
```

---

## Manual Vercel + Turso Setup

If you prefer step-by-step over `deploy.sh`:

**Step 1 — Create Turso database**
```bash
npm install -g turso
turso auth login
turso db create vaathi
turso db show vaathi --url           # copy this
turso auth api-tokens create vaathi  # copy this
```

**Step 2 — Push schema**
```bash
TURSO_AUTH_TOKEN=your-token DATABASE_URL="libsql://vaathi-your-org.turso.io" npx prisma db push
```

**Step 3 — Deploy to Vercel**
- Import your fork at [vercel.com/new](https://vercel.com/new)
- Add these environment variables:

| Variable | Value |
|:--|:--|
| `DATABASE_URL` | `libsql://vaathi-your-org.turso.io` |
| `TURSO_AUTH_TOKEN` | your Turso token |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `GITHUB_CLIENT_ID` | *(optional)* GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | *(optional)* GitHub OAuth App secret |
| `VAPID_PUBLIC_KEY` | *(optional)* `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | *(optional)* from same command |
| `VAPID_EMAIL` | *(optional)* your contact email |

> Only `DATABASE_URL` and `TURSO_AUTH_TOKEN` are required. Everything else enables optional features.

**Step 4 — Deploy** and Vaathi is live.

---

## Troubleshooting

**"Start Hacking!" button doesn't respond on Vercel**

Visit `/api/health` on your Vercel URL. It reports which env vars are missing and whether the Turso connection is healthy. The most common cause is an expired Turso auth token — regenerate it at [turso.tech](https://app.turso.tech) and update it in Vercel dashboard → Settings → Environment Variables.

**Schema errors on existing Turso databases**

Vaathi automatically runs `ALTER TABLE ADD COLUMN` migrations on every cold start to fill in any columns added after your initial deployment. If you see schema errors, try redeploying to trigger a fresh cold start.

**LLM not responding**

Check your API key in Profile → LLM Settings. Test the key directly with the provider's playground. Ensure the model name matches exactly what the provider lists.

---

## Tech Stack

| Layer | Technology |
|:--|:--|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| State | Zustand |
| Database | Prisma ORM + SQLite (local) / Turso libSQL (production) |
| Auth | NextAuth v4 (optional — GitHub & Google OAuth) |
| LLM | Any OpenAI-compatible provider via BYOLLM |
| Spaced Repetition | SuperMemo 2 (SM-2) algorithm |
| PWA | Web Push API, Service Worker, Web App Manifest |
| Deployment | Vercel + Turso (both free tier) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── assessment/     # Streaming skill assessment + roadmap generation
│   │   ├── guru/           # Streaming LLM proxy for chat
│   │   ├── topic-learn/    # Explain / quiz / microtask / SM-2 complete / review
│   │   ├── roadmap/        # Load user roadmap with SM-2 fields
│   │   ├── profile/        # Create / update user (API key never returned in GET)
│   │   ├── presets/        # Apply a curated learning path
│   │   ├── analytics/      # Domain stats, activity heatmap, SM-2 metrics
│   │   ├── ctf/submit/     # Validate flag, award XP / badges
│   │   ├── labs/complete/  # Record lab completion
│   │   ├── push/           # VAPID push subscription management
│   │   ├── cron/reviews/   # Daily reminder cron (Vercel Cron, 9am UTC)
│   │   ├── auth/           # NextAuth (optional GitHub / Google OAuth)
│   │   └── health/         # DB connectivity check for diagnostics
│   └── page.tsx            # Single-page app — all views rendered here
├── components/vaathi/      # Feature views: dashboard, roadmap, topic-learn, …
├── store/vaathi-store.ts   # Zustand store — single source of truth
└── lib/
    ├── db.ts               # Prisma client + ensureSchema + ALTER TABLE migrations
    └── presets.ts          # 5 curated learning path definitions
```

---

## Contributing

Pull requests are welcome. Priority areas:

- **New micro-task types** — more variety in hands-on challenges
- **Language improvements** — better Tamil/Hindi/Telugu/Malayalam/Kannada prompts
- **New preset paths** — e.g. Forensics Investigator, Mobile Security
- **Curriculum suggestions** — better topic ordering and descriptions
- **UI/UX polish** — animations, mobile responsiveness

```bash
# Fork → branch → build → PR
git checkout -b feature/your-feature
# make your changes
git push origin feature/your-feature
# open PR on GitHub
```

---

## License

MIT — free forever, open always.

---

<div align="center">

**Made with 💚 for India's cybersecurity future.**

*If Vaathi helped you learn something new, leave a ⭐ — it helps others find it.*

</div>
