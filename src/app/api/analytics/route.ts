import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSchema } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    await ensureSchema()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Fetch user with all related data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roadmap: {
          include: { topics: true },
        },
        completedLabs: { select: { completedAt: true } },
        completedCTFs: { select: { completedAt: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const topics = user.roadmap?.topics || []

    // Domain stats
    const domainMap = new Map<string, { total: number; completed: number; easeSum: number; easeCount: number }>()
    for (const topic of topics) {
      const domain = topic.domain || 'general'
      if (!domainMap.has(domain)) {
        domainMap.set(domain, { total: 0, completed: 0, easeSum: 0, easeCount: 0 })
      }
      const d = domainMap.get(domain)!
      d.total++
      if (topic.status === 'completed') {
        d.completed++
        d.easeSum += (topic as any).easeFactor || 2.5
        d.easeCount++
      }
    }

    const domainStats = Array.from(domainMap.entries()).map(([domain, s]) => ({
      domain,
      total: s.total,
      completed: s.completed,
      avgEaseFactor: s.easeCount > 0 ? Math.round((s.easeSum / s.easeCount) * 100) / 100 : 2.5,
    }))

    // Activity dates: collect from completedLabs + completedCTFs
    const activitySet = new Set<string>()
    for (const lab of user.completedLabs) {
      activitySet.add(lab.completedAt.toISOString().slice(0, 10))
    }
    for (const ctf of user.completedCTFs) {
      activitySet.add(ctf.completedAt.toISOString().slice(0, 10))
    }
    // Also add dates when topics were reviewed
    for (const topic of topics) {
      if ((topic as any).lastReviewedAt) {
        activitySet.add(new Date((topic as any).lastReviewedAt).toISOString().slice(0, 10))
      }
    }
    const activityDates = Array.from(activitySet).sort()

    // SM-2 stats
    const completedTopics = topics.filter((t) => t.status === 'completed')
    const topicsWithReviews = completedTopics.filter((t) => ((t as any).reviewCount || 0) > 0)
    const totalReviews = completedTopics.reduce((sum, t) => sum + ((t as any).reviewCount || 0), 0)
    const avgEaseFactor = completedTopics.length > 0
      ? Math.round((completedTopics.reduce((sum, t) => sum + ((t as any).easeFactor || 2.5), 0) / completedTopics.length) * 100) / 100
      : 2.5
    const avgInterval = topicsWithReviews.length > 0
      ? Math.round(topicsWithReviews.reduce((sum, t) => sum + ((t as any).reviewInterval || 1), 0) / topicsWithReviews.length)
      : 0

    const smStats = {
      totalReviews,
      avgEaseFactor,
      avgInterval,
      topicsWithReviews: topicsWithReviews.length,
    }

    // Streak computation from activityDates
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateSet = new Set(activityDates)

    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (dateSet.has(key)) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }

    const streakInfo = {
      currentStreak,
      longestStreak: user.streak || 0,
    }

    // Overall progress
    const totalTopics = topics.length
    const completedTopicsCount = topics.filter((t) => t.status === 'completed').length
    const availableTopics = topics.filter((t) => t.status === 'available').length

    const overallProgress = {
      totalTopics,
      completedTopics: completedTopicsCount,
      availableTopics,
      totalXP: user.xp,
      level: user.level,
    }

    return NextResponse.json({
      domainStats,
      activityDates,
      smStats,
      streakInfo,
      overallProgress,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
