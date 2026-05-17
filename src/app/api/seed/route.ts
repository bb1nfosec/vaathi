import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { labs as labsData, ctfChallenges } from '@/lib/vaathi-data'

// Seed labs and CTFs into DB on first access
async function ensureSeeded() {
  const labCount = await db.lab.count()
  if (labCount === 0) {
    for (const lab of labsData) {
      await db.lab.create({
        data: {
          id: lab.id,
          title: lab.title,
          description: lab.description,
          category: lab.category,
          difficulty: lab.difficulty,
          duration: lab.duration,
          xpReward: lab.xpReward,
          flag: lab.flag,
          steps: JSON.stringify(lab.steps),
          hints: JSON.stringify(lab.hints),
        },
      })
    }
    for (const ctf of ctfChallenges) {
      await db.cTFChallenge.create({
        data: {
          id: ctf.id,
          title: ctf.title,
          description: ctf.description,
          difficulty: ctf.difficulty,
          points: ctf.points,
          flag: ctf.flag,
          category: ctf.category,
          participants: ctf.participants,
          timeRemaining: ctf.timeRemaining,
        },
      })
    }
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeeded()
    return NextResponse.json({ success: true, message: 'Database seeded' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
