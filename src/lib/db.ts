import { PrismaClient } from '@prisma/client'

/**
 * Read env vars using bracket notation to PREVENT Vercel/Turbopack
 * from inlining them at build time. Direct `process.env.DATABASE_URL`
 * gets statically replaced → becomes the literal string "undefined" in the bundle.
 */
function getEnv(key: string): string {
  return process.env[key] || ''
}

/**
 * Create a PrismaClient — env vars are read at call time via getEnv().
 * In production (Vercel serverless), always fresh per request.
 * In development, reuse via globalThis to avoid connection exhaustion.
 */
function createPrismaClient(): PrismaClient {
  const tursoAuthToken = getEnv('TURSO_AUTH_TOKEN')
  const databaseUrl = getEnv('DATABASE_URL')

  console.error('[db] createPrismaClient — hasToken:', !!tursoAuthToken, 'url:', databaseUrl ? databaseUrl.substring(0, 40) + '...' : 'EMPTY')

  // IMPORTANT: Explicitly set process.env['DATABASE_URL'] at runtime.
  // Turbopack bakes process.env.DATABASE_URL as the literal "undefined" at build time
  // into Prisma's generated constructor. By re-assigning it here before PrismaClient()
  // is instantiated, Prisma's internal env read gets the real runtime value.
  if (databaseUrl) {
    process.env['DATABASE_URL'] = databaseUrl
  }

  // Turso mode: need BOTH token and libsql:// URL
  if (tursoAuthToken.length > 0 && databaseUrl.startsWith('libsql://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSQL } = require('@prisma/adapter-libsql')

      // CRITICAL: Pass a CONFIG OBJECT to PrismaLibSQL, NOT a pre-created client.
      // PrismaLibSQL is a FACTORY — its connect() calls createClient(this.#config).
      // If we pass a client instance, @libsql/client sees no .url property,
      // falls back to process.env.DATABASE_URL → Turbopack baked "undefined" → error!
      const adapter = new PrismaLibSQL({
        url: databaseUrl,
        authToken: tursoAuthToken,
      })

      return new PrismaClient({ adapter })
    } catch (adapterErr: unknown) {
      const msg = adapterErr instanceof Error ? adapterErr.message : String(adapterErr)
      console.error('[db] libSQL adapter failed:', msg)
      // DON'T silently fall back to SQLite — if Turso is configured, adapter MUST work
      throw new Error(`Turso adapter failed: ${msg}. Ensure @prisma/adapter-libsql and @libsql/client are installed.`)
    }
  }

  // SQLite fallback (local dev)
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl || 'file:./dev.db',
      },
    },
  })
}

// Dev-only singleton
const globalForDb = globalThis as unknown as { prisma: PrismaClient | undefined }

/**
 * Lazy proxy — defers PrismaClient creation until first property access.
 * In production: fresh client every time (guarantees runtime env vars).
 * In development: reused via globalThis.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
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
    const tursoAuthToken = getEnv('TURSO_AUTH_TOKEN')
    const databaseUrl = getEnv('DATABASE_URL')

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
