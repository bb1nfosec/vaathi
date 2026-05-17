import { create } from 'zustand'

export type ViewType = 'landing' | 'onboarding' | 'dashboard' | 'assessment' | 'roadmap' | 'topic-learn' | 'guru' | 'lab' | 'arena' | 'profile'
export type TierType = 'egg' | 'hatchling' | 'script_kiddie' | 'hacker' | 'burn'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface LabData {
  type: 'lab'
  title: string
  difficulty: string
  description: string
  scenario: string
  steps: Array<{ title: string; command: string; explanation: string }>
  hints: string[]
  flag: string
  xpReward: number
}

export interface CTFData {
  type: 'ctf'
  title: string
  category: string
  difficulty: string
  points: number
  description: string
  challenge: string
  hints: string[]
  flag: string
  xpReward: number
}

export interface UserData {
  id: string
  name: string
  language: string
  llmProvider: string
  llmModel: string
  hasApiKey: boolean
  tier: TierType
  xp: number
  level: number
  streak: number
  topicProgress: string
  badges: Array<{ id: string; badgeId: string; name: string; emoji: string; earnedAt: string }>
  completedLabs: Array<{ id: string; labTitle: string; difficulty: string; xpEarned: number; hintsUsed: number; completedAt: string }>
  completedCTFs: Array<{ id: string; challengeTitle: string; category: string; difficulty: string; pointsEarned: number; completedAt: string }>
}

export interface MicroTaskData {
  type: string
  title: string
  description: string
  content: string
  hint: string
  expectedAnswer: string
  explanation: string
  xpReward: number
}

export interface TaskEvaluation {
  correct: boolean
  score: string
  feedback: string
  explanation: string
}

export interface RoadmapTopicData {
  id: string
  title: string
  description: string
  domain: string
  difficulty: string
  priority: number
  status: string
  explanation: string
  exercise: string
  quizJson: string
  xpReward: number
}

interface VaathiState {
  currentView: ViewType
  userId: string | null
  isLoading: boolean
  user: UserData | null
  chatMessages: Message[]
  currentLab: LabData | null
  currentCTF: CTFData | null
  isStreaming: boolean
  streamContent: string

  // Assessment
  assessmentMessages: Message[]
  assessmentStreaming: boolean
  assessmentStreamContent: string
  roadmapGenerated: boolean

  // Roadmap
  roadmapTopics: RoadmapTopicData[]
  roadmapSummary: string
  currentTopicId: string | null

  // Topic learning
  topicExplanation: string
  topicQuiz: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }> | null
  topicLoading: boolean

  // Micro-tasks
  currentMicroTask: MicroTaskData | null
  microTaskLoading: boolean
  microTaskAnswer: string
  microTaskEvaluation: TaskEvaluation | null
  microTaskEvaluating: boolean
  microTasksCompleted: number

  // Navigation
  setView: (view: ViewType) => void

  // Session management
  initSession: () => Promise<void>

  // Profile
  saveProfile: (data: { name: string; language: string; llmProvider: string; llmApiKey: string; llmModel: string; llmBaseUrl: string }) => Promise<string | null>

  // Assessment
  sendAssessmentMessage: (content: string) => Promise<void>

  // Roadmap
  loadRoadmap: () => Promise<void>
  startTopic: (topicId: string) => Promise<void>
  loadTopicExplanation: (topicId: string) => Promise<void>
  loadTopicQuiz: (topicId: string) => Promise<void>
  completeTopic: (topicId: string) => Promise<void>

  // Micro-tasks
  loadMicroTask: (topicId: string) => Promise<void>
  evaluateMicroTask: (topicId: string) => Promise<void>
  setMicroTaskAnswer: (answer: string) => void
  clearMicroTask: () => void

  // Chat (Guru)
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
  loadChatHistory: () => Promise<void>

  // Lab/CTF
  setCurrentLab: (lab: LabData | null) => void
  setCurrentCTF: (ctf: CTFData | null) => void
  completeLab: (hintsUsed: number) => Promise<void>
  submitCTFFlag: (flag: string) => Promise<{ correct: boolean; message: string; points?: number; tierChanged?: boolean; newBadges?: Array<{ badgeId: string; name: string; emoji: string }> }>

  // Refresh user data from DB
  refreshUser: () => Promise<void>
}

