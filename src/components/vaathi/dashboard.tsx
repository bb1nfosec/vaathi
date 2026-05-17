'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useVaathiStore, useXPProgress, TIER_CONFIG } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Swords,
  Trophy,
  Flame,
  Star,
  Zap,
  ArrowRight,
  MessageSquare,
  Shield,
} from 'lucide-react'

export default function Dashboard() {
  const { user, setView, refreshUser } = useVaathiStore()
  const { xp, level, xpInLevel, xpForNext, progress } = useXPProgress()

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  if (!user) return null

  const tierConfig = TIER_CONFIG[user.tier]
  const nextTier = Object.values(TIER_CONFIG).find((t) => t.minXp > user.xp)
  const totalBadges = user.badges.length
  const totalLabs = user.completedLabs.length
  const totalCTFs = user.completedCTFs.length

  // Parse topic progress
  let topicProgress: Record<string, number> = {}
  try {
    topicProgress = JSON.parse(user.topicProgress || '{}')
  } catch {
    topicProgress = {}
  }
  const topicEntries = Object.entries(topicProgress).slice(0, 6)

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, <span className="text-neon">{user.name}</span>!
          </h1>
          <p className="text-muted-foreground">
            {user.streak > 1 ? `🔥 ${user.streak} day streak! Don&apos;t break the chain!` : 'Ready to learn some cybersecurity today?'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total XP', value: xp.toString(), icon: Zap, color: '#10b981' },
            { label: 'Level', value: level.toString(), icon: Star, color: '#f59e0b' },
            { label: 'Streak', value: `${user.streak}d`, icon: Flame, color: '#ef4444' },
            { label: 'Badges', value: totalBadges.toString(), icon: Shield, color: '#a855f7' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tier Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    Tier Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2"
                      style={{ borderColor: tierConfig.color, backgroundColor: `${tierConfig.color}10` }}
                    >
                      {tierConfig.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold" style={{ color: tierConfig.color }}>
                          {tierConfig.label}
                        </span>
                        <Badge variant="outline" className="text-[10px] border-cyber-border">
                          {xp} XP
                        </Badge>
                      </div>
                      {nextTier && (
                        <>
                          <Progress value={Math.min((xp / nextTier.minXp) * 100, 100)} className="h-2 mb-1" />
                          <p className="text-xs text-muted-foreground">
                            {nextTier.minXp - xp} XP to {nextTier.label} {nextTier.emoji}
                          </p>
                        </>
                      )}
                      {!nextTier && (
                        <p className="text-xs text-amber-400">🏆 Maximum tier reached!</p>
                      )}
                    </div>
                  </div>

                  {/* Tier timeline */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {Object.values(TIER_CONFIG).map((tier) => {
                      const isActive = user.xp >= tier.minXp
                      const isCurrent = tier.label === tierConfig.label
                      return (
                        <div key={tier.label} className="flex items-center">
                          <div
                            className={`flex flex-col items-center px-3 py-1 rounded-lg min-w-[60px] ${
                              isCurrent ? 'bg-white/5 border border-current/30' : ''
                            }`}
                            style={{ borderColor: isCurrent ? tier.color : undefined }}
                          >
                            <span className="text-lg">{tier.emoji}</span>
                            <span className={`text-[10px] font-medium ${isActive ? '' : 'text-muted-foreground'}`}
                              style={isActive ? { color: tier.color } : undefined}
                            >
                              {tier.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Button
                      onClick={() => setView('guru')}
                      className="gap-3 h-auto p-4 bg-neon/5 border border-neon/20 hover:bg-neon/10 text-neon justify-start"
                      variant="ghost"
                    >
                      <Brain className="w-5 h-5 shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">Ask Guru</div>
                        <div className="text-xs text-neon/60">Chat with AI mentor</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        setView('guru')
                      }}
                      className="gap-3 h-auto p-4 bg-ice/5 border border-ice/20 hover:bg-ice/10 text-ice justify-start"
                      variant="ghost"
                    >
                      <Swords className="w-5 h-5 shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">Generate Lab</div>
                        <div className="text-xs text-ice/60">AI creates a lab for you</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setView('arena')}
                      className="gap-3 h-auto p-4 bg-fire/5 border border-fire/20 hover:bg-fire/10 text-fire justify-start"
                      variant="ghost"
                    >
                      <Trophy className="w-5 h-5 shrink-0" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">CTF Arena</div>
                        <div className="text-xs text-fire/60">Solve challenges</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {user.completedLabs.length === 0 && user.completedCTFs.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">
                          No activity yet. Start learning with Guru! 🧑‍💻
                        </p>
                        <Button
                          onClick={() => setView('guru')}
                          className="mt-3 gap-2 bg-neon text-cyber-dark hover:bg-neon/90"
                          size="sm"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Start Learning
                        </Button>
                      </div>
                    )}
                    {[
                      ...user.completedLabs.map((l) => ({
                        type: 'Lab',
                        title: l.labTitle,
                        xp: l.xpEarned,
                        date: l.completedAt,
                        color: '#06b6d4',
                      })),
                      ...user.completedCTFs.map((c) => ({
                        type: 'CTF',
                        title: c.challengeTitle,
                        xp: c.pointsEarned,
                        date: c.completedAt,
                        color: '#f59e0b',
                      })),
                    ]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 8)
                      .map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                          >
                            {item.type === 'Lab' ? '🧪' : '🏴'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.type} &bull; +{item.xp} XP
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.badges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No badges yet. Complete labs and CTFs to earn badges!
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {user.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center p-3 rounded-lg bg-white/[0.02] border border-cyber-border hover:border-neon/30 transition-colors"
                        >
                          <span className="text-2xl">{badge.emoji}</span>
                          <span className="text-[10px] text-center mt-1 text-foreground/80 leading-tight">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Topic Progress */}
            {topicEntries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/[0.02] border-cyber-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Topics Explored</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topicEntries.map(([topic, level]) => (
                        <div key={topic}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground/80 capitalize">{topic.replace(/_/g, ' ')}</span>
                            <span className="text-muted-foreground">{level}</span>
                          </div>
                          <Progress value={Math.min(level * 20, 100)} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
