import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // If TURSO_AUTH_TOKEN is set, use libSQL adapter (for Vercel/Turso deployment)
  // DATABASE_URL must be a libsql:// URL in that case
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN
  const databaseUrl = process.env.DATABASE_URL || ''

  if (tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })

    const adapter = new PrismaLibSQL(libsql)

    return new PrismaClient({
      adapter,
    })
  }

  // Standard SQLite (local dev with file:./db/dev.db)
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
