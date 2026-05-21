'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Flame, Star, RefreshCw, Target, TrendingUp,
  Activity, Brain, Award, BarChart2,
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts'

// ── Activity Heatmap ──────────────────────────────────────────────────────────

function ActivityHeatmap({ dates }: { dates: string[] }) {
  const dateSet = useMemo(() => new Set(dates), [dates])

  // Build last 12 weeks (84 days) of cells
  const cells = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result: Array<{ date: string; active: boolean; dayOfWeek: number }> = []

    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      result.push({ date: key, active: dateSet.has(key), dayOfWeek: d.getDay() })
    }
    return result
  }, [dateSet])

  // Split into weeks (columns of 7)
  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const totalActive = cells.filter((c) => c.active).length

  return (
    <Card className="bg-white/[0.02] border-cyber-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon" />
            Activity — Last 12 Weeks
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-neon/30 text-neon">
            {totalActive} active days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={cell.date}
                  className={`w-3 h-3 rounded-sm transition-colors ${
                    cell.active
                      ? 'bg-neon'
                      : 'bg-white/[0.04] border border-white/[0.06]'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0.1, 0.3, 0.6, 1].map((op, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-neon" style={{ opacity: op }} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({ value, max, label, color = '#10b981' }: { value: number; max: number; label: string; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <circle
          cx="44" cy="44" r={r}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
        <text x="44" y="48" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold" fontFamily="monospace">
          {pct}%
        </text>
      </svg>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
      <p className="text-sm font-semibold" style={{ color }}>{value}/{max}</p>
    </div>
  )
}

// ── Main Analytics Component ──────────────────────────────────────────────────

export default function Analytics() {
  const { setView, analyticsData, loadAnalytics, user } = useVaathiStore()

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (!analyticsData) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Loading your analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { domainStats, activityDates, smStats, streakInfo, overallProgress } = analyticsData

  // Radar chart data
  const radarData = domainStats.map((d) => ({
    domain: d.domain.charAt(0).toUpperCase() + d.domain.slice(1),
    completed: d.completed,
    total: d.total,
    fullMark: Math.max(...domainStats.map((x) => x.total), 1),
  }))

  const smCards = [
    { label: 'Total Reviews', value: smStats.totalReviews, icon: RefreshCw, color: '#06b6d4' },
    { label: 'Avg Ease Factor', value: smStats.avgEaseFactor.toFixed(2), icon: Brain, color: '#a855f7' },
    { label: 'Topics w/ Reviews', value: smStats.topicsWithReviews, icon: Target, color: '#f59e0b' },
    { label: 'Current Streak', value: `${streakInfo.currentStreak}d`, icon: Flame, color: '#ef4444' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-neon" />
              Analytics
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your cybersecurity learning journey</p>
          </div>
        </motion.div>

        <div className="grid gap-4">
          {/* Top row: Progress ring + SM-2 stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Progress ring */}
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neon" />
                  Roadmap Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-around flex-wrap gap-4">
                  <ProgressRing
                    value={overallProgress.completedTopics}
                    max={overallProgress.totalTopics}
                    label="Topics Completed"
                    color="#10b981"
                  />
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neon font-mono">{overallProgress.totalXP.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400 font-mono">Lv. {overallProgress.level}</p>
                      <p className="text-xs text-muted-foreground">Current Level</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium">{streakInfo.currentStreak} day streak</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SM-2 stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {smCards.map((card) => {
                const Icon = card.icon
                return (
                  <Card key={card.label} className="bg-white/[0.02] border-cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${card.color}15`, color: card.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <Badge variant="outline" className="text-[9px] border-cyber-border">SM-2</Badge>
                      </div>
                      <p className="text-xl font-bold font-mono" style={{ color: card.color }}>{card.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{card.label}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Domain Mastery Radar */}
          {radarData.length > 0 && (
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-neon" />
                  Domain Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis
                        dataKey="domain"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                      />
                      <Radar
                        name="Completed"
                        dataKey="completed"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Total"
                        dataKey="total"
                        stroke="rgba(255,255,255,0.2)"
                        fill="rgba(255,255,255,0.05)"
                        fillOpacity={0.1}
                        strokeWidth={1}
                        strokeDasharray="4 2"
                      />
                      <Tooltip
                        contentStyle={{ background: '#0d1117', border: '1px solid #2d2d3a', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: '#10b981' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {/* Domain stats table */}
                <div className="mt-3 space-y-1.5">
                  {domainStats.map((d) => (
                    <div key={d.domain} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 capitalize">{d.domain}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon rounded-full transition-all"
                          style={{ width: d.total > 0 ? `${(d.completed / d.total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs font-mono text-neon w-12 text-right">{d.completed}/{d.total}</span>
                      <span className="text-[10px] text-muted-foreground w-16 text-right">ease {d.avgEaseFactor.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Heatmap */}
          <ActivityHeatmap dates={activityDates} />

          {user && (
            <Card className="bg-gradient-to-r from-neon/5 to-transparent border-neon/20">
              <CardContent className="p-4 flex items-center gap-4">
                <Star className="w-6 h-6 text-neon shrink-0" />
                <div>
                  <p className="text-sm font-medium">Keep going, {user.name}!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {overallProgress.availableTopics > 0
                      ? `${overallProgress.availableTopics} topic${overallProgress.availableTopics !== 1 ? 's' : ''} available to start.`
                      : 'All available topics completed — check your roadmap for reviews.'
                    }
                  </p>
                </div>
                <Button
                  onClick={() => setView('roadmap')}
                  size="sm"
                  className="ml-auto bg-neon text-cyber-dark hover:bg-neon/90"
                >
                  Roadmap
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
