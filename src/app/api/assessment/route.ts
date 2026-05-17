import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const questions = [
  { id: 1, question: 'What does "IP" stand for in networking?', options: ['Internet Protocol', 'Intranet Portal', 'Integrated Process', 'Input Packet'], correct: 0, tier: 'egg' },
  { id: 2, question: 'Which command shows your current directory in Linux?', options: ['ls', 'pwd', 'cd', 'cat'], correct: 1, tier: 'egg' },
  { id: 3, question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Tech Transfer Program', 'HyperText Transmission Process', 'Home Tool Transfer Protocol'], correct: 0, tier: 'egg' },
  { id: 4, question: 'What is the default SSH port?', options: ['80', '443', '22', '8080'], correct: 2, tier: 'hatch' },
  { id: 5, question: 'What does SQL stand for?', options: ['Simple Query Language', 'Structured Query Language', 'Standard Query Logic', 'Sequential Query Language'], correct: 1, tier: 'hatch' },
  { id: 6, question: 'What is a "man-in-the-middle" attack?', options: ['Attacking a person physically', 'Intercepting communication between two parties', 'Hacking a middle server', 'Breaking encryption in transit'], correct: 1, tier: 'hatch' },
  { id: 7, question: 'What does "chmod 777" do in Linux?', options: ['Deletes a file', 'Gives full read/write/execute permissions to everyone', 'Changes the owner', 'Encrypts a file'], correct: 1, tier: 'fly' },
  { id: 8, question: 'What vulnerability allows injecting malicious SQL queries?', options: ['XSS', 'CSRF', 'SQL Injection', 'IDOR'], correct: 2, tier: 'fly' },
  { id: 9, question: 'In cryptography, what does AES stand for?', options: ['Advanced Encryption Standard', 'Automated Encryption System', 'Analog Encryption Standard', 'Applied Encryption Scheme'], correct: 0, tier: 'fly' },
  { id: 10, question: 'What is a "buffer overflow"?', options: ['Running out of memory', 'Writing data beyond buffer boundaries', 'A type of DDoS attack', 'A network congestion issue'], correct: 1, tier: 'fly' },
]

function calculateTier(score: number): string {
  if (score >= 9) return 'burn'
  if (score >= 7) return 'soar'
  if (score >= 5) return 'fly'
  if (score >= 3) return 'hatch'
  return 'egg'
}

const TIER_XP: Record<string, number> = { egg: 0, hatch: 500, fly: 2000, soar: 5000, burn: 12000 }
const TIER_SKILLS: Record<string, { networking: number; webHacking: number; linux: number; crypto: number; malware: number }> = {
  egg: { networking: 10, webHacking: 5, linux: 15, crypto: 5, malware: 0 },
  hatch: { networking: 25, webHacking: 15, linux: 30, crypto: 10, malware: 5 },
  fly: { networking: 50, webHacking: 40, linux: 55, crypto: 35, malware: 20 },
  soar: { networking: 75, webHacking: 65, linux: 70, crypto: 60, malware: 50 },
  burn: { networking: 95, webHacking: 90, linux: 85, crypto: 85, malware: 80 },
}

export async function GET() {
  return NextResponse.json({ questions })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { answers, userId, name } = body

    if (!answers || !name) {
      return NextResponse.json({ error: 'Answers and name required' }, { status: 400 })
    }

    // Score the assessment
    let score = 0
    const results = questions.map((q, i) => {
      const userAnswer = answers[i]
      const isCorrect = userAnswer === q.correct
      if (isCorrect) score++
      return {
        question: q.question,
        userAnswer: q.options[userAnswer] || 'Not answered',
        correctAnswer: q.options[q.correct],
        isCorrect,
      }
    })

    const tier = calculateTier(score)
    const xp = TIER_XP[tier]
    const skills = TIER_SKILLS[tier]
    const level = Math.floor(xp / 1000) + 1

    // Create or update user in database
    let user
    if (userId) {
      user = await db.user.update({
        where: { id: userId },
        data: {
          name,
          tier,
          xp,
          level,
          skills: JSON.stringify(skills),
          badges: JSON.stringify(['first-login', 'assessment-complete']),
        },
      })
    } else {
      user = await db.user.create({
        data: {
          name,
          tier,
          xp,
          level,
          streak: 1,
          skills: JSON.stringify(skills),
          badges: JSON.stringify(['first-login', 'assessment-complete']),
        },
      })
    }

    return NextResponse.json({
      user: {
        ...user,
        skills: JSON.parse(user.skills),
        badges: JSON.parse(user.badges),
      },
      score,
      total: questions.length,
      tier,
      xp,
      level,
      results,
    })
  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 })
  }
}
