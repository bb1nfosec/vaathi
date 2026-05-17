import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/labs/complete — Record a lab completion
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, labId, xpEarned, hintsUsed, stepsCompleted } = body

    if (!userId || !labId) {
      return NextResponse.json({ error: 'userId and labId required' }, { status: 400 })
    }

    // Check if already completed
    const existing = await db.completedLab.findFirst({
      where: { userId, labId },
    })

    if (existing) {
      return NextResponse.json({ message: 'Lab already completed', alreadyCompleted: true })
    }

    // Record completion
    const completedLab = await db.completedLab.create({
      data: {
        userId,
        labId,
        xpEarned: xpEarned || 0,
        hintsUsed: hintsUsed || 0,
        stepsCompleted: stepsCompleted || 0,
      },
    })

    // Update user XP and check for badges
    const user = await db.user.findUnique({ where: { id: userId } })
    if (user) {
      const allCompleted = await db.completedLab.findMany({ where: { userId } })
      const newXP = user.xp + xpEarned
      const newLevel = Math.floor(newXP / 1000) + 1
      let badges = JSON.parse(user.badges || '[]')

      // Earn badges
      if (allCompleted.length >= 5 && !badges.includes('five-labs')) {
        badges.push('five-labs')
      }
      if (allCompleted.length >= 10 && !badges.includes('ten-labs')) {
        badges.push('ten-labs')
      }

      await db.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel,
          badges: JSON.stringify(badges),
        },
      })

      return NextResponse.json({
        success: true,
        completedLab,
        newXp: newXP,
        newLevel,
        badges,
        message: `Lab completed! +${xpEarned} XP`,
      })
    }

    return NextResponse.json({ success: true, completedLab })
  } catch (error) {
    console.error('Lab complete error:', error)
    return NextResponse.json({ error: 'Failed to complete lab' }, { status: 500 })
  }
}
