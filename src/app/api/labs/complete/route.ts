import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST: Record completed lab with XP earned
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, labTitle, difficulty, xpEarned, hintsUsed, topic, topicLevel } = body

    if (!userId || !labTitle) {
      return NextResponse.json({ error: 'userId and labTitle required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already completed
    const existing = await db.completedLab.findFirst({
      where: { userId, labTitle },
    })

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true, message: 'Already completed!' })
    }

    // Save completed lab
    await db.completedLab.create({
      data: {
        userId,
        labTitle,
        difficulty: difficulty || 'beginner',
        xpEarned: xpEarned || 0,
        hintsUsed: hintsUsed || 0,
      },
    })

    // Update XP via progress API
    const xpToAdd = xpEarned || 100
    const progressRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        xpToAdd,
        topic: topic || labTitle.toLowerCase().replace(/\s+/g, '_'),
        topicLevel: topicLevel || 1,
      }),
    })

    const progressData = await progressRes.json()

    // Check for lab count badge
    const labCount = await db.completedLab.count({ where: { userId } })
    const newBadges: Array<{ badgeId: string; name: string; emoji: string }> = []
    if (labCount === 1) {
      const existingBadge = await db.userBadge.findFirst({ where: { userId, badgeId: 'first-lab' } })
      if (!existingBadge) {
        await db.userBadge.create({ data: { userId, badgeId: 'first-lab', name: 'Lab Explorer', emoji: '🧪' } })
        newBadges.push({ badgeId: 'first-lab', name: 'Lab Explorer', emoji: '🧪' })
      }
    }
    if (labCount === 5) {
      const existingBadge = await db.userBadge.findFirst({ where: { userId, badgeId: 'lab-5' } })
      if (!existingBadge) {
        await db.userBadge.create({ data: { userId, badgeId: 'lab-5', name: 'Lab Enthusiast', emoji: '🔬' } })
        newBadges.push({ badgeId: 'lab-5', name: 'Lab Enthusiast', emoji: '🔬' })
      }
    }

    return NextResponse.json({
      success: true,
      alreadyCompleted: false,
      newXp: progressData.xp,
      newLevel: progressData.level,
      tierChanged: progressData.tierChanged,
      newBadges: [...(progressData.newBadges || []), ...newBadges],
    })
  } catch (error) {
    console.error('Lab complete API error:', error)
    return NextResponse.json({ error: 'Failed to record lab completion' }, { status: 500 })
  }
}
