'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useVaathiStore, RoadmapTopicData } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Brain, ArrowLeft, CheckCircle2, Lock, Play,
  Sparkles, RotateCcw, BookOpen, Trophy, Clock, RefreshCw,
} from 'lucide-react'

const DOMAIN_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  networking: { icon: '🌐', color: '#10b981', label: 'Networking' },
  linux: { icon: '🐧', color: '#f59e0b', label: 'Linux' },
  web: { icon: '🌍', color: '#06b6d4', label: 'Web Security' },
  crypto: { icon: '🔐', color: '#a855f7', label: 'Cryptography' },
  recon: { icon: '🔍', color: '#ec4899', label: 'Recon' },
  defense: { icon: '🏰', color: '#ef4444', label: 'Defense' },
  general: { icon: '🛡️', color: '#64748b', label: 'General' },
}

function isDueForReview(topic: RoadmapTopicData): boolean {
  if (topic.status !== 'completed') return false
  if (!topic.nextReviewAt) return true  // completed before SM-2 was added
  return new Date(topic.nextReviewAt) <= new Date()
}

function formatReviewDate(nextReviewAt: string | null | undefined): string {
  if (!nextReviewAt) return 'Review now'
  const d = new Date(nextReviewAt)
  const now = new Date()
  const diffDays = Math.round((d.getTime() - now.getTime()) / 86_400_000)
  if (diffDays <= 0) return 'Due now'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays < 7) return `Due in ${diffDays}d`
  if (diffDays < 30) return `Due in ${Math.round(diffDays / 7)}w`
  return `Due in ${Math.round(diffDays / 30)}mo`
}

