import { db, ensureSchema } from '@/lib/db'
import { NextRequest } from 'next/server'

const PROVIDER_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  openai: 'https://api.openai.com/v1',
  together: 'https://api.together.xyz/v1',
  ollama: 'http://localhost:11434/v1',
}

const TIER_CONFIG: Record<string, { emoji: string; label: string }> = {
  egg: { emoji: '🥚', label: 'Egg' },
  hatchling: { emoji: '🐣', label: 'Hatchling' },
  script_kiddie: { emoji: '💻', label: 'Script Kiddie' },
  hacker: { emoji: '🖥️', label: 'Hacker' },
  burn: { emoji: '🔥', label: 'Burn' },
}

function buildSystemPrompt(user: {
  name: string
  language: string
  tier: string
  xp: number
  level: number
  topicProgress: string
}) {
  const tierInfo = TIER_CONFIG[user.tier] || TIER_CONFIG.egg
  let topicStr = '{}'
  try { topicStr = user.topicProgress || '{}' } catch { topicStr = '{}' }

  return `You are Vaathi Guru — India's most fun cybersecurity mentor! 🧑‍💻🔐

You teach cybersecurity in **${user.language}**. Your personality is:
- Fun and humorous (use memes, pop culture, movie references)
- Encouraging and patient
- Adaptive — you adjust difficulty based on the student's responses
- Story-driven — you explain concepts through stories and analogies

**Student Info:**
- Name: ${user.name}
- Current Tier: ${tierInfo.label} (${tierInfo.emoji})
- XP: ${user.xp} / Level: ${user.level}

**Your Rules:**
1. ALWAYS respond in ${user.language} unless the student uses English
2. This is a FREE-FORM chat. The student already has a personalized learning roadmap.
3. Answer their questions, explain concepts, and help them understand — don't test them here.
4. If they ask about a topic on their roadmap, explain it clearly and suggest they visit the topic for a full lesson + quiz.
5. Use Indian cybersecurity context when possible (UIDAI, UPI frauds, CERT-In, IT Act, etc.)
6. Only generate labs/CTFs when the student SPECIFICALLY asks. Use these exact JSON formats:
   Labs: {"type":"lab","title":"...","difficulty":"...","description":"...","scenario":"...","steps":[{"title":"...","command":"...","explanation":"..."}],"hints":["..."],"flag":"FLAG{...}","xpReward":N}
   CTFs: {"type":"ctf","title":"...","category":"...","difficulty":"...","points":N,"description":"...","challenge":"...","hints":["..."],"flag":"FLAG{...}","xpReward":N}
7. Celebrate when students level up or do well!
8. If asked something outside cybersecurity, gently redirect back.
9. Keep responses concise but informative.
10. When explaining attacks, always frame them educationally — explain the attack AND the defense.

Start by greeting ${user.name} and asking what they'd like to learn!`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, userId } = body
    await ensureSchema()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), { status: 400 })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 })
    }

    // Fetch user from DB
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    if (!user.llmApiKey) {
      return new Response(JSON.stringify({ error: 'NO_API_KEY', message: 'Please set up your LLM API key in Profile settings.' }), { status: 400 })
    }

    // Determine base URL
    const baseUrl = user.llmProvider === 'custom' && user.llmBaseUrl
      ? user.llmBaseUrl.replace(/\/+$/, '')
      : (PROVIDER_URLS[user.llmProvider] || PROVIDER_URLS.groq)

    // Build messages array
    const systemPrompt = buildSystemPrompt({
      name: user.name,
      language: user.language,
      tier: user.tier,
      xp: user.xp,
      level: user.level,
      topicProgress: user.topicProgress,
    })

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'guru' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ]

    // Save user message to DB
    const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop()
    if (lastUserMsg) {
      await db.chatMessage.create({
        data: {
          userId,
          role: 'user',
          content: lastUserMsg.content,
          language: user.language,
        },
      })
    }

    // Update last active
    await db.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    })

    // Stream from the LLM provider
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.llmApiKey}`,
      },
      body: JSON.stringify({
        model: user.llmModel,
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 2000,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Failed to get response from LLM provider.'

      if (response.status === 401) {
        errorMessage = 'Invalid API key! Please check your API key in Profile settings.'
      } else if (response.status === 429) {
        errorMessage = 'Rate limited! Slow down — try again in a moment. 🐢'
      } else if (response.status === 404) {
        errorMessage = `Model "${user.llmModel}" not found. Check your model name in Profile settings.`
      } else {
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorMessage
        } catch {
          // use default error message
        }
      }

      return new Response(
        JSON.stringify({ error: 'LLM_ERROR', message: errorMessage }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a streaming response
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
                // Skip malformed JSON
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err)
        } finally {
          reader.releaseLock()

          // Save AI response to DB
          if (fullContent) {
            try {
              await db.chatMessage.create({
                data: {
                  userId,
                  role: 'guru',
                  content: fullContent,
                  language: user.language,
                },
              })
            } catch (e) {
              console.error('Failed to save guru message:', e)
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
    console.error('Guru API error:', error)
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: "Something went wrong on our end. Try again! 🛡️" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
