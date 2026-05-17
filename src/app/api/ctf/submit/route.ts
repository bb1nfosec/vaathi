import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST: Validate CTF flag submission
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, challengeTitle, submittedFlag, expectedFlag, category, difficulty, points } = body

    if (!userId || !challengeTitle || !submittedFlag) {
      return NextResponse.json({ error: 'userId, challengeTitle, and submittedFlag required' }, { status: 400 })
    }

    if (!expectedFlag) {
      return NextResponse.json({ error: 'No expected flag provided. The challenge needs to generate a flag first.' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already solved
    const existing = await db.completedCTF.findFirst({
      where: { userId, challengeTitle },
    })

    if (existing) {
      return NextResponse.json({ correct: true, alreadySolved: true, message: 'You already solved this one! 🎉' })
    }

    // Compare flags (case-insensitive)
    const isCorrect = submittedFlag.trim().toLowerCase() === expectedFlag.trim().toLowerCase()

    if (!isCorrect) {
      return NextResponse.json({
        correct: false,
        message: ' Nope! That flag is incorrect. Try again! 🤔',
      })
    }

    // Flag is correct! Save and award XP
    const xpToAward = points || 300

    await db.completedCTF.create({
      data: {
        userId,
        challengeTitle,
        category: category || 'misc',
        difficulty: difficulty || 'medium',
        pointsEarned: xpToAward,
      },
    })

    // Update XP via progress
    const topic = category || challengeTitle.toLowerCase().replace(/\s+/g, '_')
    const progressRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        xpToAdd: xpToAward,
        topic,
        topicLevel: 2,
      }),
    })

    const progressData = await progressRes.json()

    // Check for CTF badges
    const ctfCount = await db.completedCTF.count({ where: { userId } })
    const newBadges: Array<{ badgeId: string; name: string; emoji: string }> = []

    if (ctfCount === 1) {
      const existingBadge = await db.userBadge.findFirst({ where: { userId, badgeId: 'first-ctf' } })
      if (!existingBadge) {
        await db.userBadge.create({ data: { userId, badgeId: 'first-ctf', name: 'Flag Hunter', emoji: '🏴' } })
        newBadges.push({ badgeId: 'first-ctf', name: 'Flag Hunter', emoji: '🏴' })
      }
    }
    if (ctfCount === 10) {
      const existingBadge = await db.userBadge.findFirst({ where: { userId, badgeId: 'ctf-10' } })
      if (!existingBadge) {
        await db.userBadge.create({ data: { userId, badgeId: 'ctf-10', name: 'CTF Master', emoji: '👑' } })
        newBadges.push({ badgeId: 'ctf-10', name: 'CTF Master', emoji: '👑' })
      }
    }

    return NextResponse.json({
      correct: true,
      alreadySolved: false,
      message: '🎉 Correct! You cracked it! Well done!',
      points: xpToAward,
      newXp: progressData.xp,
      newLevel: progressData.level,
      tierChanged: progressData.tierChanged,
      newBadges: [...(progressData.newBadges || []), ...newBadges],
    })
  } catch (error) {
    console.error('CTF submit API error:', error)
    return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 })
  }
}