export default function LearningRoadmap() {
  const { roadmapTopics, roadmapSummary, user, setView, startTopic, startReview, loadRoadmap } = useVaathiStore()

  useEffect(() => {
    if (roadmapTopics.length === 0) loadRoadmap()
  }, [])

  if (!user) return null

  const total = roadmapTopics.length
  const completed = roadmapTopics.filter((t) => t.status === 'completed').length
  const available = roadmapTopics.filter((t) => t.status === 'available').length
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const nextAvailable = roadmapTopics.find((t) => t.status === 'available')
  const dueTopics = roadmapTopics.filter(isDueForReview)

  // Group topics by domain
  const domains: Record<string, RoadmapTopicData[]> = {}
  for (const topic of roadmapTopics) {
    const domain = topic.domain || 'general'
    if (!domains[domain]) domains[domain] = []
    domains[domain].push(topic)
  }

  const TopicRow = ({ topic, index }: { topic: RoadmapTopicData; index: number }) => {
    const domainCfg = DOMAIN_CONFIG[topic.domain] || DOMAIN_CONFIG.general
    const isCompleted = topic.status === 'completed'
    const isAvailable = topic.status === 'available'
    const isLocked = topic.status === 'locked'
    const isInProgress = topic.status === 'in_progress'
    const due = isDueForReview(topic)

    const handleClick = () => {
      if (due) return startReview(topic.id)
      if (isAvailable || isInProgress) return startTopic(topic.id)
    }

    const isClickable = due || isAvailable || isInProgress

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
          due ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50 cursor-pointer' :
          isCompleted ? 'bg-neon/5 border-neon/20' :
          isAvailable || isInProgress ? 'bg-white/[0.03] border-cyber-border hover:border-neon/30 cursor-pointer' :
          'bg-white/[0.01] border-transparent opacity-50'
        }`}
        onClick={isClickable ? handleClick : undefined}
      >
        {/* Status icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          due ? 'bg-amber-500/20 text-amber-400' :
          isCompleted ? 'bg-neon text-cyber-dark' :
          isAvailable || isInProgress ? 'bg-neon/10 text-neon' :
          'bg-white/5 text-muted-foreground'
        }`}>
          {due ? <RefreshCw className="w-3.5 h-3.5" /> :
           isCompleted ? <CheckCircle2 className="w-4 h-4" /> :
           isLocked ? <Lock className="w-3.5 h-3.5" /> :
           <Play className="w-4 h-4" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-medium truncate ${isCompleted && !due ? 'line-through text-muted-foreground' : ''}`}>
              {topic.title}
            </span>
            {due && (
              <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                REVIEW
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px]">{domainCfg.icon}</span>
            <Badge
              variant="outline"
              className="text-[9px] py-0"
              style={{
                borderColor: topic.difficulty === 'beginner' ? '#22c55e' : topic.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444',
                color: topic.difficulty === 'beginner' ? '#22c55e' : topic.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444',
              }}
            >
              {topic.difficulty}
            </Badge>
            <span className="text-[10px] text-muted-foreground">+{topic.xpReward} XP</span>
            {isCompleted && topic.reviewCount && topic.reviewCount > 0 && !due && topic.nextReviewAt && (
              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatReviewDate(topic.nextReviewAt)}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        {isClickable && (
          <span className={`text-sm ${due ? 'text-amber-400' : 'text-muted-foreground'}`}>→</span>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-neon" />
                Your Learning Roadmap
              </h1>
              <p className="text-xs text-muted-foreground">
                Personalized based on your skill assessment
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setView('assessment')} className="gap-1 text-xs border-cyber-border">
            <RotateCcw className="w-3 h-3" />
            Re-assess
          </Button>
        </motion.div>

        {/* Summary */}
        {roadmapSummary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="bg-gradient-to-br from-neon/5 to-cyan-500/5 border-neon/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-neon shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 leading-relaxed">{roadmapSummary}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <Card className="bg-white/[0.02] border-cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-neon font-mono">{completed}/{total} topics</span>
              </div>
              <Progress value={progressPct} className="h-2 mb-3" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{completed} completed</span>
                <span>{available} available</span>
                <span>{total - completed - available} locked</span>
                {dueTopics.length > 0 && (
                  <span className="text-amber-400 font-medium">{dueTopics.length} due for review</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Due for Review */}
        {dueTopics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-6">
            <Card className="bg-amber-500/5 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                  <RefreshCw className="w-4 h-4" />
                  Due for Review
                  <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                    {dueTopics.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Spaced repetition — revisit these topics to lock them in long-term memory.
                </p>
                {dueTopics.map((topic, i) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all"
                    onClick={() => startReview(topic.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{topic.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{DOMAIN_CONFIG[topic.domain]?.icon} {DOMAIN_CONFIG[topic.domain]?.label || topic.domain}</span>
                        {topic.reviewCount !== undefined && topic.reviewCount > 0 && (
                          <span>· {topic.reviewCount} review{topic.reviewCount !== 1 ? 's' : ''} done</span>
                        )}
                        {topic.easeFactor !== undefined && (
                          <span>· EF {topic.easeFactor.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-amber-400 text-sm shrink-0">→</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Available */}
        {nextAvailable && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
            <Card className="bg-neon/5 border-neon/30 glow-green">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neon font-medium mb-1">UP NEXT</p>
                    <p className="text-sm font-bold">{nextAvailable.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{nextAvailable.description.slice(0, 80)}...</p>
                  </div>
                  <Button onClick={() => startTopic(nextAvailable.id)} className="bg-neon text-cyber-dark hover:bg-neon/90 gap-2 shrink-0">
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Topics by Domain */}
        <div className="space-y-6">
          {Object.entries(domains).map(([domain, topics]) => {
            const cfg = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.general
            const domainCompleted = topics.filter((t) => t.status === 'completed').length
            const domainDue = topics.filter(isDueForReview).length
            return (
              <motion.div
                key={domain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/[0.02] border-cyber-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto border-cyber-border">
                        {domainCompleted}/{topics.length}
                      </Badge>
                      {domainDue > 0 && (
                        <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {domainDue} due
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {topics.map((topic, i) => (
                        <TopicRow key={topic.id} topic={topic} index={i} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Roadmap Complete */}
        {completed === total && total > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <Card className="bg-gradient-to-br from-amber-500/5 to-neon/5 border-amber-500/20">
              <CardContent className="p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <span className="text-4xl">🏆</span>
                </motion.div>
                <h2 className="text-lg font-bold mt-3 mb-1">Roadmap Complete!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Amazing! You&apos;ve completed your personalized learning path.
                  {dueTopics.length > 0 && ` Keep your knowledge sharp — ${dueTopics.length} topic${dueTopics.length !== 1 ? 's' : ''} ready for review.`}
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button onClick={() => setView('assessment')} variant="outline" className="gap-2 text-sm">
                    <RotateCcw className="w-4 h-4" /> Re-assess
                  </Button>
                  <Button onClick={() => setView('arena')} className="gap-2 text-sm bg-fire text-cyber-dark hover:bg-fire/90">
                    <Trophy className="w-4 h-4" /> CTF Arena
                  </Button>
                  <Button onClick={() => setView('guru')} className="gap-2 text-sm bg-neon text-cyber-dark hover:bg-neon/90">
                    <Brain className="w-4 h-4" /> Ask Guru
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
