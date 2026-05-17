import { db, ensureSchema } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const PROVIDER_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  openai: 'https://api.openai.com/v1',
  together: 'https://api.together.xyz/v1',
  ollama: 'http://localhost:11434/v1',
}

// ASSESSMENT system prompt — AI asks nerdy questions to evaluate skill
const ASSESSMENT_PROMPT = `You are conducting a cybersecurity skill assessment for a student. Your job is to figure out what they know and what they DON'T know, so you can create a personalized learning roadmap.

IMPORTANT RULES:
1. You speak in the student's preferred language (they will tell you, or default to English).
2. Ask ONE question at a time. Wait for their response before asking the next.
3. Start with a broad question about what they know, then drill into specific domains.
4. Cover these domains in order: Networking, Linux, Web Security, Cryptography, Reconnaissance, Defense
5. For each domain, ask a TECHNICAL question that requires explanation — NOT multiple choice.
   Example: "Explain what a subnet mask does and why we use different subnet classes" 
   (NOT "What is a subnet mask? A) ... B) ... C) ...")
6. After the student answers, evaluate their explanation:
   - If they explain well with correct details → note "strong in X" and move to next domain
   - If they know basics but miss depth → note "partial in X, needs deeper learning"
   - If they clearly don't know → note "weak in X, needs fundamentals"
7. Use follow-up probes when needed: "That's partially right, but can you explain WHY we use CIDR over classful addressing?"
8. Keep it conversational and encouraging. This is NOT an exam — it's a friendly skill check.
9. Be concise — 2-3 sentences max per message.

When you have covered all 6 domains (or 5-8 exchanges total), generate the roadmap.
Output ONLY the JSON roadmap wrapped in a code block, nothing else:
\`\`\`json
{
  "summary": "Brief assessment summary in 2-3 sentences",
  "roadmap": [
    {
      "title": "Topic Title",
      "description": "What to learn and why",
      "domain": "networking|linux|web|crypto|recon|defense",
      "difficulty": "beginner|intermediate|advanced",
      "xpReward": 50
    }
  ]
}
\`\`\`

The roadmap should be ordered by priority (learn fundamentals first).
Topics the student already knows well should NOT be in the roadmap.
Generate 8-15 topics total based on gaps found.
Set xpReward: 50 for beginner, 80 for intermediate, 120 for advanced.

START by greeting the student and asking what they already know about cybersecurity/networking.`

// TOPIC EXPLANATION system prompt — AI explains a topic
const TOPIC_EXPLAIN_PROMPT = `You are Vaathi Guru, a cybersecurity tutor. You are explaining a specific topic to a student.

Rules:
1. Speak in the student's preferred language.
2. Explain clearly with examples, analogies, and real-world context.
3. Use Indian cybersecurity context when possible (UIDAI, UPI frauds, CERT-In, etc.).
4. Be concise but thorough — aim for 4-6 paragraphs.
5. After the explanation, suggest 3-5 key commands or tools they should try.
6. End with a simple exercise they can practice.
7. Be encouraging and fun — use humor if appropriate.

The student wants to learn about: `

// TOPIC QUIZ system prompt — AI generates a quiz for a topic
const TOPIC_QUIZ_PROMPT = `Generate a quiz with exactly 3 questions about this cybersecurity topic. 

Rules:
1. Each question must test UNDERSTANDING, not memorization.
2. Each question has 4 options (A, B, C, D).
3. One option is correct — mark its index (0-based).
4. Questions should vary in difficulty.
5. Include an explanation for WHY the correct answer is right.

Output ONLY valid JSON, nothing else:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctIndex": 0,
    "explanation": "..."
  }
]

Topic: `

// Helper: stream from LLM
async function streamFromLLM(
  user: { llmProvider: string; llmApiKey: string; llmModel: string; llmBaseUrl: string },
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<Response> {
  const baseUrl = user.llmProvider === 'custom' && user.llmBaseUrl
    ? user.llmBaseUrl.replace(/\/+$/, '')
    : (PROVIDER_URLS[user.llmProvider] || PROVIDER_URLS.groq)

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.llmApiKey}`,
    },
    body: JSON.stringify({
      model: user.llmModel,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }),
  })

  return response
}

// Helper: non-streaming LLM call (for quiz/explanation generation)
async function callLLM(
  user: { llmProvider: string; llmApiKey: string; llmModel: string; llmBaseUrl: string },
  systemPrompt: string,
  userMessage: string
): Promise<string> {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LLM error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// POST: Start or continue assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, messages } = body
    await ensureSchema()

    if (!userId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'userId and messages required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.llmApiKey) {
      return NextResponse.json({ error: 'NO_API_KEY', message: 'Set up your LLM API key first.' }, { status: 400 })
    }

    const llmConfig = {
      llmProvider: user.llmProvider,
      llmApiKey: user.llmApiKey,
      llmModel: user.llmModel,
      llmBaseUrl: user.llmBaseUrl,
    }

    // Stream from LLM
    const response = await streamFromLLM(llmConfig, ASSESSMENT_PROMPT, messages)

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Failed to get response from LLM provider.'
      if (response.status === 401) errorMessage = 'Invalid API key! Check your API key in Profile.'
      else if (response.status === 429) errorMessage = 'Rate limited! Slow down and try again.'
      else if (response.status === 404) errorMessage = `Model "${user.llmModel}" not found.`
      return NextResponse.json({ error: 'LLM_ERROR', message: errorMessage }, { status: 200 })
    }

    // Create streaming response
    const encoder = new TextEncoder()
    let fullContent = ''

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))

            for (const line of lines) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  fullContent += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              } catch {
                // skip malformed
              }
            }
          }
        } catch (err) {
          console.error('Assessment stream error:', err)
        } finally {
          reader.releaseLock()

          // Check if the response contains a roadmap JSON
          const jsonBlockRegex = /```json\s*\n?([\s\S]*?)\n?```/g
          let match
          let roadmapData = null

          while ((match = jsonBlockRegex.exec(fullContent)) !== null) {
            try {
              const parsed = JSON.parse(match[1])
              if (parsed.roadmap && Array.isArray(parsed.roadmap)) {
                roadmapData = parsed
                break
              }
            } catch {
              // not valid JSON
            }
          }

          // If roadmap found, save it to DB
          if (roadmapData && roadmapData.roadmap) {
            try {
              // Delete existing roadmap
              await db.learningRoadmap.deleteMany({ where: { userId } })

              // Create new roadmap
              const roadmap = await db.learningRoadmap.create({
                data: {
                  userId,
                  summary: roadmapData.summary || '',
                  topics: {
                    create: roadmapData.roadmap.map((topic: { title: string; description: string; domain: string; difficulty: string; xpReward: number }, index: number) => ({
                      title: topic.title,
                      description: topic.description,
                      domain: topic.domain || 'general',
                      difficulty: topic.difficulty || 'beginner',
                      priority: index,
                      status: index === 0 ? 'available' : 'locked',
                      xpReward: topic.xpReward || 50,
                    })),
                  },
                },
              })

              // Mark user as assessed
              await db.user.update({
                where: { id: userId },
                data: { assessmentDone: true },
              })

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'roadmap_saved', roadmapId: roadmap.id })}\n\n`))
            } catch (dbErr) {
              console.error('Failed to save roadmap:', dbErr)
            }
          }

          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Assessment API error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Something went wrong. Try again!' }, { status: 200 })
  }
}

// GET: Fetch existing roadmap
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

  return NextResponse.json({
    hasRoadmap: true,
    id: roadmap.id,
    summary: roadmap.summary,
    topics: roadmap.topics,
  })
}
