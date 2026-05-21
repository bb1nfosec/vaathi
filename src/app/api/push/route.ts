import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSchema } from '@/lib/db'

function getEnv(key: string): string {
  return process.env[key] || ''
}

// GET /api/push — return VAPID public key
export async function GET() {
  const publicKey = getEnv('VAPID_PUBLIC_KEY')
  if (!publicKey) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 503 })
  }
  return NextResponse.json({ publicKey })
}

// POST /api/push — save subscription for user
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const { userId, subscription } = body

    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'Missing userId or subscription' }, { status: 400 })
    }

    // Upsert: delete old subscription if endpoint changed, then create
    await (db as any).pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/push — remove subscription
export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const { userId, endpoint } = body

    if (!userId || !endpoint) {
      return NextResponse.json({ error: 'Missing userId or endpoint' }, { status: 400 })
    }

    await (db as any).pushSubscription.deleteMany({
      where: { userId, endpoint },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
