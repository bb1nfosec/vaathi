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
    activityLog: { date: string; labs: number; xp: number }[]
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

  setView: (view: ViewType) => void
  goBack: () => void
  completeAssessment: (answers: Record<number, number>, tier: TierType, name: string) => void
  addXP: (amount: number) => void
  completeLab: (labId: string, xp: number) => void
  completeCTF: (ctfId: string, points: number) => void
  sendMessage: (content: string) => void
  addGuruMessage: (content: string) => void
  selectLab: (labId: string | null) => void
  updateLabStep: (labId: string, step: number) => void
  spendHint: (labId: string) => void
  setChatLanguage: (lang: 'english' | 'hindi' | 'tamil') => void
  setTier: (tier: TierType) => void
}

const TIER_XP_MAP: Record<TierType, number> = {
  egg: 0,
  hatch: 500,
  fly: 2000,
  soar: 5000,
  burn: 12000,
}

function calcLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1
}

function calcXPForLevel(level: number): number {
  return (level - 1) * 1000
}

function generateActivityLog(): { date: string; labs: number; xp: number }[] {
  const log: { date: string; labs: number; xp: number }[] = []
  for (let i = 30; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    if (Math.random() > 0.5) {
      log.push({
        date: d.toISOString().split('T')[0],
        labs: Math.floor(Math.random() * 3),
        xp: Math.floor(Math.random() * 200) + 50,
      })
    } else {
      log.push({ date: d.toISOString().split('T')[0], labs: 0, xp: 0 })
    }
  }
  return log
}

export const useVaathiStore = create<VaathiState>((set, get) => ({
  currentView: 'landing',
  previousView: null,
  user: {
    name: 'Hacker',
    tier: 'egg',
    xp: 0,
    level: 1,
    streak: 7,
    college: '',
    state: '',
    completedLabs: [],
    completedCTFs: [],
    badges: ['first-login', 'assessment-complete'],
    certificates: [],
    skills: { networking: 10, webHacking: 5, linux: 15, crypto: 5, malware: 0 },
    activityLog: [],
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

  completeAssessment: (answers, tier, name) =>
    set((s) => {
      const baseXP = TIER_XP_MAP[tier]
      const level = calcLevel(baseXP)
      const skillMultipliers: Record<TierType, { networking: number; webHacking: number; linux: number; crypto: number; malware: number }> = {
        egg: { networking: 10, webHacking: 5, linux: 15, crypto: 5, malware: 0 },
        hatch: { networking: 25, webHacking: 15, linux: 30, crypto: 10, malware: 5 },
        fly: { networking: 50, webHacking: 40, linux: 55, crypto: 35, malware: 20 },
        soar: { networking: 75, webHacking: 65, linux: 70, crypto: 60, malware: 50 },
        burn: { networking: 95, webHacking: 90, linux: 85, crypto: 85, malware: 80 },
      }
      return {
        user: {
          ...s.user,
          name,
          tier,
          xp: baseXP,
          level,
          badges: [...s.user.badges, 'assessment-complete'],
          skills: skillMultipliers[tier],
          activityLog: generateActivityLog(),
        },
        assessment: { ...s.assessment, completed: true, tier },
        currentView: 'dashboard',
      }
    }),

  addXP: (amount) =>
    set((s) => {
      const newXP = s.user.xp + amount
      return {
        user: { ...s.user, xp: newXP, level: calcLevel(newXP) },
      }
    }),

  completeLab: (labId, xp) =>
    set((s) => ({
      user: {
        ...s.user,
        completedLabs: s.user.completedLabs.includes(labId)
          ? s.user.completedLabs
          : [...s.user.completedLabs, labId],
        xp: s.user.xp + xp,
        level: calcLevel(s.user.xp + xp),
        badges: s.user.completedLabs.length >= 4 && !s.user.badges.includes('five-labs')
          ? [...s.user.badges, 'five-labs']
          : s.user.badges,
      },
      labProgress: {
        ...s.labProgress,
        [labId]: { ...s.labProgress[labId], completed: true },
      },
    })),

  completeCTF: (ctfId, points) =>
    set((s) => ({
      user: {
        ...s.user,
        completedCTFs: s.user.completedCTFs.includes(ctfId)
          ? s.user.completedCTFs
          : [...s.user.completedCTFs, ctfId],
        xp: s.user.xp + points,
        level: calcLevel(s.user.xp + points),
      },
    })),

  sendMessage: (content) =>
    set((s) => ({
      chat: {
        ...s.chat,
        messages: [
          ...s.chat.messages,
          {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
          },
        ],
      },
    })),

  addGuruMessage: (content) =>
    set((s) => ({
      chat: {
        ...s.chat,
        messages: [
          ...s.chat.messages,
          {
            id: (Date.now() + 1).toString(),
            role: 'guru',
            content,
            timestamp: new Date(),
          },
        ],
      },
    })),

  selectLab: (labId) =>
    set({
      selectedLab: labId,
      currentView: labId ? 'lab-detail' : 'labs',
    }),

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

  setTier: (tier) => set((s) => ({ user: { ...s.user, tier } })),
}))

// Helper hooks
export const useXPProgress = () => {
  const xp = useVaathiStore((s) => s.user.xp)
  const level = useVaathiStore((s) => s.user.level)
  const xpInLevel = xp - calcXPForLevel(level)
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

export function xpForTier(tier: TierType): number {
  return TIER_XP_MAP[tier]
}
