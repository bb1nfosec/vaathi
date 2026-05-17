import { create } from 'zustand'

export type ViewType = 'landing' | 'assessment' | 'dashboard' | 'guru-chat' | 'labs' | 'lab-detail' | 'arena' | 'profile'
export type TierType = 'egg' | 'hatch' | 'fly' | 'soar' | 'burn'

export interface Message {
  id: string
  role: 'user' | 'guru'
  content: string
  timestamp: Date
}

export interface LabProgress {
  labId: string
  currentStep: number
  hintsUsed: number
  completed: boolean
}

interface VaathiState {
  currentView: ViewType
  previousView: ViewType | null
  userId: string | null
  isLoading: boolean
  user: {
    name: string
    tier: TierType
    xp: number
    level: number
    streak: number
    college: string
    state: string
    completedLabs: string[]
    completedCTFs: string[]
    badges: string[]
    certificates: string[]
    skills: {
      networking: number
      webHacking: number
      linux: number
      crypto: number
      malware: number
    }
  }
  assessment: {
    currentQuestion: number
    answers: Record<number, number>
    completed: boolean
    tier: TierType | null
  }
  chat: {
    messages: Message[]
    language: 'english' | 'hindi' | 'tamil'
  }
  selectedLab: string | null
  labProgress: Record<string, LabProgress>

  // Navigation
  setView: (view: ViewType) => void
  goBack: () => void

  // Session management
  initSession: () => Promise<void>
  saveSession: () => Promise<void>

  // Assessment (calls API)
  completeAssessment: (answers: Record<number, number>, name: string) => Promise<void>

  // Lab completion (calls API)
  completeLab: (labId: string, xp: number) => Promise<void>

  // CTF submission (calls API)
  submitCTFFlag: (challengeId: string, flag: string) => Promise<{ correct: boolean; points?: number; message: string; newBadges?: string[] }>

  // Chat (calls API)
  sendMessage: (content: string) => Promise<void>

  // Lab progress (local state, saved on complete)
  selectLab: (labId: string | null) => void
  updateLabStep: (labId: string, step: number) => void
  spendHint: (labId: string) => void

  // Language
  setChatLanguage: (lang: 'english' | 'hindi' | 'tamil') => void

  // Local state setters
  setUser: (user: Partial<VaathiState['user']> & { id?: string }) => void
  addGuruMessageLocal: (content: string) => void
}

function calcLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1
}

