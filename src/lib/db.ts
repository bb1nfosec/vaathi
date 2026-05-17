import { PrismaClient } from '@prisma/client'

/**
 * Create a PrismaClient — always reads env vars at call time.
 * In production (Vercel serverless), the client is created fresh per request
 * so env vars are guaranteed to be available.
 * In development, we reuse a single client via globalThis.
 */
function createPrismaClient(): PrismaClient {
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || ''
  const databaseUrl = process.env.DATABASE_URL || ''

  // Turso mode: need BOTH token and libsql:// URL
  if (tursoAuthToken.length > 0 && databaseUrl.startsWith('libsql://')) {
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

  // SQLite fallback
  return new PrismaClient()
}

// Dev-only singleton to avoid connection exhaustion during hot reloads
const globalForDb = globalThis as unknown as { prisma: PrismaClient | undefined }

/**
 * Lazy proxy — defers PrismaClient creation until first actual query.
 * This guarantees process.env is fully populated on Vercel serverless.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    // In production (Vercel serverless): always create a fresh client per request
    // to guarantee env vars are read at request-time, not module-load time.
    // In development: reuse via globalThis to avoid connection exhaustion.
    if (process.env.NODE_ENV === 'production') {
      const client = createPrismaClient()
      const value = Reflect.get(client, prop, receiver)
      if (typeof value === 'function') return value.bind(client)
      return value
    }
    if (!globalForDb.prisma) {
      globalForDb.prisma = createPrismaClient()
    }
    const client = globalForDb.prisma
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') return value.bind(client)
    return value
  },
})

// ── Auto-create tables (no prisma db push needed) ──────────────────────

const TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
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
  )`,
  `CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "CompletedLab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "labTitle" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT '',
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "CompletedCTF" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "challengeTitle" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "difficulty" TEXT NOT NULL DEFAULT '',
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🏅',
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "LearningRoadmap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "RoadmapTopic" (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LearningRoadmap_userId_key" ON "LearningRoadmap"("userId")`,
]

// Track if schema has been ensured (per cold start)
const _schemaState = { ensured: false, promise: null as Promise<string | null> | null }

export async function ensureSchema(): Promise<string | null> {
  if (_schemaState.ensured) return null
  if (_schemaState.promise) return _schemaState.promise

  _schemaState.promise = (async () => {
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || ''
    const databaseUrl = process.env.DATABASE_URL || ''

    if (!databaseUrl) {
      _schemaState.promise = null
      return 'DATABASE_URL is not set'
    }

    const isTurso = tursoAuthToken.length > 0 && databaseUrl.startsWith('libsql://')

    try {
      if (isTurso) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createClient } = require('@libsql/client')
        const libsql = createClient({ url: databaseUrl, authToken: tursoAuthToken })
        await libsql.execute('SELECT 1')
        for (const sql of TABLE_STATEMENTS) {
          await libsql.execute(sql)
        }
      } else {
        for (const sql of TABLE_STATEMENTS) {
          await db.$executeRawUnsafe(sql)
        }
      }
      _schemaState.ensured = true
      return null
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      _schemaState.promise = null // allow retry
      return `Schema error: ${msg}`
    }
  })()

  return _schemaState.promise
}
