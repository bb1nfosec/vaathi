'use client'

import { useVaathiStore, useXPProgress, TIER_CONFIG } from '@/store/vaathi-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import {
  Shield,
  Brain,
  BookOpen,
  Trophy,
  User,
  Terminal,
  Menu,
  X,
  LogIn,
  LogOut,
  BarChart2,
} from 'lucide-react'
import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: Terminal },
  { id: 'roadmap' as const, label: 'Roadmap', icon: BookOpen },
  { id: 'guru' as const, label: 'Guru Chat', icon: Brain },
  { id: 'arena' as const, label: 'CTF Arena', icon: Trophy },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
  { id: 'profile' as const, label: 'Profile', icon: User },
]

export default function Navbar() {
  const { currentView, setView, user } = useVaathiStore()
  const { level, xpInLevel, xpForNext, progress } = useXPProgress()
  const [mobileOpen, setMobileOpen] = useState(false)
  const tierConfig = user ? TIER_CONFIG[user.tier] : TIER_CONFIG.egg
  const { data: session } = useSession()

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
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 group"
        >
          <Shield className="w-7 h-7 text-neon group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-neon">VAATHI</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
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
          {user && (
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

              {/* Avatar */}
              <Avatar className="w-8 h-8 border border-cyber-border">
                <AvatarFallback className="bg-neon/10 text-neon text-xs font-mono">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </>
          )}

          {/* Auth section */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-white/5 p-1 transition-colors">
                  <Avatar className="w-7 h-7 border border-neon/30">
                    {session.user?.image && <AvatarImage src={session.user.image} alt={session.user?.name || ''} />}
                    <AvatarFallback className="bg-neon/10 text-neon text-xs">
                      {session.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-xs text-muted-foreground max-w-[80px] truncate">
                    {session.user?.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-cyber-dark border-cyber-border">
                <div className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[200px]">
                  {session.user?.email}
                </div>
                <DropdownMenuSeparator className="bg-cyber-border" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signIn()}
              className="gap-1.5 text-muted-foreground hover:text-foreground text-xs hidden sm:flex"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
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
          {user && (
            <div className="mt-3 pt-3 border-t border-cyber-border flex items-center gap-2">
              <span className="text-xs font-mono text-neon">Lv.{level}</span>
              <Progress value={progress} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground font-mono">{user.xp} XP</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  )
}
