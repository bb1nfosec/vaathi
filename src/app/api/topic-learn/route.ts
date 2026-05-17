import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const PROVIDER_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openai: 'https://api.openai.com/v1',
  together: 'https://api.together.xyz/v1',
  ollama: 'http://localhost:11434/v1',
}

// POST: Get topic explanation, quiz, or mark as complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, topicId, action, quizScore } = body

    if (!userId || !topicId || !action) {
      return NextResponse.json({ error: 'userId, topicId, and action required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const topic = await db.roadmapTopic.findUnique({
      where: { id: topicId },
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Action: start - mark topic as in_progress
    if (action === 'start') {
      await db.roadmapTopic.update({
        where: { id: topicId },
        data: { status: 'in_progress' },
      })
      return NextResponse.json({ success: true, status: 'in_progress' })
    }

    // Action: complete - mark topic as completed, award XP, unlock next
    if (action === 'complete') {
      await db.roadmapTopic.update({
        where: { id: topicId },
        data: { status: 'completed' },
      })

      // Award XP
      const xpToAdd = topic.xpReward || 50
      const newTotalXp = user.xp + xpToAdd
      const newLevel = Math.floor(newTotalXp / 100) + 1

      const tierThresholds = [
        { tier: 'egg', minXp: 0 },
        { tier: 'hatchling', minXp: 100 },
        { tier: 'script_kiddie', minXp: 500 },
        { tier: 'hacker', minXp: 2000 },
        { tier: 'burn', minXp: 5000 },
      ]
      let newTier = 'egg'
      for (const t of tierThresholds) {
        if (newTotalXp >= t.minXp) newTier = t.tier
      }

      await db.user.update({
        where: { id: userId },
        data: {
          xp: newTotalXp,
          level: newLevel,
          tier: newTier,
          lastActive: new Date(),
        },
      })

      // Unlock next locked topic
      const roadmap = await db.learningRoadmap.findUnique({
        where: { id: topic.roadmapId },
        include: { topics: { orderBy: { priority: 'asc' } } },
      })

      if (roadmap) {
        const currentIdx = roadmap.topics.findIndex((t) => t.id === topicId)
        if (currentIdx >= 0 && currentIdx + 1 < roadmap.topics.length) {
          const nextTopic = roadmap.topics[currentIdx + 1]
          if (nextTopic.status === 'locked') {
            await db.roadmapTopic.update({
              where: { id: nextTopic.id },
              data: { status: 'available' },
            })
          }
        }
      }

      // Check badge
      const completedCount = await db.roadmapTopic.count({
        where: { roadmapId: topic.roadmapId, status: 'completed' },
      })
      const totalTopics = await db.roadmapTopic.count({
        where: { roadmapId: topic.roadmapId },
      })
      if (completedCount === totalTopics) {
        const existingBadge = await db.userBadge.findFirst({
          where: { userId, badgeId: 'roadmap-complete' },
        })
        if (!existingBadge) {
          await db.userBadge.create({
            data: { userId, badgeId: 'roadmap-complete', name: 'Roadmap Complete', emoji: '🎯' },
          })
        }
      }

      return NextResponse.json({
        success: true,
        xpEarned: xpToAdd,
        totalXp: newTotalXp,
        newLevel,
        newTier,
      })
    }

    // Action: explain - generate explanation using LLM
    if (action === 'explain') {
      if (!user.llmApiKey) {
        return NextResponse.json({ error: 'NO_API_KEY', message: 'Set up your LLM API key first.' }, { status: 200 })
      }

      // Check cache
      if (topic.explanation) {
        return NextResponse.json({ explanation: topic.explanation, cached: true })
      }

      const baseUrl = user.llmProvider === 'custom' && user.llmBaseUrl
        ? user.llmBaseUrl.replace(/\/+$/, '')
        : (PROVIDER_URLS[user.llmProvider] || PROVIDER_URLS.groq)

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.llmApiKey}`,
        },
        body: JSON.stringify({
          model: user.llmModel,
          messages: [
            {
              role: 'system',
              content: `You are Vaathi Guru, a cybersecurity tutor. Explain topics clearly in the student's language (${user.language}). Use examples, analogies, Indian context (CERT-In, UPI frauds, UIDAI). Be thorough but concise (4-6 paragraphs). Suggest 3-5 commands/tools at the end. Be fun and encouraging.`,
            },
            { role: 'user', content: `Explain this cybersecurity topic to me: "${topic.title}". ${topic.description ? `Context: ${topic.description}` : ''}` },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'LLM_ERROR', message: 'Failed to generate explanation.' }, { status: 200 })
      }

      const data = await response.json()
      const explanation = data.choices?.[0]?.message?.content || 'Could not generate explanation.'

      // Cache it
      await db.roadmapTopic.update({
        where: { id: topicId },
        data: { explanation },
      })

      return NextResponse.json({ explanation, cached: false })
    }

    // Action: quiz - generate quiz using LLM
    if (action === 'quiz') {
      if (!user.llmApiKey) {
        return NextResponse.json({ error: 'NO_API_KEY', message: 'Set up your LLM API key first.' }, { status: 200 })
      }

      // Check cache
      if (topic.quizJson && topic.quizJson !== '[]') {
        return NextResponse.json({ quiz: JSON.parse(topic.quizJson), cached: true })
      }

      const baseUrl = user.llmProvider === 'custom' && user.llmBaseUrl
        ? user.llmBaseUrl.replace(/\/+$/, '')
        : (PROVIDER_URLS[user.llmProvider] || PROVIDER_URLS.groq)

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.llmApiKey}`,
        },
        body: JSON.stringify({
          model: user.llmModel,
          messages: [
            {
              role: 'system',
              content: `Generate a quiz with exactly 3 multiple choice questions about this cybersecurity topic. Test UNDERSTANDING not memorization. Each question has 4 options. Output ONLY valid JSON array:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctIndex":0,"explanation":"..."}]`,
            },
            { role: 'user', content: `Topic: "${topic.title}". ${topic.description ? `Focus: ${topic.description}` : ''}` },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'LLM_ERROR', message: 'Failed to generate quiz.' }, { status: 200 })
      }

      const data = await response.json()
      let quizContent = data.choices?.[0]?.message?.content || '[]'

      // Try to extract JSON from response
      const jsonMatch = quizContent.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        quizContent = jsonMatch[0]
      }

      let quiz: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>
      try {
        quiz = JSON.parse(quizContent)
      } catch {
        quiz = [{
          question: `What is the main concept behind ${topic.title}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          explanation: 'This is a fallback question.',
        }]
      }

      // Cache it
      await db.roadmapTopic.update({
        where: { id: topicId },
        data: { quizJson: JSON.stringify(quiz) },
      })

      return NextResponse.json({ quiz, cached: false })
    }

    return NextResponse.json({ error: 'Unknown action. Use: start, explain, quiz, complete' }, { status: 400 })
  } catch (error) {
    console.error('Topic learn API error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Something went wrong.' }, { status: 200 })
  }
}
