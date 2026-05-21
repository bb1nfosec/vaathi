import { db, ensureSchema } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// SM-2 spaced repetition algorithm.
// quality: 0-5 (5 = perfect recall, 3 = correct with difficulty, <3 = incorrect)
// Returns the new interval (days), ease factor, and next review date.
function computeSM2(
  quality: number,
  reviewCount: number,
  prevInterval: number,
  prevEaseFactor: number
): { interval: number; easeFactor: number; nextReviewAt: Date } {
  quality = Math.max(0, Math.min(5, Math.round(quality)))

  let interval: number
  let easeFactor = prevEaseFactor

  if (quality >= 3) {
    if (reviewCount === 0) interval = 1
    else if (reviewCount === 1) interval = 6
    else interval = Math.round(prevInterval * prevEaseFactor)
    easeFactor = prevEaseFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    if (easeFactor < 1.3) easeFactor = 1.3
  } else {
    // Incorrect — restart interval, keep ease factor unchanged
    interval = 1
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)
  return { interval, easeFactor, nextReviewAt }
}

// Returns updated streak and streakLastDate based on the current date.
function computeStreak(
  currentStreak: number,
  streakLastDate: Date | null
): { streak: number; streakLastDate: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (!streakLastDate) return { streak: 1, streakLastDate: today }

  const last = new Date(streakLastDate.getFullYear(), streakLastDate.getMonth(), streakLastDate.getDate())
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000)

  if (diffDays === 0) return { streak: currentStreak, streakLastDate: last }
  if (diffDays === 1) return { streak: currentStreak + 1, streakLastDate: today }
  return { streak: 1, streakLastDate: today }
}

