import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // If TURSO_DATABASE_URL is set, use libSQL adapter (for Vercel/Turso deployment)
  // Otherwise, fall back to standard PrismaClient (for local SQLite development)
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL?.startsWith('libsql://') ? process.env.DATABASE_URL : null
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoAuthToken) {
    // Dynamic import for Turso (edge-compatible)
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })

    const adapter = new PrismaLibSQL(libsql)

    return new PrismaClient({
      adapter,
    })
  }

  // Standard SQLite (local dev)
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
