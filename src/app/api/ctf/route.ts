import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { ctfChallenges } from '@/lib/vaathi-data'

// GET /api/ctf — Return all CTF challenges with completion status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let completedCTFIds: string[] = []
    if (userId) {
      const completed = await db.completedCTF.findMany({ where: { userId } })
      completedCTFIds = completed.map((c) => c.challengeId)
    }

    return NextResponse.json({
      challenges: ctfChallenges.map((ctf) => ({
        ...ctf,
        solved: completedCTFIds.includes(ctf.id),
      })),
    })
  } catch (error) {
    console.error('CTF GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch CTFs' }, { status: 500 })
  }
}
