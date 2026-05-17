'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import Navbar from '@/components/vaathi/navbar'
import LandingPage from '@/components/vaathi/landing'
import Onboarding from '@/components/vaathi/onboarding'
import Dashboard from '@/components/vaathi/dashboard'
import GuruChat from '@/components/vaathi/guru-chat'
import LabSession from '@/components/vaathi/lab-session'
import Arena from '@/components/vaathi/arena'
import Profile from '@/components/vaathi/profile'

export default function Home() {
  const { currentView, isLoading, initSession } = useVaathiStore()

  useEffect(() => {
    initSession()
  }, [initSession])

  const showNavbar = ['dashboard', 'guru', 'lab', 'arena', 'profile'].includes(currentView)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
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
    <main className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {currentView === 'landing' && <LandingPage />}
          {currentView === 'onboarding' && <Onboarding />}
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'guru' && <GuruChat />}
          {currentView === 'lab' && <LabSession />}
          {currentView === 'arena' && <Arena />}
          {currentView === 'profile' && <Profile />}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