export const useVaathiStore = create<VaathiState>((set, get) => ({
  currentView: 'landing',
  previousView: null,
  userId: null,
  isLoading: true,
  user: {
    name: 'Hacker',
    tier: 'egg',
    xp: 0,
    level: 1,
    streak: 0,
    college: '',
    state: '',
    completedLabs: [],
    completedCTFs: [],
    badges: [],
    certificates: [],
    skills: { networking: 0, webHacking: 0, linux: 0, crypto: 0, malware: 0 },
  },
  assessment: {
    currentQuestion: 0,
    answers: {},
    completed: false,
    tier: null,
  },
  chat: {
    messages: [],
    language: 'english',
  },
  selectedLab: null,
  labProgress: {},

  setView: (view) =>
    set((s) => ({ previousView: s.currentView, currentView: view })),

  goBack: () =>
    set((s) => ({
      currentView: s.previousView || 'dashboard',
      previousView: null,
    })),

  // Initialize session from localStorage/DB
  initSession: async () => {
    try {
      const savedUserId = localStorage.getItem('vaathi_userId')

      if (savedUserId) {
        // Restore from database
        const res = await fetch(`/api/user?id=${savedUserId}`)
        if (res.ok) {
          const data = await res.json()
          set({
            userId: data.id,
            isLoading: false,
            user: {
              name: data.name || 'Hacker',
              tier: (data.tier || 'egg') as TierType,
              xp: data.xp || 0,
              level: data.level || 1,
              streak: data.streak || 0,
              college: data.college || '',
              state: data.state || '',
              completedLabs: data.completedLabs || [],
              completedCTFs: data.completedCTFs || [],
              badges: data.badges || [],
              certificates: [],
              skills: data.skills || { networking: 0, webHacking: 0, linux: 0, crypto: 0, malware: 0 },
            },
            assessment: { currentQuestion: 0, answers: {}, completed: true, tier: data.tier as TierType },
            chat: {
              messages: (data.recentMessages || []).map((m: { id: string; role: string; content: string; createdAt: string }) => ({
                id: m.id,
                role: m.role as 'user' | 'guru',
                content: m.content,
                timestamp: new Date(m.createdAt),
              })),
              language: (data.recentMessages?.[0]?.language as 'english' | 'hindi' | 'tamil') || 'english',
            },
            currentView: 'dashboard',
          })
          return
        }
      }

      set({ isLoading: false })
    } catch {
      // If anything fails, just show the landing page
      set({ isLoading: false })
    }
  },

  // Save current state to DB
  saveSession: async () => {
    const { userId, user } = get()
    if (!userId) return

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          name: user.name,
          tier: user.tier,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          skills: user.skills,
          badges: user.badges,
        }),
      })
    } catch {
      // Silently fail — localStorage acts as backup
    }
  },

  // Assessment — calls real API
  completeAssessment: async (answers, name) => {
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, name, userId: get().userId }),
      })
      const data = await res.json()

      if (data.user) {
        const userId = data.user.id
        localStorage.setItem('vaathi_userId', userId)
        set({
          userId,
          user: {
            name: data.user.name,
            tier: data.user.tier as TierType,
            xp: data.user.xp,
            level: data.user.level,
            streak: data.user.streak || 1,
            college: data.user.college || '',
            state: data.user.state || '',
            completedLabs: [],
            completedCTFs: [],
            badges: data.user.badges || [],
            certificates: [],
            skills: data.user.skills || { networking: 0, webHacking: 0, linux: 0, crypto: 0, malware: 0 },
          },
          assessment: {
            currentQuestion: 0,
            answers: {},
            completed: true,
            tier: data.tier as TierType,
          },
          currentView: 'dashboard',
        })
      }
    } catch (error) {
      console.error('Assessment API error, falling back to local:', error)
      // Fallback to local calculation
      let score = 0
      const q = [
        [0],[1],[0],[2],[1],[1],[1],[2],[0],[1]
      ]
      for (const [correct] of q) {
        if (answers[q.indexOf([correct])] === correct) score++
      }
      // Simple local fallback
      let tier: TierType = 'egg'
      if (score >= 9) tier = 'burn'
      else if (score >= 7) tier = 'soar'
      else if (score >= 5) tier = 'fly'
      else if (score >= 3) tier = 'hatch'

      set({
        user: {
          ...get().user,
          name,
          tier,
          badges: ['first-login', 'assessment-complete'],
        },
        assessment: { currentQuestion: 0, answers: {}, completed: true, tier },
        currentView: 'dashboard',
      })
    }
  },

  // Lab completion — calls real API
  completeLab: async (labId, xp) => {
    const { userId } = get()
    if (!userId) return

    try {
      const progress = get().labProgress[labId]
      const res = await fetch('/api/labs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          labId,
          xpEarned: xp,
          hintsUsed: progress?.hintsUsed || 0,
          stepsCompleted: progress?.currentStep || 0,
        }),
      })
      const data = await res.json()

      if (data.success && !data.alreadyCompleted) {
        set((s) => ({
          user: {
            ...s.user,
            completedLabs: s.user.completedLabs.includes(labId)
              ? s.user.completedLabs
              : [...s.user.completedLabs, labId],
            xp: data.newXp ?? s.user.xp + xp,
            level: data.newLevel ?? calcLevel(s.user.xp + xp),
            badges: data.badges ?? s.user.badges,
          },
          labProgress: {
            ...s.labProgress,
            [labId]: { ...(s.labProgress[labId] || { labId, currentStep: 0, hintsUsed: 0, completed: false }), completed: true },
          },
        }))
      }
    } catch (error) {
      console.error('Lab complete API error, falling back to local:', error)
      set((s) => ({
        user: {
          ...s.user,
          completedLabs: s.user.completedLabs.includes(labId)
            ? s.user.completedLabs
            : [...s.user.completedLabs, labId],
          xp: s.user.xp + xp,
          level: calcLevel(s.user.xp + xp),
        },
      }))
    }
  },

  // CTF flag submission — calls real API
  submitCTFFlag: async (challengeId, flag) => {
    const { userId } = get()
    if (!userId) return { correct: false, message: 'Not logged in' }

    try {
      const res = await fetch('/api/ctf/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, challengeId, submittedFlag: flag }),
      })
      const data = await res.json()

      if (data.correct && !data.alreadySolved) {
        set((s) => ({
          user: {
            ...s.user,
            completedCTFs: s.user.completedCTFs.includes(challengeId)
              ? s.user.completedCTFs
              : [...s.user.completedCTFs, challengeId],
            xp: data.newXp ?? s.user.xp + (data.points || 0),
            level: data.newLevel ?? calcLevel(s.user.xp + (data.points || 0)),
            badges: data.badges ?? s.user.badges,
          },
        }))
      }

      return { correct: data.correct, points: data.points, message: data.message, newBadges: data.badges }
    } catch (error) {
      console.error('CTF submit API error:', error)
      return { correct: false, message: 'Failed to submit. Try again.' }
    }
  },

  // Chat — calls real AI API
  sendMessage: async (content) => {
    const { userId, chat, user } = get()

    // Add user message locally
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    set((s) => ({
      chat: { ...s.chat, messages: [...s.chat.messages, userMsg] },
    }))

    try {
      const res = await fetch('/api/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          userId,
          language: chat.language,
          chatHistory: chat.messages.slice(-10),
        }),
      })
      const data = await res.json()

      const guruMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'guru',
        content: data.content,
        timestamp: new Date(data.timestamp || new Date().toISOString()),
      }
      set((s) => ({
        chat: { ...s.chat, messages: [...s.chat.messages, guruMsg] },
      }))
    } catch (error) {
      console.error('Guru API error:', error)
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'guru',
        content: "I'm having trouble connecting right now. The Vaathi servers might be busy — try again in a moment! 🛡️",
        timestamp: new Date(),
      }
      set((s) => ({
        chat: { ...s.chat, messages: [...s.chat.messages, fallbackMsg] },
      }))
    }
  },

  // Local-only actions
  addGuruMessageLocal: (content) =>
    set((s) => ({
      chat: {
        ...s.chat,
        messages: [...s.chat.messages, { id: Date.now().toString(), role: 'guru', content, timestamp: new Date() }],
      },
    })),

  selectLab: (labId) =>
    set({ selectedLab: labId, currentView: labId ? 'lab-detail' : 'labs' }),

  updateLabStep: (labId, step) =>
    set((s) => ({
      labProgress: {
        ...s.labProgress,
        [labId]: {
          ...(s.labProgress[labId] || { labId, currentStep: 0, hintsUsed: 0, completed: false }),
          currentStep: step,
        },
      },
    })),

  spendHint: (labId) =>
    set((s) => ({
      labProgress: {
        ...s.labProgress,
        [labId]: {
          ...(s.labProgress[labId] || { labId, currentStep: 0, hintsUsed: 0, completed: false }),
          hintsUsed: (s.labProgress[labId]?.hintsUsed || 0) + 1,
        },
      },
    })),

  setChatLanguage: (lang) =>
    set((s) => ({ chat: { ...s.chat, language: lang } })),

  setUser: (userData) =>
    set((s) => ({
      user: { ...s.user, ...userData },
      userId: (userData as { id?: string }).id || s.userId,
    })),
}))

// Helper hooks
export const useXPProgress = () => {
  const xp = useVaathiStore((s) => s.user.xp)
  const level = useVaathiStore((s) => s.user.level)
  const xpInLevel = xp - (level - 1) * 1000
  const xpForNext = 1000
  return { xp, level, xpInLevel, xpForNext, progress: (xpInLevel / xpForNext) * 100 }
}

export const TIER_CONFIG: Record<TierType, { emoji: string; label: string; color: string; desc: string }> = {
  egg: { emoji: '🥚', label: 'Egg', color: '#94a3b8', desc: 'Never touched a terminal' },
  hatch: { emoji: '🐣', label: 'Hatch', color: '#22c55e', desc: 'Knows basics, wrote some code' },
  fly: { emoji: '🐦', label: 'Fly', color: '#06b6d4', desc: 'Comfortable with Linux, networking' },
  soar: { emoji: '🦅', label: 'Soar', color: '#a855f7', desc: 'Has done CTFs, knows exploits' },
  burn: { emoji: '🔥', label: 'Burn', color: '#f59e0b', desc: 'Reverse engineering, 0-days territory' },
}