const PROVIDER_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
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
    await ensureSchema()

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

    // Action: complete - mark topic as completed, apply SM-2, award XP, update streak, unlock next
    if (action === 'complete') {
      // quizScore: SM-2 quality 0-5 (default 3 = "correct with difficulty")
      const quality: number = typeof quizScore === 'number' ? quizScore : 3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = topic as any
      const sm2 = computeSM2(quality, t.reviewCount ?? 0, t.reviewInterval ?? 1, t.easeFactor ?? 2.5)
      // Fields added in schema but not yet in generated Prisma types — cast required
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sm2Fields: any = {
        reviewCount: (t.reviewCount ?? 0) + 1,
        reviewInterval: sm2.interval,
        easeFactor: sm2.easeFactor,
        lastReviewedAt: new Date(),
        nextReviewAt: sm2.nextReviewAt,
      }

      await db.roadmapTopic.update({
        where: { id: topicId },
        data: { status: 'completed', ...sm2Fields },
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
      for (const th of tierThresholds) {
        if (newTotalXp >= th.minXp) newTier = th.tier
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streakUpdate = computeStreak(user.streak, (user as any).streakLastDate ?? null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streakFields: any = { streakLastDate: streakUpdate.streakLastDate }

      await db.user.update({
        where: { id: userId },
        data: {
          xp: newTotalXp,
          level: newLevel,
          tier: newTier,
          lastActive: new Date(),
          streak: streakUpdate.streak,
          ...streakFields,
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
        nextReviewAt: sm2.nextReviewAt,
        reviewInterval: sm2.interval,
        newStreak: streakUpdate.streak,
        streakChanged: streakUpdate.streak !== user.streak,
      })
    }

    // Action: review - SM-2 review of an already-completed topic
    // Body: { quality: 0-5 }  (5=perfect, 3=recalled with effort, <3=forgot)
    if (action === 'review') {
      const quality: number = typeof body.quality === 'number' ? body.quality : 3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = topic as any
      const sm2 = computeSM2(quality, t.reviewCount ?? 0, t.reviewInterval ?? 1, t.easeFactor ?? 2.5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sm2Fields: any = {
        reviewCount: (t.reviewCount ?? 0) + 1,
        reviewInterval: sm2.interval,
        easeFactor: sm2.easeFactor,
        lastReviewedAt: new Date(),
        nextReviewAt: sm2.nextReviewAt,
      }

      await db.roadmapTopic.update({
        where: { id: topicId },
        data: sm2Fields,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streakUpdate = computeStreak(user.streak, (user as any).streakLastDate ?? null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streakFields: any = { streakLastDate: streakUpdate.streakLastDate }

      await db.user.update({
        where: { id: userId },
        data: { lastActive: new Date(), streak: streakUpdate.streak, ...streakFields },
      })

      return NextResponse.json({
        success: true,
        nextReviewAt: sm2.nextReviewAt,
        reviewInterval: sm2.interval,
        reviewCount: (t.reviewCount ?? 0) + 1,
        newStreak: streakUpdate.streak,
        streakChanged: streakUpdate.streak !== user.streak,
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

    // Action: microtask - generate a tiny hands-on exercise
    if (action === 'microtask') {
      if (!user.llmApiKey) {
        return NextResponse.json({ error: 'NO_API_KEY', message: 'Set up your LLM API key first.' }, { status: 200 })
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
              content: `You are Vaathi Guru, a cybersecurity tutor generating tiny hands-on practice exercises (micro-tasks). These are exercises a student can do right in their browser or terminal — NO VMs or Docker needed.

Generate ONE micro-task based on the topic. Pick a random type from these:

1. **code-analysis**: Show a short code snippet (5-15 lines) with a vulnerability or security issue. Student must identify and explain it.
2. **command-challenge**: Show a cybersecurity command (nmap, tcpdump, netstat, etc.). Student must explain what it does and what output to expect.
3. **decode-encode**: Give a Base64/Hex/ROT13/Binary encoded string. Student must decode it to find a flag or hidden message.
4. **scenario-response**: Describe a realistic security scenario (incident, alert, suspicious activity). Student must explain what they'd do step by step.
5. **log-analysis**: Show a small log excerpt (web server, firewall, auth logs). Student must find the attack or anomaly.
6. **concept-explain**: Ask the student to explain a concept in their own words like they're teaching a beginner — tests deep understanding.

Rules:
- Make it SHORT and FOCUSED — student should finish in 2-5 minutes
- Difficulty should match: ${topic.difficulty}
- Use real-world examples from Indian cybersecurity context when possible
- The task should be FUN and engaging, not boring textbook stuff
- Include the answer/hint in the JSON so we can evaluate later
- Speak in ${user.language}

Output ONLY valid JSON, nothing else:
{
  "type": "code-analysis|command-challenge|decode-encode|scenario-response|log-analysis|concept-explain",
  "title": "Short catchy title for this task",
  "description": "1-2 sentence description of what the student needs to do",
  "content": "The actual content — code snippet, command, encoded string, log, or scenario text. Use \\n for newlines in code blocks.",
  "hint": "A helpful hint if the student gets stuck",
  "expectedAnswer": "What a correct answer looks like (used for AI evaluation — key points to check)",
  "explanation": "Full explanation of the answer — shown after student submits",
  "xpReward": 25
}`,
            },
            { role: 'user', content: `Generate a micro-task for topic: "${topic.title}". ${topic.description ? `Focus: ${topic.description}` : ''}` },
          ],
          temperature: 0.9,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'LLM_ERROR', message: 'Failed to generate task.' }, { status: 200 })
      }

      const data = await response.json()
      let taskContent = data.choices?.[0]?.message?.content || ''

      // Extract JSON
      const jsonMatch = taskContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'PARSE_ERROR', message: 'Failed to parse task.' }, { status: 200 })
      }

      let microtask
      try {
        microtask = JSON.parse(jsonMatch[0])
      } catch {
        return NextResponse.json({ error: 'PARSE_ERROR', message: 'Failed to parse task JSON.' }, { status: 200 })
      }

      return NextResponse.json({ microtask, cached: false })
    }

    // Action: evaluate-task - AI evaluates student's micro-task answer
    if (action === 'evaluate-task') {
      const { taskType, taskTitle, taskContent, expectedAnswer, studentAnswer } = body

      if (!user.llmApiKey) {
        return NextResponse.json({ error: 'NO_API_KEY', message: 'Set up your LLM API key first.' }, { status: 200 })
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
              content: `You are Vaathi Guru evaluating a student's answer to a micro-task. Be encouraging but honest.

Evaluate the student's answer against the expected answer. Check for:
1. Did they identify the core concept correctly?
2. Did they show understanding (not just keyword matching)?
3. Is their explanation clear?

For decode/encode tasks: check if the decoded result is correct.
For code-analysis: check if they found the vulnerability.
For command-challenge: check if they understand what the command does.
For scenario/log-analysis: check if their response is reasonable.

Respond in ${user.language}.

Output ONLY valid JSON:
{
  "correct": true/false,
  "score": "perfect|good|partial|wrong",
  "feedback": "1-2 sentence feedback on their answer — be encouraging!",
  "explanation": "Full explanation of the correct answer so they learn from it"
}`,
            },
            { role: 'user', content: `Task type: ${taskType}\nTask title: ${taskTitle}\nTask content:\n${taskContent}\n\nExpected answer key points:\n${expectedAnswer}\n\nStudent's answer:\n${studentAnswer}` },
          ],
          temperature: 0.4,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'LLM_ERROR', message: 'Failed to evaluate.' }, { status: 200 })
      }

      const data = await response.json()
      let evalContent = data.choices?.[0]?.message?.content || ''

      const jsonMatch = evalContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ evaluation: { correct: false, score: 'wrong', feedback: 'Could not evaluate. Try again.', explanation: '' } })
      }

      try {
        const evaluation = JSON.parse(jsonMatch[0])
        return NextResponse.json({ evaluation })
      } catch {
        return NextResponse.json({ evaluation: { correct: false, score: 'wrong', feedback: 'Evaluation error. Try again.', explanation: '' } })
      }
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

    return NextResponse.json({ error: 'Unknown action. Use: start, explain, quiz, microtask, evaluate-task, complete, review' }, { status: 400 })
  } catch (error) {
    console.error('Topic learn API error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Something went wrong.' }, { status: 200 })
  }
}
