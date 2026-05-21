'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useVaathiStore } from '@/store/vaathi-store'
import { Download, Bell, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAPrompt() {
  const { pushEnabled, subscribeToPush, userId } = useVaathiStore()
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [pushDismissed, setPushDismissed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Check if already dismissed
    const wasDismissed = localStorage.getItem('vaathi_pwa_dismissed')
    const pushWasDismissed = localStorage.getItem('vaathi_push_dismissed')
    if (wasDismissed) setDismissed(true)
    if (pushWasDismissed) setPushDismissed(true)

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }

  const handleSubscribe = async () => {
    setIsSubscribing(true)
    await subscribeToPush()
    setIsSubscribing(false)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('vaathi_pwa_dismissed', '1')
  }

  const handlePushDismiss = () => {
    setPushDismissed(true)
    localStorage.setItem('vaathi_push_dismissed', '1')
  }

  // Don't show if no user, or everything is handled
  const showInstall = !isInstalled && !dismissed && !!installPrompt
  const showPush = !pushEnabled && !pushDismissed && !!userId && 'Notification' in window && Notification.permission !== 'denied'

  if (!showInstall && !showPush) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      <AnimatePresence>
        {showInstall && (
          <motion.div
            key="install"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-cyber-dark/95 border border-cyber-border rounded-xl p-4 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-neon/10 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-neon" />
                </div>
                <div>
                  <p className="text-sm font-medium">Install Vaathi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add to home screen for offline access</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleInstall}
              size="sm"
              className="w-full mt-3 bg-neon text-cyber-dark hover:bg-neon/90 gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </Button>
          </motion.div>
        )}

        {showPush && (
          <motion.div
            key="push"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-cyber-dark/95 border border-cyber-border rounded-xl p-4 backdrop-blur-xl shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Review Reminders</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Get notified when topics are due for spaced repetition</p>
                </div>
              </div>
              <button onClick={handlePushDismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              size="sm"
              variant="outline"
              className="w-full mt-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/5 gap-2"
            >
              <Bell className="w-3.5 h-3.5" />
              {isSubscribing ? 'Enabling...' : 'Enable Review Reminders'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
