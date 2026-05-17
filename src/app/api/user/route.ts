import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, tier, xp, level, streak, college, state, skills, badges } = body

    // Upsert: find existing user by id or create new
    let user
    if (body.id) {
      user = await db.user.update({
        where: { id: body.id },
        data: {
          name: name || undefined,
          tier: tier || undefined,
          xp: xp ?? undefined,
          level: level ?? undefined,
          streak: streak ?? undefined,
          college: college || undefined,
          state: state || undefined,
          skills: skills ? JSON.stringify(skills) : undefined,
          badges: badges ? JSON.stringify(badges) : undefined,
        },
      })
    } else {
      user = await db.user.create({
        data: {
          name: name || 'Hacker',
          tier: tier || 'egg',
          xp: xp || 0,
          level: level || 1,
          streak: streak || 0,
          college: college || '',
          state: state || '',
          skills: skills ? JSON.stringify(skills) : '{}',
          badges: badges ? JSON.stringify(badges) : '[]',
        },
      })
    }

    // Fetch relations
    const completedLabs = await db.completedLab.findMany({
      where: { userId: user.id },
    })
    const completedCTFs = await db.completedCTF.findMany({
      where: { userId: user.id },
    })
    const recentMessages = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      ...user,
      skills: JSON.parse(user.skills || '{}'),
      badges: JSON.parse(user.badges || '[]'),
      completedLabs: completedLabs.map((cl) => cl.labId),
      completedCTFs: completedCTFs.map((cc) => cc.challengeId),
      recentMessages: recentMessages.reverse(),
    })
  } catch (error) {
    console.error('User POST error:', error)
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const completedLabs = await db.completedLab.findMany({
      where: { userId: user.id },
    })
    const completedCTFs = await db.completedCTF.findMany({
      where: { userId: user.id },
    })
    const recentMessages = await db.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      ...user,
      skills: JSON.parse(user.skills || '{}'),
      badges: JSON.parse(user.badges || '[]'),
      completedLabs: completedLabs.map((cl) => cl.labId),
      completedCTFs: completedCTFs.map((cc) => cc.challengeId),
      recentMessages: recentMessages.reverse(),
    })
  } catch (error) {
    console.error('User GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
