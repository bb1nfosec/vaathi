'use client'

import { motion } from 'framer-motion'
import { useVaathiStore, useXPProgress, TIER_CONFIG } from '@/store/vaathi-store'
import { thirtyDayRoadmap, labs } from '@/lib/vaathi-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Brain,
  Swords,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Beaker,
  Flag,
  ArrowRight,
  Zap,
  Clock,
  Star,
  TrendingUp,
  Activity,
} from 'lucide-react'

export default function Dashboard() {
  const { user, setView, selectLab } = useVaathiStore()
  const { level, xp, xpInLevel, xpForNext, progress } = useXPProgress()
  const tierConfig = TIER_CONFIG[user.tier]

  const roadmapProgress = Math.min(30, Math.floor(user.xp / 50))
  const completedCount = user.completedLabs.length
  const totalLabs = labs.length
  const labProgress = totalLabs > 0 ? (completedCount / totalLabs) * 100 : 0

  const roadmapItems = thirtyDayRoadmap.slice(0, 14)

  const quickActions = [
    {
      icon: Swords,
      title: 'Start a Lab',
      desc: 'Hands-on hacking sandbox',
      color: '#06b6d4',
      action: () => setView('labs'),
    },
    {
      icon: Trophy,
      title: 'CTF Arena',
      desc: 'Compete and prove yourself',
      color: '#f59e0b',
      action: () => setView('arena'),
    },
    {
      icon: Brain,
      title: 'Ask Guru AI',
      desc: 'Get unstuck, learn concepts',
      color: '#22c55e',
      action: () => setView('guru-chat'),
    },
  ]

  const recentActivities = [
    { icon: Beaker, text: 'Completed "Packet Sniffing" lab', time: '2h ago', xp: '+50 XP' },
    { icon: Trophy, text: 'Solved "Fake Govt Portal" CTF', time: '1d ago', xp: '+100 XP' },
    { icon: Star, text: 'Earned "Lab Rat" badge', time: '2d ago', xp: '' },
    { icon: Brain, text: 'Discussed SQL Injection with Guru', time: '3d ago', xp: '' },
  ]

  const skillLabels = ['Networking', 'Web Hacking', 'Linux', 'Cryptography', 'Malware']
  const skillValues = [
    user.skills.networking,
    user.skills.webHacking,
    user.skills.linux,
    user.skills.crypto,
    user.skills.malware,
  ]

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-neon/5 via-cyan-500/5 to-transparent border-cyber-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-[80px]" />
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Tier Badge */}
                <div className="flex flex-col items-center sm:items-start">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 mb-2"
                    style={{ borderColor: tierConfig.color, backgroundColor: `${tierConfig.color}10` }}
                  >
                    {tierConfig.emoji}
                  </div>
                  <Badge
                    variant="outline"
                    style={{ borderColor: tierConfig.color, color: tierConfig.color }}
                    className="font-semibold"
                  >
                    {tierConfig.label} Tier
                  </Badge>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                    Welcome back, <span className="text-neon">{user.name}</span>
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Level {level} &bull; {xp} Total XP &bull; {user.streak}-day streak 🔥
                  </p>
                  {/* XP Bar */}
                  <div className="flex items-center gap-3">
                    <Progress value={progress} className="flex-1 h-3 max-w-xs" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {xpInLevel}/{xpForNext} XP
                    </span>
                    <Zap className="w-4 h-4 text-neon" />
                  </div>
                </div>

                {/* Streak */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-cyber-border">
                  <Flame className="w-6 h-6 text-orange-400 mb-1" />
                  <span className="text-2xl font-bold text-orange-400">{user.streak}</span>
                  <span className="text-xs text-muted-foreground">Day Streak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon" />
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.title}
                    className="bg-white/[0.02] border-cyber-border hover:border-white/10 transition-all cursor-pointer group hover:-translate-y-0.5"
                    onClick={action.action}
                  >
                    <CardContent className="p-5 text-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors"
                        style={{ backgroundColor: `${action.color}15` }}
                      >
                        <action.icon className="w-6 h-6" style={{ color: action.color }} />
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-neon transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* 30-Day Roadmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-neon" />
                      Your 30-Day Roadmap
                    </CardTitle>
                    <Badge variant="outline" className="text-xs border-neon/30 text-neon">
                      Day {roadmapProgress}/30
                    </Badge>
                  </div>
                  <Progress value={(roadmapProgress / 30) * 100} className="h-2 mt-2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {roadmapItems.map((item, i) => {
                        const isComplete = i < roadmapProgress
                        const isCurrent = i === roadmapProgress
                        const typeColors: Record<string, string> = {
                          learn: '#a855f7',
                          setup: '#06b6d4',
                          lab: '#22c55e',
                          ctf: '#f59e0b',
                        }
                        const typeIcons: Record<string, typeof BookOpen> = {
                          learn: BookOpen,
                          setup: Target,
                          lab: Beaker,
                          ctf: Trophy,
                        }
                        const TypeIcon = typeIcons[item.type] || BookOpen
                        return (
                          <motion.div
                            key={item.day}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                              isCurrent
                                ? 'border-neon/30 bg-neon/5'
                                : isComplete
                                ? 'border-cyber-border bg-white/[0.01]'
                                : 'border-transparent bg-white/[0.01] opacity-50'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold bg-white/5">
                              {isComplete ? (
                                <span className="text-neon">✓</span>
                              ) : (
                                <span className="text-muted-foreground">D{item.day}</span>
                              )}
                            </div>
                            <TypeIcon
                              className="w-4 h-4 shrink-0"
                              style={{ color: typeColors[item.type] }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.title}</div>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground shrink-0">
                              +{item.xp} XP
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommended Lab */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Recommended For You
              </h2>
              {labs
                .filter((l) => !user.completedLabs.includes(l.id))
                .slice(0, 2)
                .map((lab) => (
                  <Card
                    key={lab.id}
                    className="bg-white/[0.02] border-cyber-border hover:border-white/10 transition-all cursor-pointer group mb-4"
                    onClick={() => selectLab(lab.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: lab.difficulty === 'Easy' ? '#22c55e' : lab.difficulty === 'Medium' ? '#f59e0b' : lab.difficulty === 'Hard' ? '#ef4444' : '#a855f7',
                                color: lab.difficulty === 'Easy' ? '#22c55e' : lab.difficulty === 'Medium' ? '#f59e0b' : lab.difficulty === 'Hard' ? '#ef4444' : '#a855f7',
                              }}
                            >
                              {lab.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-cyber-border text-muted-foreground">
                              {lab.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold group-hover:text-neon transition-colors">
                            {lab.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {lab.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lab.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {lab.xpReward} XP
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-neon transition-colors ml-4 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skill Radar (Simplified as bars) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Skill Fingerprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {skillLabels.map((label, i) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-mono text-foreground">{skillValues[i]}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skillValues[i]}%` }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${
                              skillValues[i] > 70 ? '#00ff88' : skillValues[i] > 40 ? '#f59e0b' : '#ef4444'
                            }, ${
                              skillValues[i] > 70 ? '#22c55e' : skillValues[i] > 40 ? '#fbbf24' : '#f87171'
                            })`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neon" />
                    Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Labs Done', value: completedCount, icon: Beaker, color: '#22c55e' },
                      { label: 'CTFs Solved', value: user.completedCTFs.length, icon: Flag, color: '#f59e0b' },
                      { label: 'Current Level', value: level, icon: Zap, color: '#06b6d4' },
                      { label: 'Badges', value: user.badges.length, icon: Star, color: '#a855f7' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-3 rounded-lg bg-white/[0.02] border border-cyber-border text-center"
                      >
                        <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Lab Progress */}
                  <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-cyber-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Lab Progress</span>
                      <span className="text-xs font-mono text-foreground">{completedCount}/{totalLabs}</span>
                    </div>
                    <Progress value={labProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Guru Nudge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="bg-gradient-to-br from-neon/5 to-transparent border-neon/20 cursor-pointer hover:border-neon/40 transition-colors"
                onClick={() => setView('guru-chat')}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-neon" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-neon mb-1">Guru Says:</h3>
                      <p className="text-sm text-foreground/70">
                        &ldquo;Hey {user.name}! You&apos;re doing great on networking. Why not try the ARP Spoofing lab next? I&apos;ll walk you through every step.&rdquo;
                      </p>
                      <Button variant="link" className="text-neon p-0 h-auto text-xs mt-2">
                        Chat with Guru <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {recentActivities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          <activity.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/80 truncate">{activity.text}</p>
                          <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                        </div>
                        {activity.xp && (
                          <span className="text-xs font-mono text-neon shrink-0">{activity.xp}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
