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
  Trophy,
  Brain,
  Send,
  Lightbulb,
  ArrowLeft,
  CheckCircle2,
  Swords,
  Sparkles,
  Flag,
} from 'lucide-react'

export default function Arena() {
  const { currentCTF, setCurrentCTF, submitCTFFlag, sendMessage, setView, user } = useVaathiStore()
  const [flagInput, setFlagInput] = useState('')
  const [result, setResult] = useState<{ correct: boolean; message: string; points?: number; tierChanged?: boolean; newBadges?: Array<{ badgeId: string; name: string; emoji: string }> } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showHint, setShowHint] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!user?.hasApiKey) {
      setResult({ correct: false, message: 'Set up your LLM API key in Profile first!' })
      return
    }
    setIsGenerating(true)
    setResult(null)
    setFlagInput('')
    setShowHint(null)
    await sendMessage('Generate a CTF challenge for me! Create a unique challenge with a flag.')
    // parseStructuredContent runs inside sendMessage after stream completes.
    // Give it time to set currentCTF before stopping the spinner.
    setTimeout(() => {
      setIsGenerating(false)
      const ctf = useVaathiStore.getState().currentCTF
      if (!ctf) {
        setResult({ correct: false, message: 'CTF generation may have failed. Try asking Guru to create one in the chat!' })
      }
    }, 5000)
  }

  const handleSubmit = async () => {
    if (!flagInput.trim()) return
    setIsSubmitting(true)
    const res = await submitCTFFlag(flagInput.trim())
    setResult(res)
    setIsSubmitting(false)
    if (res.correct) {
      setFlagInput('')
    }
  }

  const handleHint = () => {
    if (!currentCTF) return
    if (showHint === null) {
      setShowHint(0)
    } else if (showHint < currentCTF.hints.length - 1) {
      setShowHint(showHint + 1)
    }
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return '#22c55e'
      case 'medium': return '#f59e0b'
      case 'hard': return '#ef4444'
      case 'insane': return '#a855f7'
      default: return '#64748b'
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-fire" />
                CTF Arena
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-generated challenges. Solve them to earn XP!
              </p>
            </div>
          </div>
        </motion.div>

        {!currentCTF ? (
          /* No Active Challenge */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Generate Challenge */}
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-fire/10 flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="w-10 h-10 text-fire" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Ready for a Challenge?</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Ask Guru to generate a unique CTF challenge. Each one is custom-made for your skill level!
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2 bg-fire text-cyber-dark hover:bg-fire/90 font-semibold px-8"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      Generate Challenge
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Previous CTFs */}
            {user && user.completedCTFs.length > 0 && (
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Solved Challenges ({user.completedCTFs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {user.completedCTFs.map((ctf) => (
                      <div key={ctf.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                        <div className="w-8 h-8 rounded-lg bg-fire/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-fire" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{ctf.challengeTitle}</div>
                          <div className="text-xs text-muted-foreground">
                            {ctf.category} &bull; +{ctf.pointsEarned} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          /* Active Challenge */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Challenge Info */}
                <Card className="bg-white/[0.02] border-cyber-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Flag className="w-5 h-5 text-fire" />
                        {currentCTF.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]" style={{ borderColor: difficultyColor(currentCTF.difficulty), color: difficultyColor(currentCTF.difficulty) }}>
                          {currentCTF.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-cyber-border">
                          +{currentCTF.points} XP
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] border-cyber-border">{currentCTF.category}</Badge>
                    </div>
                    <div className="markdown-body text-sm">
                      <ReactMarkdown>{currentCTF.description}</ReactMarkdown>
                    </div>
                    {currentCTF.challenge && (
                      <div className="p-4 rounded-lg bg-cyber-dark border border-cyber-border font-mono text-xs whitespace-pre-wrap break-all">
                        <div className="text-muted-foreground text-[10px] mb-2">CHALLENGE DATA:</div>
                        {currentCTF.challenge}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Hints */}
                <Card className="bg-white/[0.02] border-cyber-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Hints
                      {showHint !== null && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                          {showHint + 1}/{currentCTF.hints.length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showHint !== null && (
                      <div className="space-y-2 mb-3">
                        {currentCTF.hints.slice(0, showHint + 1).map((hint, i) => (
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
                      disabled={showHint !== null && showHint >= currentCTF.hints.length - 1}
                      className="w-full text-xs border-amber-500/20 text-amber-400 hover:bg-amber-500/5"
                    >
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {showHint === null ? 'Show Hint' : showHint >= currentCTF.hints.length - 1 ? 'No more hints' : 'Next Hint'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Flag Submission */}
                <Card className="bg-white/[0.02] border-cyber-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Submit Flag</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result?.correct && (
                      <div className="text-center py-4">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                          <span className="text-4xl">🎉</span>
                        </motion.div>
                        <p className="text-neon font-semibold mt-2">{result.message}</p>
                        {result.points && <p className="text-xs text-muted-foreground">+{result.points} XP!</p>}
                        {result.newBadges && result.newBadges.length > 0 && (
                          <div className="mt-2">
                            {result.newBadges.map((b) => (
                              <Badge key={b.badgeId} variant="outline" className="text-xs mr-1 border-amber-500/30">
                                {b.emoji} {b.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button onClick={() => { setCurrentCTF(null); setResult(null) }} variant="outline" size="sm" className="flex-1 text-xs">
                            New Challenge
                          </Button>
                          <Button onClick={() => setView('dashboard')} size="sm" className="flex-1 text-xs bg-neon text-cyber-dark">
                            Dashboard
                          </Button>
                        </div>
                      </div>
                    )}
                    {result && !result.correct && (
                      <div className="text-center py-4">
                        <span className="text-3xl">🤔</span>
                        <p className="text-destructive font-semibold mt-2">{result.message}</p>
                        <Button onClick={() => { setResult(null); setFlagInput('') }} variant="outline" size="sm" className="mt-3 w-full text-xs">
                          Try Again
                        </Button>
                      </div>
                    )}
                    {!result && (
                      <div className="space-y-2">
                        <Input
                          value={flagInput}
                          onChange={(e) => setFlagInput(e.target.value)}
                          placeholder="FLAG{...}"
                          className="font-mono text-sm bg-white/5 border-cyber-border focus:border-neon"
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <Button
                          onClick={handleSubmit}
                          disabled={!flagInput.trim() || isSubmitting}
                          className="w-full bg-fire text-cyber-dark hover:bg-fire/90 text-xs"
                          size="sm"
                        >
                          {isSubmitting ? 'Checking...' : 'Submit Flag'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ask Guru */}
                <Button
                  variant="ghost"
                  onClick={() => setView('guru')}
                  className="w-full gap-2 text-muted-foreground text-xs"
                >
                  <Brain className="w-4 h-4" />
                  Ask Guru for help
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
