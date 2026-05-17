'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useVaathiStore } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Swords,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Send,
  Brain,
  Copy,
  Check,
} from 'lucide-react'

export default function LabSession() {
  const { currentLab, completeLab, setView, sendMessage } = useVaathiStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]))
  const [showHint, setShowHint] = useState<number | null>(null)
  const [hintIndex, setHintIndex] = useState(0)
  const [flagInput, setFlagInput] = useState('')
  const [flagSubmitted, setFlagSubmitted] = useState(false)
  const [flagCorrect, setFlagCorrect] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [helpMessage, setHelpMessage] = useState('')

  if (!currentLab) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Card className="bg-white/[0.02] border-cyber-border">
          <CardContent className="p-8 text-center">
            <Swords className="w-12 h-12 text-ice mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Active Lab</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Go to Guru Chat and ask to generate a lab!
            </p>
            <Button onClick={() => setView('guru')} className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90">
              <Brain className="w-4 h-4" />
              Go to Guru
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lab = currentLab

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopiedCmd(cmd)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  const handleHint = () => {
    if (showHint === null) {
      setShowHint(0)
      setHintIndex(0)
    } else if (hintIndex < lab.hints.length - 1) {
      setHintIndex(hintIndex + 1)
      setShowHint(hintIndex + 1)
    }
  }

  const handleFlagSubmit = () => {
    if (!flagInput.trim()) return
    const isCorrect = flagInput.trim().toLowerCase() === lab.flag.toLowerCase()
    setFlagCorrect(isCorrect)
    setFlagSubmitted(true)

    if (isCorrect) {
      setIsCompleting(true)
      completeLab(showHint !== null ? showHint + 1 : 0).finally(() => {
        setIsCompleting(false)
      })
    }
  }

  const handleAskGuru = async () => {
    if (!helpMessage.trim()) return
    const msg = helpMessage.trim()
    setHelpMessage('')
    await sendMessage(`I'm working on a lab called "${lab.title}". My question: ${msg}`)
  }

  const difficultyColor = lab.difficulty === 'beginner' ? '#22c55e' : lab.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444'

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('guru')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                🧪 {lab.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{ borderColor: difficultyColor, color: difficultyColor }}
                >
                  {lab.difficulty}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-cyber-border">
                  +{lab.xpReward} XP
                </Badge>
              </div>
            </div>
          </div>
          {flagCorrect && (
            <div className="flex items-center gap-2 text-neon">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-semibold">Completed!</span>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Scenario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="markdown-body text-sm">
                    <ReactMarkdown>{lab.scenario || lab.description}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Steps */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Steps ({lab.steps.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lab.steps.map((step, i) => {
                      const isExpanded = expandedSteps.has(i)
                      const isComplete = i < currentStep
                      const isCurrent = i === currentStep

                      return (
                        <div key={i}>
                          <button
                            onClick={() => toggleStep(i)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                              isCurrent ? 'bg-neon/5 border border-neon/20' :
                              isComplete ? 'bg-white/[0.02] border border-cyber-border' :
                              'bg-white/[0.01] border border-transparent hover:border-cyber-border'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono ${
                              isComplete ? 'bg-neon text-cyber-dark' :
                              isCurrent ? 'bg-neon/20 text-neon' :
                              'bg-white/5 text-muted-foreground'
                            }`}>
                              {isComplete ? <Check className="w-3 h-3" /> : i + 1}
                            </div>
                            <span className={`text-sm font-medium flex-1 ${
                              isCurrent ? 'text-neon' : isComplete ? 'text-foreground/60' : ''
                            }`}>
                              {step.title}
                            </span>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                          </button>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="pl-9 pr-3 py-3 space-y-2"
                            >
                              {step.command && (
                                <div className="flex items-center gap-2 p-2 rounded-md bg-cyber-dark border border-cyber-border font-mono text-xs">
                                  <span className="text-neon select-none">$</span>
                                  <code className="flex-1 text-foreground/80 break-all">{step.command}</code>
                                  <button
                                    onClick={() => copyCommand(step.command)}
                                    className="shrink-0 text-muted-foreground hover:text-neon"
                                  >
                                    {copiedCmd === step.command ? <Check className="w-3.5 h-3.5 text-neon" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}
                              {step.explanation && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{step.explanation}</p>
                              )}
                              {!isComplete && isCurrent && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setCurrentStep(i + 1); setExpandedSteps((prev) => new Set(prev).add(i + 1)) }}
                                  className="mt-2 text-xs border-neon/30 text-neon hover:bg-neon/5"
                                >
                                  Done — Next Step
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Hints */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Hints
                    {showHint !== null && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                        {showHint + 1}/{lab.hints.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showHint !== null && (
                    <div className="space-y-2 mb-3">
                      {lab.hints.slice(0, showHint + 1).map((hint, i) => (
                        <div key={i} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-foreground/80">
                          💡 {hint}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHint}
                    disabled={showHint !== null && hintIndex >= lab.hints.length - 1}
                    className="w-full text-xs border-amber-500/20 text-amber-400 hover:bg-amber-500/5"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {showHint === null ? 'Show Hint (-10 XP)' : hintIndex < lab.hints.length - 1 ? 'Next Hint' : 'No more hints'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Flag Submission */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Flag Submission</CardTitle>
                </CardHeader>
                <CardContent>
                  {flagSubmitted && flagCorrect && (
                    <div className="text-center py-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <span className="text-4xl">🎉</span>
                      </motion.div>
                      <p className="text-neon font-semibold mt-2">Correct!</p>
                      <p className="text-xs text-muted-foreground">+{lab.xpReward} XP earned!</p>
                      <Button onClick={() => setView('dashboard')} className="mt-3 w-full bg-neon text-cyber-dark hover:bg-neon/90 text-xs" size="sm">
                        Back to Dashboard
                      </Button>
                    </div>
                  )}
                  {flagSubmitted && !flagCorrect && (
                    <div className="text-center py-4">
                      <span className="text-3xl">🤔</span>
                      <p className="text-destructive font-semibold mt-2">Incorrect!</p>
                      <p className="text-xs text-muted-foreground mb-3">Try again or use a hint.</p>
                      <Button onClick={() => { setFlagSubmitted(false); setFlagInput('') }} variant="outline" size="sm" className="w-full text-xs">
                        Try Again
                      </Button>
                    </div>
                  )}
                  {!flagSubmitted && (
                    <div className="space-y-2">
                      <Input
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        placeholder="FLAG{...}"
                        className="font-mono text-sm bg-white/5 border-cyber-border focus:border-neon"
                        onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit()}
                      />
                      <Button
                        onClick={handleFlagSubmit}
                        disabled={!flagInput.trim() || isCompleting}
                        className="w-full bg-neon text-cyber-dark hover:bg-neon/90 text-xs"
                        size="sm"
                      >
                        {isCompleting ? 'Verifying...' : 'Submit Flag'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Ask Guru */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-neon" />
                    Ask Guru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleAskGuru() }} className="flex gap-2">
                    <Input
                      value={helpMessage}
                      onChange={(e) => setHelpMessage(e.target.value)}
                      placeholder="Stuck? Ask Guru..."
                      className="flex-1 text-xs bg-white/5 border-cyber-border focus:border-neon"
                    />
                    <Button type="submit" size="sm" className="bg-neon text-cyber-dark hover:bg-neon/90">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('guru')}
                    className="w-full text-xs text-muted-foreground mt-2"
                  >
                    Open full chat →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
