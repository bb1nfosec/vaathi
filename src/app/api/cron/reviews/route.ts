// Vercel Cron: daily at 9am UTC
// npm install web-push  ← run this on the server if VAPID keys are configured
import { NextResponse } from 'next/server'
import { db, ensureSchema } from '@/lib/db'

function getEnv(key: string): string {
  return process.env[key] || ''
}

export async function GET() {
  try {
    await ensureSchema()

    const vapidPublicKey = getEnv('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = getEnv('VAPID_PRIVATE_KEY')
    const vapidEmail = getEnv('VAPID_EMAIL')

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      return NextResponse.json({ skipped: true, reason: 'VAPID env vars not set' })
    }

    // Find all topics due for review
    const now = new Date()
    const dueTopics = await (db as any).roadmapTopic.findMany({
      where: {
        status: 'completed',
        nextReviewAt: { lte: now },
      },
      include: {
        roadmap: {
          include: {
            user: {
              include: {
                pushSubscriptions: true,
              },
            },
          },
        },
      },
    })

    // Group by userId
    const userTopicMap = new Map<string, { topics: string[]; subscriptions: { endpoint: string; p256dh: string; auth: string }[] }>()

    for (const topic of dueTopics) {
      const user = topic.roadmap?.user
      if (!user) continue
      if (!userTopicMap.has(user.id)) {
        userTopicMap.set(user.id, {
          topics: [],
          subscriptions: (user.pushSubscriptions || []).map((s: { endpoint: string; p256dh: string; auth: string }) => ({
            endpoint: s.endpoint,
            p256dh: s.p256dh,
            auth: s.auth,
          })),
        })
      }
      userTopicMap.get(user.id)!.topics.push(topic.title)
    }

    let sent = 0
    let failed = 0

    // Send push notifications
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const webpush = require('web-push')
      webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey)

      for (const [, { topics, subscriptions }] of userTopicMap.entries()) {
        if (subscriptions.length === 0) continue

        const topicCount = topics.length
        const message = topicCount === 1
          ? `"${topics[0]}" is ready for spaced repetition review!`
          : `${topicCount} topics ready for review — keep your streak alive!`

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              message
            )
            sent++
          } catch {
            failed++
          }
        }
      }
    } catch (importErr) {
      const msg = importErr instanceof Error ? importErr.message : String(importErr)
      return NextResponse.json({
        skipped: true,
        reason: `web-push not installed: ${msg}. Run: npm install web-push`,
      })
    }

    return NextResponse.json({
      ok: true,
      usersWithDueTopics: userTopicMap.size,
      notificationsSent: sent,
      notificationsFailed: failed,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
