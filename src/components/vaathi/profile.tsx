'use client'

import { motion } from 'framer-motion'
import { useVaathiStore, useXPProgress, TIER_CONFIG } from '@/store/vaathi-store'
import { badgeDefinitions, labs } from '@/lib/vaathi-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Zap,
  Star,
  Trophy,
  Target,
  Flame,
  BookOpen,
  Shield,
  Globe,
  Terminal,
  Lock,
  Key,
  Bug,
  Landmark,
  Award,
  TrendingUp,
} from 'lucide-react'

const skillNodes = [
  { id: 'networking', label: 'Networking', icon: Globe, color: '#22c55e', tier: 'egg' },
  { id: 'webHacking', label: 'Web Hacking', icon: Terminal, color: '#06b6d4', tier: 'hatch' },
  { id: 'linux', label: 'Linux & Terminal', icon: Terminal, color: '#f59e0b', tier: 'hatch' },
  { id: 'crypto', label: 'Cryptography', icon: Key, color: '#a855f7', tier: 'fly' },
  { id: 'malware', label: 'Malware Analysis', icon: Bug, color: '#ef4444', tier: 'soar' },
]

export default function Profile() {
  const { user } = useVaathiStore()
  const { level, xp, progress } = useXPProgress()
  const tierConfig = TIER_CONFIG[user.tier]

  const totalLabsCompleted = user.completedLabs.length
  const totalCTFsSolved = user.completedCTFs.length
  const totalBadges = user.badges.length

  // Activity heatmap data (simplified)
  const heatmapData = user.activityLog.slice(-28)

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/[0.02] border-cyber-border overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-neon/10 via-cyan-500/5 to-purple-500/10" />
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                <Avatar className="w-24 h-24 border-4 border-cyber-dark shrink-0">
                  <AvatarFallback className="bg-neon/10 text-neon text-2xl font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1"
                      style={{ borderColor: tierConfig.color, color: tierConfig.color }}
                    >
                      {tierConfig.emoji} {tierConfig.label} Tier
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 border-cyber-border">
                      Level {level}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 border-amber-500/30 text-amber-400">
                      <Flame className="w-3 h-3 mr-1" />
                      {user.streak}-day streak
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon">{xp.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                  <div className="mt-2 w-32">
                    <Progress value={progress} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-1 text-right font-mono">
                      Next level: {(level) * 1000} XP
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Tree */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-neon" />
                    Skill Tree
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-4">
                    {skillNodes.map((node, i) => {
                      const skillValue = user.skills[node.id as keyof typeof user.skills]
                      const isUnlocked = skillValue > 0
                      return (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
                          style={{
                            borderColor: isUnlocked ? `${node.color}30` : 'transparent',
                            backgroundColor: isUnlocked ? `${node.color}05` : 'rgba(255,255,255,0.01)',
                          }}
                        >
                          {/* Connection line */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
                              style={{
                                borderColor: isUnlocked ? node.color : '#1e293b',
                                backgroundColor: isUnlocked ? `${node.color}15` : 'rgba(255,255,255,0.02)',
                              }}
                            >
                              <node.icon
                                className="w-5 h-5"
                                style={{ color: isUnlocked ? node.color : '#475569' }}
                              />
                            </div>
                            {i < skillNodes.length - 1 && (
                              <div className={`w-0.5 h-6 mt-1 ${isUnlocked ? 'bg-neon/20' : 'bg-white/5'}`} />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-sm font-semibold ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                                {node.label}
                              </h3>
                              {!isUnlocked && (
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            {isUnlocked && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skillValue}%` }}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: node.color }}
                                  />
                                </div>
                                <span className="text-xs font-mono" style={{ color: node.color }}>
                                  {skillValue}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Labs count */}
                          {isUnlocked && (
                            <div className="text-right shrink-0">
                              <div className="text-xs text-muted-foreground">
                                {labs.filter((l) => l.category === node.label.replace(' & Terminal', '')).length} labs
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Badges ({totalBadges}/{badgeDefinitions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {badgeDefinitions.map((badge, i) => {
                      const isEarned = user.badges.includes(badge.id)
                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-4 rounded-xl border text-center transition-colors ${
                            isEarned
                              ? 'bg-white/[0.03] border-cyber-border'
                              : 'bg-white/[0.01] border-cyber-border/50 opacity-40'
                          }`}
                        >
                          <div className="text-2xl mb-2">{isEarned ? badge.icon : '🔒'}</div>
                          <h4 className="text-xs font-semibold">{badge.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-neon" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {[
                      { label: 'Labs Completed', value: totalLabsCompleted, icon: BookOpen, color: '#22c55e' },
                      { label: 'CTFs Solved', value: totalCTFsSolved, icon: Trophy, color: '#f59e0b' },
                      { label: 'Badges Earned', value: totalBadges, icon: Star, color: '#a855f7' },
                      { label: 'Current Level', value: level, icon: Zap, color: '#06b6d4' },
                      { label: 'Day Streak', value: user.streak, icon: Flame, color: '#ef4444' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3 p-2 rounded-lg">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                        <span className="font-bold font-mono">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon" />
                    Activity (Last 28 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-7 gap-1">
                    {heatmapData.map((day, i) => {
                      const intensity = day.xp > 150 ? 4 : day.xp > 100 ? 3 : day.xp > 50 ? 2 : day.xp > 0 ? 1 : 0
                      const colors = ['bg-white/5', 'bg-neon/20', 'bg-neon/40', 'bg-neon/60', 'bg-neon/80']
                      return (
                        <div
                          key={i}
                          className={`w-full aspect-square rounded-sm ${colors[intensity]} transition-colors`}
                          title={`${day.date}: ${day.xp} XP`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                      {['bg-white/5', 'bg-neon/20', 'bg-neon/40', 'bg-neon/60', 'bg-neon/80'].map((c, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                      ))}
                    </div>
                    <span>More</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements to Unlock */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Next Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {[
                    { label: 'Complete 5 Labs', progress: Math.min(100, (totalLabsCompleted / 5) * 100) },
                    { label: 'Solve 3 CTFs', progress: Math.min(100, (totalCTFsSolved / 3) * 100) },
                    { label: 'Reach Level 5', progress: Math.min(100, (level / 5) * 100) },
                    { label: 'Earn 10 Badges', progress: Math.min(100, (totalBadges / 10) * 100) },
                  ].map((milestone) => (
                    <div key={milestone.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{milestone.label}</span>
                        <span className="text-[10px] font-mono text-neon">{Math.round(milestone.progress)}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
