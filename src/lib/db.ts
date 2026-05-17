import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  schemaEnsured: boolean
}

// Raw SQL to create all tables if they don't exist
// This makes Vercel deployment zero-config — no need for prisma db push
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'english',
  "llmProvider" TEXT NOT NULL DEFAULT 'groq',
  "llmApiKey" TEXT NOT NULL DEFAULT '',
  "llmModel" TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  "llmBaseUrl" TEXT NOT NULL DEFAULT '',
  "tier" TEXT NOT NULL DEFAULT 'egg',
  "xp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assessmentDone" BOOLEAN NOT NULL DEFAULT 0,
  "topicProgress" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'english',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CompletedLab" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "labTitle" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL DEFAULT '',
  "xpEarned" INTEGER NOT NULL DEFAULT 0,
  "hintsUsed" INTEGER NOT NULL DEFAULT 0,
  "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CompletedCTF" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "challengeTitle" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT '',
  "difficulty" TEXT NOT NULL DEFAULT '',
  "pointsEarned" INTEGER NOT NULL DEFAULT 0,
  "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "UserBadge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "emoji" TEXT NOT NULL DEFAULT '🏅',
  "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "LearningRoadmap" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "summary" TEXT NOT NULL DEFAULT '',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RoadmapTopic" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "roadmapId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "domain" TEXT NOT NULL DEFAULT 'general',
  "difficulty" TEXT NOT NULL DEFAULT 'beginner',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'locked',
  "explanation" TEXT NOT NULL DEFAULT '',
  "exercise" TEXT NOT NULL DEFAULT '',
  "quizJson" TEXT NOT NULL DEFAULT '[]',
  "xpReward" INTEGER NOT NULL DEFAULT 50,
  FOREIGN KEY ("roadmapId") REFERENCES "LearningRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "LearningRoadmap_userId_key" ON "LearningRoadmap"("userId");
`

function createPrismaClient(): PrismaClient {
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN
  const databaseUrl = process.env.DATABASE_URL || ''

  if (tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }

  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Ensure all tables exist on first call
// This eliminates the need for "prisma db push" during deployment
let _ensurePromise: Promise<void> | null = null

export async function ensureSchema(): Promise<void> {
  if (globalForPrisma.schemaEnsured) return
  if (_ensurePromise) return _ensurePromise

  _ensurePromise = (async () => {
    try {
      // Execute each CREATE TABLE statement separately
      const statements = SCHEMA_SQL.split(';').map(s => s.trim()).filter(s => s.length > 0)
      for (const sql of statements) {
        await db.$executeRawUnsafe(sql)
      }
      console.log('[vaathi] Database schema ensured ✓')
    } catch (err) {
      console.error('[vaathi] Schema setup error:', err)
    }
    globalForPrisma.schemaEnsured = true
  })()

  return _ensurePromise
}
