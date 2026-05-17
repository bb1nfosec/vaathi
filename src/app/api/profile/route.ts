import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch user profile
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('id')
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      badges: { orderBy: { earnedAt: 'desc' } },
      completedLabs: { orderBy: { completedAt: 'desc' }, take: 10 },
      completedCTFs: { orderBy: { completedAt: 'desc' }, take: 10 },
      chatMessages: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Never send the API key to the client
  return NextResponse.json({
    id: user.id,
    name: user.name,
    language: user.language,
    llmProvider: user.llmProvider,
    llmModel: user.llmModel,
    hasApiKey: !!user.llmApiKey,
    tier: user.tier,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    lastActive: user.lastActive,
    topicProgress: user.topicProgress,
    createdAt: user.createdAt,
    badges: user.badges.map((b) => ({ id: b.id, badgeId: b.badgeId, name: b.name, emoji: b.emoji, earnedAt: b.earnedAt })),
    completedLabs: user.completedLabs,
    completedCTFs: user.completedCTFs,
    recentMessages: user.chatMessages.reverse().slice(0, 20),
  })
}

// POST: Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, language, llmProvider, llmApiKey, llmModel, llmBaseUrl } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (id) {
      // Update existing user
      const updateData: Record<string, unknown> = {
        name: name.trim(),
        updatedAt: new Date(),
      }
      if (language) updateData.language = language
      if (llmProvider) updateData.llmProvider = llmProvider
      if (llmModel) updateData.llmModel = llmModel
      if (llmBaseUrl !== undefined) updateData.llmBaseUrl = llmBaseUrl
      if (llmApiKey) updateData.llmApiKey = llmApiKey

      const user = await db.user.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({
        id: user.id,
        name: user.name,
        language: user.language,
        llmProvider: user.llmProvider,
        llmModel: user.llmModel,
        hasApiKey: !!user.llmApiKey,
        tier: user.tier,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      })
    } else {
      // Create new user
      const user = await db.user.create({
        data: {
          name: name.trim(),
          language: language || 'english',
          llmProvider: llmProvider || 'groq',
          llmApiKey: llmApiKey || '',
          llmModel: llmModel || 'llama-3.3-70b-versatile',
          llmBaseUrl: llmBaseUrl || '',
          streak: 1,
        },
      })

      // Award first login badge
      await db.userBadge.create({
        data: {
          userId: user.id,
          badgeId: 'first-journey',
          name: 'First Steps',
          emoji: '🚀',
        },
      })

      return NextResponse.json({
        id: user.id,
        name: user.name,
        language: user.language,
        llmProvider: user.llmProvider,
        llmModel: user.llmModel,
        hasApiKey: !!user.llmApiKey,
        tier: user.tier,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      })
    }
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
