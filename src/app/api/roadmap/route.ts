import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch user's learning roadmap
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const roadmap = await db.learningRoadmap.findUnique({
    where: { userId },
    include: {
      topics: {
        orderBy: { priority: 'asc' },
      },
    },
  })

  if (!roadmap) {
    return NextResponse.json({ hasRoadmap: false })
  }

  const total = roadmap.topics.length
  const completed = roadmap.topics.filter((t) => t.status === 'completed').length
  const inProgress = roadmap.topics.filter((t) => t.status === 'in_progress').length

  return NextResponse.json({
    hasRoadmap: true,
    id: roadmap.id,
    summary: roadmap.summary,
    total,
    completed,
    inProgress,
    topics: roadmap.topics,
  })
}
