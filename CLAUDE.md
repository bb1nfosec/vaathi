# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server on port 3000 (logs to dev.log)
npm run build        # Build for production (Next.js standalone output)
npm run start        # Run production build via Bun

# Linting
npm run lint         # ESLint (Next.js config)

# Database
npm run db:push      # Push schema to DB (local SQLite or Turso)
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Create and run a migration
npm run db:reset     # Reset all data (destructive)

# Deployment
bash deploy.sh       # Full automated deploy to Vercel + Turso
```

## Environment

Copy `.env.example` to `.env` and set:
- `DATABASE_URL=file:./db/dev.db` — local SQLite path (relative to repo root)
- `TURSO_AUTH_TOKEN` — only needed for Turso (production); if set alongside a `libsql://` URL, the app uses the libSQL adapter automatically

No other env vars are required for local dev.

## Architecture

**Single-page application** — `src/app/page.tsx` is the only route. Navigation is entirely client-side via a Zustand view state (`currentView`). The store (`src/store/vaathi-store.ts`) is the single source of truth for all app state.

**BYOLLM (Bring Your Own LLM)** — the app stores the user's API key in the DB. Every API route fetches the user record, reads their `llmProvider`/`llmApiKey`/`llmModel`/`llmBaseUrl`, and proxies requests to the provider's OpenAI-compatible endpoint. No server-side API keys are needed.

**Views and their components** (`src/components/vaathi/`):

| View key | Component | Purpose |
|---|---|---|
| `landing` | `landing.tsx` | Marketing / entry point |
| `onboarding` | `onboarding.tsx` | 4-step wizard: name → language → LLM config |
| `dashboard` | `dashboard.tsx` | XP, tier, recent activity |
| `assessment` | `assessment-chat.tsx` | Conversational skill eval, generates roadmap |
| `roadmap` | `learning-roadmap.tsx` | Personalized topic list with status |
| `topic-learn` | `topic-learn.tsx` | AI explanation + micro-tasks + quiz per topic |
| `guru` | `guru-chat.tsx` | Free-form streaming chat; parses lab/CTF JSON from responses |
| `lab` | `lab-session.tsx` | Step-by-step lab session with terminal UI |
| `arena` | `arena.tsx` | CTF challenge + flag submission |
| `profile` | `profile.tsx` | Edit name/language/LLM settings, badge showcase |

**API routes** (`src/app/api/`):

| Route | Purpose |
|---|---|
| `POST /api/guru` | Streaming LLM proxy for Guru chat; saves messages to DB |
| `POST /api/assessment` | Streaming assessment + roadmap generation |
| `POST /api/topic-learn` | Actions: `start`, `explain`, `quiz`, `microtask`, `evaluate-task`, `complete`, `review` |
| `GET/POST /api/profile` | Fetch or create/update user profile (API key never returned) |
| `GET /api/roadmap` | Load roadmap topics for a user (includes SM-2 fields) |
| `POST /api/labs/complete` | Record lab completion, award XP/badges |
| `POST /api/ctf/submit` | Validate CTF flag, award points/badges |
| `GET /api/progress` | XP/tier calculations |
| `GET /api/health` | Health check |

**`/api/topic-learn` action reference:**

| Action | Body params | Effect |
|---|---|---|
| `start` | — | Sets topic `status → in_progress` |
| `explain` | — | Returns AI explanation (cached after first call) |
| `quiz` | — | Returns 3-question MCQ (cached after first call) |
| `microtask` | — | Generates a fresh hands-on exercise |
| `evaluate-task` | `taskType`, `taskTitle`, `taskContent`, `expectedAnswer`, `studentAnswer` | AI scores the answer |
| `complete` | `quizScore?` (SM-2 quality 0–5) | Marks completed, runs SM-2, updates streak, unlocks next topic |
| `review` | `quality` (0–5) | SM-2 reschedule for an already-completed topic, updates streak |

**SM-2 quality mapping** (quiz score out of 3):

| Correct answers | Quality |
|---|---|
| 3/3 | 5 (perfect) |
| 2/3 | 4 (good) |
| 1/3 | 2 (fail — interval resets) |
| 0/3 | 1 (fail — interval resets) |
| No quiz (plain "Mark Complete") | 3 (neutral default) |

**Database** (`src/lib/db.ts`):
- Prisma schema (`prisma/schema.prisma`) defines the models; the SQLite provider is a dummy — actual connections are handled by `db.ts`.
- `db.ts` detects Turso vs local SQLite at runtime by checking `TURSO_AUTH_TOKEN` + `libsql://` URL prefix.
- `ensureSchema()` runs `CREATE TABLE IF NOT EXISTS` statements on cold start — no migration needed on Turso.
- Turbopack bakes `process.env.DATABASE_URL` as the string `"undefined"` at build time; `db.ts` works around this by reading env vars via `process.env[key]` bracket notation and re-assigning before Prisma instantiation.
- `next.config.ts` marks `@libsql/client`, `@prisma/adapter-libsql`, and `@prisma/client` as `serverExternalPackages` to prevent bundling.

**Streaming pattern** — all AI responses use SSE (`text/event-stream`). The store reads chunks with a `ReadableStream` reader and accumulates content into `streamContent`. Guru responses are scanned for embedded lab/CTF JSON (fenced code block or raw `{...}`) and automatically route the user to `lab` or `arena` view.

**User identity** — no auth. The user's `id` (cuid) is persisted in `localStorage` under `vaathi_userId`. On `initSession`, the store fetches the profile by this ID and routes to `dashboard` or `landing`.

**Spaced repetition fields** (on `RoadmapTopic`):

| Field | Default | Purpose |
|---|---|---|
| `reviewCount` | 0 | Total SM-2 reviews completed |
| `reviewInterval` | 1 | Current interval in days |
| `easeFactor` | 2.5 | SM-2 ease factor (min 1.3) |
| `lastReviewedAt` | null | Timestamp of last review |
| `nextReviewAt` | null | When the next review is due |

`User.streakLastDate` stores the date of the last streak increment to prevent same-day double-counting.

## Key constants (in `vaathi-store.ts`)

- `TIER_CONFIG` — XP thresholds and display for all 5 tiers (egg → hatchling → script_kiddie → hacker → burn)
- `LANGUAGES` — 6 supported languages (English + 5 Indian languages)
- `LLM_PROVIDERS` — provider IDs, default base URLs, and model lists

## Prisma notes

- TypeScript build errors are intentionally suppressed (`ignoreBuildErrors: true` in `next.config.ts`) because Prisma's generated types sometimes conflict with the libSQL adapter typings.
- After modifying `prisma/schema.prisma`, run `npm run db:generate` then `npm run db:push`.
- The `TABLE_STATEMENTS` array in `db.ts` must be kept in sync with the schema manually when models change.
