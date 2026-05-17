import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { labs as labsData } from '@/lib/vaathi-data'

// GET /api/labs — Return all labs (from static data, checks completion from DB)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get completed lab IDs from DB if user exists
    let completedLabIds: string[] = []
    if (userId) {
      const completedLabs = await db.completedLab.findMany({
        where: { userId },
      })
      completedLabIds = completedLabs.map((cl) => cl.labId)
    }

    return NextResponse.json({
      labs: labsData.map((lab) => ({
        ...lab,
        completed: completedLabIds.includes(lab.id),
      })),
    })
  } catch (error) {
    console.error('Labs GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 })
  }
}
