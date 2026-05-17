'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import Navbar from '@/components/vaathi/navbar'
import LandingPage from '@/components/vaathi/landing'
import Assessment from '@/components/vaathi/assessment'
import Dashboard from '@/components/vaathi/dashboard'
import GuruChat from '@/components/vaathi/guru-chat'
import LabsBrowser from '@/components/vaathi/labs-browser'
import LabDetail from '@/components/vaathi/lab-detail'
import Arena from '@/components/vaathi/arena'
import Profile from '@/components/vaathi/profile'

export default function Home() {
  const { currentView, assessment, isLoading, initSession } = useVaathiStore()

  // Initialize session on mount — restore from DB if returning user
  useEffect(() => {
    initSession()
  }, [initSession])

  // Seed the database on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' }).catch(() => {})
  }, [])

  const showNavbar = assessment.completed || ['dashboard', 'labs', 'lab-detail', 'arena', 'guru-chat', 'profile'].includes(currentView)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center mx-auto mb-4 glow-green">
            <span className="text-3xl">🛡️</span>
          </div>
          <h2 className="text-xl font-bold text-neon mb-2">VAATHI</h2>
          <p className="text-sm text-muted-foreground">Loading your session...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cyber-dark">
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {currentView === 'landing' && <LandingPage />}
          {currentView === 'assessment' && <Assessment />}
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'guru-chat' && <GuruChat />}
          {currentView === 'labs' && <LabsBrowser />}
          {currentView === 'lab-detail' && <LabDetail />}
          {currentView === 'arena' && <Arena />}
          {currentView === 'profile' && <Profile />}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
