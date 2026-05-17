'use client'

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
  const { currentView, assessment } = useVaathiStore()
  const showNavbar = assessment.completed || currentView === 'dashboard' || currentView === 'labs' || currentView === 'lab-detail' || currentView === 'arena' || currentView === 'guru-chat' || currentView === 'profile'

  return (
    <main className="min-h-screen bg-cyber-dark">
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
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
