'use client'

import { useVaathiStore, useXPProgress, TIER_CONFIG } from '@/store/vaathi-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import {
  Shield,
  Brain,
  Swords,
  Trophy,
  User,
  Terminal,
  Bell,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: Terminal },
  { id: 'labs' as const, label: 'Labs', icon: Swords },
  { id: 'arena' as const, label: 'Arena', icon: Trophy },
  { id: 'guru-chat' as const, label: 'Guru AI', icon: Brain },
  { id: 'profile' as const, label: 'Profile', icon: User },
]

export default function Navbar() {
  const { currentView, setView, user, assessment } = useVaathiStore()
  const { level, xpInLevel, xpForNext, progress } = useXPProgress()
  const [mobileOpen, setMobileOpen] = useState(false)
  const tierConfig = TIER_CONFIG[user.tier]
  const isAssessed = assessment.completed

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-cyber-border bg-cyber-dark/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setView(isAssessed ? 'dashboard' : 'landing')}
          className="flex items-center gap-2 group"
        >
          <Shield className="w-7 h-7 text-neon group-hover:drop-shadow-[0_0_8px_rgba(0,255,136,0.5)] transition-all" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-neon">VAATHI</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {isAssessed &&
            navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setView(item.id)}
                  className={`relative gap-2 ${
                    isActive
                      ? 'text-neon bg-neon/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon rounded-full"
                    />
                  )}
                </Button>
              )
            })}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {isAssessed && (
            <>
              {/* Level & XP */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-cyber-border">
                    <span className="text-xs font-mono text-neon">Lv.{level}</span>
                    <Progress value={progress} className="w-16 h-1.5" />
                    <span className="text-xs text-muted-foreground font-mono">{xpInLevel}/{xpForNext}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.xp} Total XP</p>
                </TooltipContent>
              </Tooltip>

              {/* Tier Badge */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="hidden sm:flex gap-1 border-current/30 cursor-pointer"
                    style={{ borderColor: tierConfig.color, color: tierConfig.color }}
                  >
                    <span>{tierConfig.emoji}</span>
                    <span className="text-xs">{tierConfig.label}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tierConfig.desc}</p>
                </TooltipContent>
              </Tooltip>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon rounded-full" />
              </Button>

              {/* Avatar */}
              <Avatar className="w-8 h-8 border border-cyber-border">
                <AvatarFallback className="bg-neon/10 text-neon text-xs font-mono">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </>
          )}

          {/* Mobile menu button */}
          {isAssessed && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-cyber-border bg-cyber-dark/95 backdrop-blur-xl p-4"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    setView(item.id)
                    setMobileOpen(false)
                  }}
                  className={`justify-start gap-3 ${isActive ? 'text-neon bg-neon/10' : 'text-muted-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
          {/* Mobile XP bar */}
          <div className="mt-3 pt-3 border-t border-cyber-border flex items-center gap-2">
            <span className="text-xs font-mono text-neon">Lv.{level}</span>
            <Progress value={progress} className="flex-1 h-1.5" />
            <span className="text-xs text-muted-foreground font-mono">{user.xp} XP</span>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
