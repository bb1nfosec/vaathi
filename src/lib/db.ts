import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // If TURSO_AUTH_TOKEN is set and DATABASE_URL is a libsql:// URL,
  // use the libSQL adapter for Turso cloud database (Vercel deployment)
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN
  const databaseUrl = process.env.DATABASE_URL || ''

  if (tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    // Dynamic import to avoid bundling issues on Vercel/Turbopack
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

  // Standard SQLite (local development)
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
