import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const TIER_THRESHOLDS = [
  { tier: 'egg', minXp: 0 },
  { tier: 'hatchling', minXp: 100 },
  { tier: 'script_kiddie', minXp: 500 },
  { tier: 'hacker', minXp: 2000 },
  { tier: 'burn', minXp: 5000 },
]

function calcTier(xp: number): string {
  let tier = 'egg'
  for (const t of TIER_THRESHOLDS) {
    if (xp >= t.minXp) tier = t.tier
  }
  return tier
}

function calcLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

// POST: Update XP, level, tier
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, xpToAdd, topic, topicLevel } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newTotalXp = user.xp + (xpToAdd || 0)
    const newTier = calcTier(newTotalXp)
    const newLevel = calcLevel(newTotalXp)
    const tierChanged = newTier !== user.tier

    // Update topic progress
    let updatedTopicProgress = user.topicProgress
    if (topic) {
      try {
        const topics = JSON.parse(user.topicProgress || '{}')
        topics[topic] = topicLevel || ((topics[topic] || 0) + 1)
        updatedTopicProgress = JSON.stringify(topics)
      } catch {
        updatedTopicProgress = JSON.stringify({ [topic]: 1 })
      }
    }

    // Check for new badges
    const newBadges: Array<{ badgeId: string; name: string; emoji: string }> = []
    const existingBadges = await db.userBadge.findMany({ where: { userId } })
    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId))

    if (tierChanged && !existingBadgeIds.has(`tier-${newTier}`)) {
      newBadges.push({
        badgeId: `tier-${newTier}`,
        name: `${newTier.charAt(0).toUpperCase() + newTier.slice(1).replace('_', ' ')} Achieved`,
        emoji: newTier === 'burn' ? '🔥' : newTier === 'hacker' ? '🖥️' : newTier === 'script_kiddie' ? '💻' : newTier === 'hatchling' ? '🐣' : '🥚',
      })
    }

    if (newTotalXp >= 1000 && !existingBadgeIds.has('xp-1k')) {
      newBadges.push({ badgeId: 'xp-1k', name: '1K XP Club', emoji: '⭐' })
    }
    if (newTotalXp >= 5000 && !existingBadgeIds.has('xp-5k')) {
      newBadges.push({ badgeId: 'xp-5k', name: '5K XP Legend', emoji: '🌟' })
    }

    // Update streak
    const lastActive = user.lastActive
    const now = new Date()
    const diffMs = now.getTime() - lastActive.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    let newStreak = user.streak
    if (diffHours > 48) {
      newStreak = 1 // Reset streak
    } else if (diffHours > 4) {
      newStreak += 1 // Increment streak
    }

    // Save updates
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXp,
        level: newLevel,
        tier: newTier,
        streak: newStreak,
        lastActive: now,
        topicProgress: updatedTopicProgress,
      },
    })

    // Create badges
    for (const badge of newBadges) {
      await db.userBadge.create({
        data: { userId, ...badge },
      })
    }

    return NextResponse.json({
      success: true,
      xp: updatedUser.xp,
      level: updatedUser.level,
      tier: updatedUser.tier,
      streak: updatedUser.streak,
      tierChanged,
      newBadges,
    })
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