export const useVaathiStore = create<VaathiState>((set, get) => ({
  currentView: 'landing',
  userId: null,
  isLoading: true,
  user: null,
  chatMessages: [],
  currentLab: null,
  currentCTF: null,
  isStreaming: false,
  streamContent: '',

  // Assessment
  assessmentMessages: [],
  assessmentStreaming: false,
  assessmentStreamContent: '',
  roadmapGenerated: false,

  // Roadmap
  roadmapTopics: [],
  roadmapSummary: '',
  currentTopicId: null,

  // Topic learning
  topicExplanation: '',
  topicQuiz: null,
  topicLoading: false,

  // Micro-tasks
  currentMicroTask: null,
  microTaskLoading: false,
  microTaskAnswer: '',
  microTaskEvaluation: null,
  microTaskEvaluating: false,
  microTasksCompleted: 0,

  setView: (view) => set({ currentView: view }),

  initSession: async () => {
    try {
      const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('vaathi_userId') : null

      if (savedUserId) {
        const res = await fetch(`/api/profile?id=${savedUserId}`)
        if (res.ok) {
          const data = await res.json()
          set({
            userId: data.id,
            user: {
              id: data.id,
              name: data.name,
              language: data.language,
              llmProvider: data.llmProvider,
              llmModel: data.llmModel,
              hasApiKey: data.hasApiKey,
              tier: data.tier as TierType,
              xp: data.xp,
              level: data.level,
              streak: data.streak,
              topicProgress: data.topicProgress || '{}',
              badges: data.badges || [],
              completedLabs: data.completedLabs || [],
              completedCTFs: data.completedCTFs || [],
            },
            isLoading: false,
          })

          // Check if user has a roadmap
          const roadmapRes = await fetch(`/api/roadmap?userId=${data.id}`)
          if (roadmapRes.ok) {
            const roadmapData = await roadmapRes.json()
            if (roadmapData.hasRoadmap) {
              set({
                roadmapTopics: roadmapData.topics || [],
                roadmapSummary: roadmapData.summary || '',
                roadmapGenerated: true,
                currentView: 'dashboard',
              })
            } else {
              // No roadmap yet — go to dashboard (which will prompt assessment)
              set({ currentView: 'dashboard' })
            }
          }
          return
        }
      }

      set({ isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  // Assessment: send a message during skill assessment
  sendAssessmentMessage: async (content) => {
    const { userId, assessmentMessages } = get()

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    set((s) => ({
      assessmentMessages: [...s.assessmentMessages, userMsg],
      assessmentStreaming: true,
      assessmentStreamContent: '',
    }))

    try {
      const allMessages = [...assessmentMessages, userMsg]
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          userId,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed')
      }

      const contentType = res.headers.get('content-type') || ''
      let fullContent = ''

      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))

            for (const line of lines) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.error) {
                  fullContent = `\u26a0\ufe0f ${parsed.message || 'Error'}`
                  break
                }
                if (parsed.type === 'roadmap_saved') {
                  // Roadmap was saved — load it
                  await get().loadRoadmap()
                  set({ roadmapGenerated: true })
                }
                if (parsed.content) {
                  fullContent += parsed.content
                  set({ assessmentStreamContent: fullContent })
                }
              } catch {
                // skip
              }
            }
          }
          reader.releaseLock()
        }
      }

      const guruMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent || 'No response.',
        timestamp: new Date(),
      }
      set((s) => ({
        assessmentMessages: [...s.assessmentMessages, guruMsg],
        assessmentStreaming: false,
        assessmentStreamContent: '',
      }))
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed'
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `\u26a0\ufe0f ${err}`,
        timestamp: new Date(),
      }
      set((s) => ({
        assessmentMessages: [...s.assessmentMessages, errorMsg],
        assessmentStreaming: false,
        assessmentStreamContent: '',
      }))
    }
  },

  // Roadmap: load roadmap from DB
  loadRoadmap: async () => {
    const { userId } = get()
    if (!userId) return
    try {
      const res = await fetch(`/api/roadmap?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.hasRoadmap) {
          set({
            roadmapTopics: data.topics || [],
            roadmapSummary: data.summary || '',
            roadmapGenerated: true,
          })
        }
      }
    } catch {
      // ignore
    }
  },

  // Topic: start learning a topic
  startTopic: async (topicId) => {
    const { userId } = get()
    if (!userId) return
    set({ currentTopicId: topicId, topicExplanation: '', topicQuiz: null, currentView: 'topic-learn' })
    try {
      await fetch('/api/topic-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId, action: 'start' }),
      })
    } catch {
      // ignore
    }
  },

  // Topic: load explanation
  loadTopicExplanation: async (topicId) => {
    const { userId } = get()
    if (!userId) return
    set({ topicLoading: true })
    try {
      const res = await fetch('/api/topic-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId, action: 'explain' }),
      })
      const data = await res.json()
      if (data.explanation) {
        set({ topicExplanation: data.explanation })
      } else if (data.error === 'NO_API_KEY') {
        set({ topicExplanation: '\u26a0\ufe0f Set up your LLM API key in Profile to get AI explanations.' })
      }
    } catch {
      set({ topicExplanation: 'Failed to load explanation. Try again.' })
    } finally {
      set({ topicLoading: false })
    }
  },

  // Topic: load quiz
  loadTopicQuiz: async (topicId) => {
    const { userId } = get()
    if (!userId) return
    set({ topicLoading: true })
    try {
      const res = await fetch('/api/topic-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId, action: 'quiz' }),
      })
      const data = await res.json()
      if (data.quiz) {
        set({ topicQuiz: data.quiz })
      } else if (data.error === 'NO_API_KEY') {
        set({ topicQuiz: [{ question: 'Set up your LLM API key in Profile to get AI quizzes.', options: ['Go to Profile', 'Later'], correctIndex: 0, explanation: 'Profile > LLM Settings' }] })
      }
    } catch {
      set({ topicQuiz: [{ question: 'Failed to load quiz.', options: ['Retry'], correctIndex: 0, explanation: 'Try again.' }] })
    } finally {
      set({ topicLoading: false })
    }
  },

  // Topic: complete
  completeTopic: async (topicId) => {
    const { userId } = get()
    if (!userId) return
    try {
      await fetch('/api/topic-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId, action: 'complete' }),
      })
      await get().loadRoadmap()
      await get().refreshUser()
    } catch {
      // ignore
    }
  },

  // Micro-task: generate a new micro-task
  loadMicroTask: async (topicId) => {
    const { userId } = get()
    if (!userId) return
    set({ microTaskLoading: true, currentMicroTask: null, microTaskEvaluation: null, microTaskAnswer: '' })
    try {
      const res = await fetch('/api/topic-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topicId, action: 'microtask' }),
      })
      const data = await res.json()
      if (data.microtask) {
        set({ currentMicroTask: data.microtask })
      }
    } catch {
      set({ currentMicroTask: null })
    } finally {
      set({ microTaskLoading: false })
    }
  },

  // Micro-task: evaluate student answer
  evaluateMicroTask: async (topicId) => {
    const { userId, currentMicroTask, microTaskAnswer } = get()
    if (!userId || !currentMicroTask || !microTaskAnswer.trim()) return
    set({ microTaskEvaluating: true, microTaskEvaluation: null })
    try {
      const res = await fetch('/api/topic-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, topicId, action: 'evaluate-task',
          taskType: currentMicroTask.type,
          taskTitle: currentMicroTask.title,
          taskContent: currentMicroTask.content,
          expectedAnswer: currentMicroTask.expectedAnswer,
          studentAnswer: microTaskAnswer,
        }),
      })
      const data = await res.json()
      if (data.evaluation) {
        set({ microTaskEvaluation: data.evaluation })
        if (data.evaluation.correct) {
          set((s) => ({ microTasksCompleted: s.microTasksCompleted + 1 }))
        }
      }
    } catch {
      set({ microTaskEvaluation: { correct: false, score: 'wrong', feedback: 'Failed to evaluate. Try again.', explanation: '' } })
    } finally {
      set({ microTaskEvaluating: false })
    }
  },

  setMicroTaskAnswer: (answer) => set({ microTaskAnswer: answer }),
  clearMicroTask: () => set({ currentMicroTask: null, microTaskAnswer: '', microTaskEvaluation: null }),

  saveProfile: async (data) => {
    const { userId } = get()
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId || undefined,
          name: data.name,
          language: data.language,
          llmProvider: data.llmProvider,
          llmApiKey: data.llmApiKey,
          llmModel: data.llmModel,
          llmBaseUrl: data.llmBaseUrl,
        }),
      })
      const result = await res.json()

      if (result.id) {
        localStorage.setItem('vaathi_userId', result.id)
        set({
          userId: result.id,
          user: {
            id: result.id,
            name: result.name,
            language: result.language,
            llmProvider: result.llmProvider,
            llmModel: result.llmModel,
            hasApiKey: result.hasApiKey,
            tier: result.tier as TierType,
            xp: result.xp,
            level: result.level,
            streak: result.streak,
            topicProgress: '{}',
            badges: [],
            completedLabs: [],
            completedCTFs: [],
          },
        })
      }
      return result.id
    } catch (error) {
      console.error('Save profile error:', error)
      return null
    }
  },

  sendMessage: async (content) => {
    const { userId, chatMessages } = get()

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    set((s) => ({ chatMessages: [...s.chatMessages, userMsg], isStreaming: true, streamContent: '' }))

    try {
      const allMessages = [...chatMessages, userMsg]
      const res = await fetch('/api/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          userId,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to send message')
      }

      const contentType = res.headers.get('content-type') || ''

      // Check if streaming
      if (contentType.includes('text/event-stream')) {
        let fullContent = ''
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))

            for (const line of lines) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.error) {
                  fullContent = `⚠️ ${parsed.message || 'Error from LLM provider'}`
                  break
                }
                if (parsed.content) {
                  fullContent += parsed.content
                  set({ streamContent: fullContent })
                }
              } catch {
                // skip
              }
            }
          }
          reader.releaseLock()
        }

        const guruMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent || 'No response received.',
          timestamp: new Date(),
        }
        set((s) => ({
          chatMessages: [...s.chatMessages, guruMsg],
          isStreaming: false,
          streamContent: '',
        }))

        // Check for lab/CTF JSON in the response
        parseStructuredContent(fullContent, set, get)
      } else {
        // Non-streaming fallback
        const data = await res.json()
        if (data.error) {
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚠️ ${data.message || 'Something went wrong'}`,
            timestamp: new Date(),
          }
          set((s) => ({ chatMessages: [...s.chatMessages, errorMsg], isStreaming: false, streamContent: '' }))
          return
        }

        const content = data.content || data.message || 'No response received.'
        const guruMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date(),
        }
        set((s) => ({ chatMessages: [...s.chatMessages, guruMsg], isStreaming: false, streamContent: '' }))

        parseStructuredContent(content, set, get)
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to send message'
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${err}`,
        timestamp: new Date(),
      }
      set((s) => ({ chatMessages: [...s.chatMessages, errorMsg], isStreaming: false, streamContent: '' }))
    }
  },

  clearChat: () => set({ chatMessages: [] }),

  loadChatHistory: async () => {
    const { userId } = get()
    if (!userId) return
    try {
      const res = await fetch(`/api/profile?id=${userId}`)
      if (res.ok) {
        const data = await res.json()
        const msgs = (data.recentMessages || []).map((m: { role: string; content: string; createdAt: string; id: string }) => ({
          id: m.id,
          role: (m.role === 'guru' ? 'assistant' : m.role) as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt),
        }))
        set({ chatMessages: msgs })
      }
    } catch {
      // ignore
    }
  },

  setCurrentLab: (lab) => set({ currentLab: lab, currentView: lab ? 'lab' : 'dashboard' }),
  setCurrentCTF: (ctf) => set({ currentCTF: ctf, currentView: ctf ? 'arena' : 'dashboard' }),

  completeLab: async (hintsUsed) => {
    const { userId, currentLab } = get()
    if (!userId || !currentLab) return
    try {
      await fetch('/api/labs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          labTitle: currentLab.title,
          difficulty: currentLab.difficulty,
          xpEarned: currentLab.xpReward,
          hintsUsed,
          topic: currentLab.title.toLowerCase().replace(/\s+/g, '_'),
        }),
      })
      await get().refreshUser()
    } catch (error) {
      console.error('Complete lab error:', error)
    }
  },

  submitCTFFlag: async (flag) => {
    const { userId, currentCTF } = get()
    if (!userId || !currentCTF) return { correct: false, message: 'No active challenge' }

    try {
      const res = await fetch('/api/ctf/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          challengeTitle: currentCTF.title,
          submittedFlag: flag,
          expectedFlag: currentCTF.flag,
          category: currentCTF.category,
          difficulty: currentCTF.difficulty,
          points: currentCTF.points,
        }),
      })
      const data = await res.json()

      if (data.correct) {
        await get().refreshUser()
      }

      return {
        correct: data.correct,
        message: data.message,
        points: data.points,
        tierChanged: data.tierChanged,
        newBadges: data.newBadges,
      }
    } catch {
      return { correct: false, message: 'Failed to submit. Try again.' }
    }
  },

  refreshUser: async () => {
    const { userId } = get()
    if (!userId) return
    try {
      const res = await fetch(`/api/profile?id=${userId}`)
      if (res.ok) {
        const data = await res.json()
        set((s) => ({
          user: s.user ? {
            ...s.user,
            xp: data.xp,
            level: data.level,
            tier: data.tier as TierType,
            streak: data.streak,
            badges: data.badges || [],
            completedLabs: data.completedLabs || [],
            completedCTFs: data.completedCTFs || [],
            topicProgress: data.topicProgress || '{}',
          } : s.user,
        }))
      }
    } catch {
      // ignore
    }
  },
}))

// Parse lab/CTF JSON from AI response
function parseStructuredContent(content: string, set: (partial: Partial<VaathiState>) => void, get: () => VaathiState) {
  // Try to find JSON blocks
  const jsonBlockRegex = /```json\s*\n?([\s\S]*?)\n?```/g
  let match

  while ((match = jsonBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed.type === 'lab' && parsed.title && parsed.flag) {
        set({ currentLab: parsed as LabData, currentView: 'lab' })
        return
      }
      if (parsed.type === 'ctf' && parsed.title && parsed.flag) {
        set({ currentCTF: parsed as CTFData, currentView: 'arena' })
        return
      }
    } catch {
      // Not valid JSON, continue
    }
  }
}

// Helper hooks
export const useXPProgress = () => {
  const xp = useVaathiStore((s) => s.user?.xp ?? 0)
  const level = useVaathiStore((s) => s.user?.level ?? 1)
  const xpForNext = 100
  const xpInLevel = xp - (level - 1) * xpForNext
  return { xp, level, xpInLevel, xpForNext, progress: (xpInLevel / xpForNext) * 100 }
}

export const TIER_CONFIG: Record<TierType, { emoji: string; label: string; color: string; desc: string; minXp: number }> = {
  egg: { emoji: '🥚', label: 'Egg', color: '#94a3b8', desc: 'Just starting out', minXp: 0 },
  hatchling: { emoji: '🐣', label: 'Hatchling', color: '#22c55e', desc: 'Learning the basics', minXp: 100 },
  script_kiddie: { emoji: '💻', label: 'Script Kiddie', color: '#06b6d4', desc: 'Running scripts like a pro', minXp: 500 },
  hacker: { emoji: '🖥️', label: 'Hacker', color: '#a855f7', desc: 'Understanding systems deeply', minXp: 2000 },
  burn: { emoji: '🔥', label: 'Burn', color: '#f59e0b', desc: 'Elite — can mentor others', minXp: 5000 },
}

export const LANGUAGES = [
  { code: 'english', label: 'English', flag: '🇬🇧' },
  { code: 'tamil', label: 'Tamil', flag: '🇮🇳' },
  { code: 'hindi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'telugu', label: 'Telugu', flag: '🇮🇳' },
  { code: 'malayalam', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'kannada', label: 'Kannada', flag: '🇮🇳' },
] as const

export const LLM_PROVIDERS = [
  { id: 'groq', label: 'Groq (Free)', url: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  { id: 'openrouter', label: 'OpenRouter', url: 'https://openrouter.ai/api/v1', models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-2-9b-it:free', 'mistralai/mistral-7b-instruct:free', 'deepseek/deepseek-chat-v3-0324:free', 'qwen/qwen-2.5-72b-instruct:free', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.1-405b-instruct'] },
  { id: 'openai', label: 'OpenAI', url: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
  { id: 'together', label: 'Together AI', url: 'https://api.together.xyz/v1', models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'] },
  { id: 'ollama', label: 'Ollama (Local)', url: 'http://localhost:11434/v1', models: ['llama3', 'mistral', 'codellama', 'gemma2'] },
  { id: 'custom', label: 'Custom (OpenAI-compatible)', url: '', models: [] },
] as const
