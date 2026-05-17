# 🛡️ Vaathi — India's Open Source Cybersecurity Learning OS

> *"From zero to ethical hacker — in your language, at your pace, on your machine."*

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## What is Vaathi?

Vaathi is a comprehensive, open-source cybersecurity learning platform designed specifically for Indian students. It combines three core pillars into one seamless experience:

- 🧠 **Guru AI** — An adaptive AI mentor that remembers you across sessions, explains concepts in your language (English/Hindi/Tamil), and guides you like a brilliant college senior
- ⚔️ **Labs** — 15+ browser-based, offline-capable sandboxed hacking environments across Networking, Web Hacking, Linux, Cryptography, Malware Analysis, and Indian Context categories
- 🏆 **Arena** — CTF challenges, national leaderboard with college-wise/state-wise rankings, team mode, and on-chain certificate NFTs

## The Problem

Indian CS students wanting to learn cybersecurity face:
- **TryHackMe/HackTheBox** — expensive ($14/month), fully in English, no Indian context
- **YouTube tutorials** — scattered, outdated, no hands-on environment
- **College curriculum** — teaches theory, never lets you touch a real terminal
- **AI tools** — refuse to explain attack techniques, even for learning
- **No adaptive path** — a beginner and an intermediate get the same content

**Vaathi fixes all five simultaneously.**

## Features

### Adaptive Skill Assessment
10-question quiz that places you into one of 5 tiers:
- 🥚 **Egg** — Never touched a terminal
- 🐣 **Hatch** — Knows basics, wrote some code
- 🐦 **Fly** — Comfortable with Linux, networking
- 🦅 **Soar** — Has done CTFs, knows exploits
- 🔥 **Burn** — Reverse engineering, 0-days territory

### Guru AI Chat
- Remembers your weak spots, wins, and learning style
- Explains like a senior — casual, fun, uses analogies
- Vernacular mode: English, Hindi, Tamil
- Refuses nothing educational — explains in sandboxed context

### Hands-On Labs
- Networking: Wireshark, ARP spoofing, DNS reconnaissance
- Web Hacking: SQL injection, XSS, CSRF, IDOR
- Linux: File permissions, bash scripting, privilege escalation
- Cryptography: Caesar cipher to RSA cracking
- Malware: Static analysis of real samples
- Indian Context: UPI fraud patterns, Aadhaar phishing, OTP bypass

### CTF Arena
- Weekly challenges with Indian-themed scenarios
- National leaderboard (20+ players from IITs, NITs, VIT, BITS)
- Team mode for college competitions
- Bug bounty simulation

### Personal Dashboard
- 30-day personalized learning roadmap
- Skill fingerprint visualization
- XP and leveling system
- Activity heatmap and streak tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| State | Zustand |
| Database | Prisma ORM, SQLite |
| Icons | Lucide React |
| Auth | GitHub OAuth (ready) |

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/bb1nfosec/vaathi.git
cd vaathi

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vaathi/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/
│   │   ├── globals.css         # Cybersecurity theme
│   │   ├── layout.tsx          # Root layout (dark mode)
│   │   └── page.tsx            # SPA entry point
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── vaathi/
│   │       ├── navbar.tsx      # Navigation bar
│   │       ├── landing.tsx     # Marketing landing page
│   │       ├── assessment.tsx  # Skill assessment quiz
│   │       ├── dashboard.tsx   # Personalized dashboard
│   │       ├── guru-chat.tsx   # AI mentor chat
│   │       ├── labs-browser.tsx# Lab catalog
│   │       ├── lab-detail.tsx  # Individual lab with terminal
│   │       ├── arena.tsx       # CTF challenges + leaderboard
│   │       └── profile.tsx     # User profile + skill tree
│   ├── lib/
│   │   └── vaathi-data.ts      # Mock data (labs, CTFs, etc.)
│   └── store/
│       └── vaathi-store.ts     # Zustand state management
└── public/
    └── vaathi-logo.png         # Generated logo
```

## Architecture

Vaathi is a **single-page application** with client-side navigation via Zustand. All views are rendered from the root `/` route:

```
Landing → Assessment → Dashboard
                       ├── Labs → Lab Detail
                       ├── Arena (CTF + Leaderboard)
                       ├── Guru AI Chat
                       └── Profile
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Build new labs** using the Lab SDK (markdown + Docker)
2. **Add translations** in Hindi, Tamil, Telugu, and other Indian languages
3. **Contribute tools** — Nmap, Burp Suite, Metasploit wrappers
4. **Report bugs** and suggest features
5. **Share Vaathi** with your college cybersecurity club

## Open Source Flywheel

```
Students use it → get good → contribute labs back
     ↓
More labs → more students → more contributors
     ↓
College clubs adopt it as their official platform
     ↓
Companies sponsor CTF prizes → monetization without paywalls
```

## License

MIT License — free forever, open always.

---

**Made with ❤️ for India's cybersecurity future.**
