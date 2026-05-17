import { NextResponse } from 'next/server'

// Health check — verifies env vars and DB connection
export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {}

  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || ''
  checks.database_url = {
    ok: dbUrl.length > 0,
    detail: dbUrl ? `${dbUrl.substring(0, 30)}...` : 'NOT SET — add DATABASE_URL in Vercel env vars',
  }

  // Check TURSO_AUTH_TOKEN
  const tursoToken = process.env.TURSO_AUTH_TOKEN || ''
  checks.turso_auth_token = {
    ok: tursoToken.length > 0,
    detail: tursoToken ? `${tursoToken.substring(0, 8)}...` : 'NOT SET — add TURSO_AUTH_TOKEN in Vercel env vars',
  }

  // Check if DB is actually reachable
  const isTurso = !!(tursoToken && dbUrl.startsWith('libsql://'))
  if (isTurso) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client')
      const libsql = createClient({ url: dbUrl, authToken: tursoToken })
      const result = await libsql.execute('SELECT 1 as ok')
      checks.db_connection = {
        ok: true,
        detail: `Connected to Turso (${result.rows[0]?.ok})`,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      checks.db_connection = { ok: false, detail: msg }
    }
  } else if (dbUrl.startsWith('file:')) {
    checks.db_connection = { ok: true, detail: 'Local SQLite mode' }
  } else {
    checks.db_connection = {
      ok: false,
      detail: isTurso
        ? 'Turso env vars set but connection failed'
        : 'Not configured — set DATABASE_URL + TURSO_AUTH_TOKEN for Turso',
    }
  }

  const allOk = Object.values(checks).every((c) => c.ok)
  return NextResponse.json({ status: allOk ? 'healthy' : 'unhealthy', checks }, { status: allOk ? 200 : 500 })
}
