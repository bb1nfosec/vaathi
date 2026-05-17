import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { ctfChallenges } from '@/lib/vaathi-data'

// POST /api/ctf/submit — Validate a flag submission
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, challengeId, submittedFlag } = body

    if (!userId || !challengeId || !submittedFlag) {
      return NextResponse.json({ error: 'userId, challengeId, and flag required' }, { status: 400 })
    }

    // Find the challenge
    const challenge = ctfChallenges.find((c) => c.id === challengeId)
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Check if already solved
    const existing = await db.completedCTF.findFirst({
      where: { userId, challengeId },
    })

    if (existing) {
      return NextResponse.json({ message: 'Already solved', alreadySolved: true })
    }

    // Validate flag (case-insensitive)
    const isCorrect = submittedFlag.trim().toUpperCase() === challenge.flag.toUpperCase()

    if (!isCorrect) {
      return NextResponse.json({ correct: false, message: 'Incorrect flag. Try again!' })
    }

    // Record completion
    await db.completedCTF.create({
      data: {
        userId,
        challengeId,
        pointsEarned: challenge.points,
      },
    })

    // Update user XP
    const user = await db.user.findUnique({ where: { id: userId } })
    if (user) {
      const newXP = user.xp + challenge.points
      const newLevel = Math.floor(newXP / 1000) + 1
      let badges = JSON.parse(user.badges || '[]')

      const allCTFs = await db.completedCTF.findMany({ where: { userId } })
      if (allCTFs.length >= 1 && !badges.includes('first-ctf')) {
        badges.push('first-ctf')
      }

      await db.user.update({
        where: { id: userId },
        data: { xp: newXP, level: newLevel, badges: JSON.stringify(badges) },
      })

      return NextResponse.json({
        correct: true,
        points: challenge.points,
        newXp: newXP,
        newLevel,
        badges,
        message: `Flag captured! +${challenge.points} points`,
      })
    }

    return NextResponse.json({ correct: true, points: challenge.points })
  } catch (error) {
    console.error('CTF submit error:', error)
    return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 })
  }
}
