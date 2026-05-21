import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSchema } from '@/lib/db'
import { PRESET_PATHS } from '@/lib/presets'

// GET /api/presets — return all preset paths (no sensitive data)
export async function GET() {
  return NextResponse.json({
    presets: PRESET_PATHS.map((p) => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      description: p.description,
      difficulty: p.difficulty,
      tags: p.tags,
      topicCount: p.topics.length,
    })),
  })
}

// POST /api/presets — apply a preset to a user
export async function POST(req: NextRequest) {
  try {
    await ensureSchema()
    const body = await req.json()
    const { userId, presetId } = body

    if (!userId || !presetId) {
      return NextResponse.json({ error: 'Missing userId or presetId' }, { status: 400 })
    }

    const preset = PRESET_PATHS.find((p) => p.id === presetId)
    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete existing roadmap
    await db.learningRoadmap.deleteMany({ where: { userId } })

    // Create new roadmap from preset
    const roadmap = await db.learningRoadmap.create({
      data: {
        userId,
        summary: `${preset.icon} ${preset.name} learning path — ${preset.description}`,
        topics: {
          create: preset.topics.map((topic, index) => ({
            title: topic.title,
            description: topic.description,
            domain: topic.domain,
            difficulty: topic.difficulty,
            priority: index,
            status: index === 0 ? 'available' : 'locked',
            xpReward: topic.xpReward,
          })),
        },
      },
      include: { topics: true },
    })

    // Mark user as assessed (preset counts as knowing your path)
    await db.user.update({
      where: { id: userId },
      data: { assessmentDone: true },
    })

    return NextResponse.json({
      ok: true,
      roadmapId: roadmap.id,
      topicCount: roadmap.topics.length,
      presetName: preset.name,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
