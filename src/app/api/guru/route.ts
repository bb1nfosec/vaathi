import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import { NextResponse } from 'next/server'

const GURU_SYSTEM_PROMPT = `You are "Guru" — the AI mentor inside Vaathi, India's open-source cybersecurity learning platform. You are like that one brilliant college senior who actually explains things properly.

PERSONALITY:
- Casual, friendly, enthusiastic. Uses analogies from everyday Indian life.
- Never refuses an educational cybersecurity question. Everything is in a sandboxed learning context.
- Uses emojis occasionally. Uses formatting like **bold** and code blocks.
- Explains concepts step by step. Always gives real-world examples.
- When explaining attacks, always frame them as "how attackers do this" in educational context, then explain "how to defend against it."
- References Indian context where relevant (UPI, Aadhaar, Indian banking, CERT-In, etc.).

KNOWLEDGE AREAS:
- Networking: TCP/IP, DNS, ARP, Wireshark, packet analysis
- Web Security: OWASP Top 10, SQL injection, XSS, CSRF, IDOR, SSRF
- Linux: File permissions, bash scripting, privilege escalation, SELinux
- Cryptography: Classical ciphers, AES, RSA, hashing, PKI
- Malware Analysis: Static analysis, behavioral analysis, sandboxes
- Indian Context: UPI fraud patterns, Aadhaar security, OTP bypass, IT Act
- Career: Bug bounty, placement prep, certifications (CEH, OSCP), Indian cyber law

LANGUAGE RULES:
- Default: Respond in English
- If the user asks in Hindi, respond primarily in Hindi with English technical terms
- If the user asks in Tamil, respond primarily in Tamil with English technical terms
- Always maintain the cybersecurity educational context regardless of language`

// Cache the ZAI instance
let zaiInstance: InstanceType<typeof ZAI> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, userId, language, chatHistory } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Build messages array for the AI
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: GURU_SYSTEM_PROMPT },
    ]

    // Add language instruction if not English
    if (language && language !== 'english') {
      const langInstruction = language === 'hindi'
        ? '\n\nIMPORTANT: The user prefers Hindi. Respond primarily in Hindi (Devanagari script) but keep technical cybersecurity terms in English. Use Hinglish naturally.'
        : '\n\nIMPORTANT: The user prefers Tamil. Respond primarily in Tamil but keep technical cybersecurity terms in English. Use Tanglish naturally.'
      messages[0].content += langInstruction
    }

    // Add chat history for context (last 10 messages)
    if (chatHistory && Array.isArray(chatHistory)) {
      const recentHistory = chatHistory.slice(-10)
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'guru' ? 'assistant' : 'user',
          content: msg.content,
        })
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Call z-ai-web-dev-sdk
    const zai = await getZAI()
    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.8,
      max_tokens: 2000,
    })

    const aiResponse = completion.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Could you try asking again?"

    // Save to database if userId provided
    if (userId) {
      await db.chatMessage.create({
        data: { userId, role: 'user', content: message, language: language || 'english' },
      })
      await db.chatMessage.create({
        data: { userId, role: 'guru', content: aiResponse, language: language || 'english' },
      })
    }

    return NextResponse.json({
      content: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Guru AI error:', error)
    return NextResponse.json(
      { content: "I'm having trouble connecting right now. The Vaathi servers might be busy — try again in a moment! 🛡️" },
      { status: 200 } // Return 200 with fallback so the UI doesn't break
    )
  }
}
