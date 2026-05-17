'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVaathiStore, TIER_CONFIG } from '@/store/vaathi-store'
import { assessmentQuestions } from '@/lib/vaathi-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react'
import type { TierType } from '@/store/vaathi-store'

export default function Assessment() {
  const { completeAssessment } = useVaathiStore()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [name, setName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [calculatedTier, setCalculatedTier] = useState<TierType>('egg')
  const [score, setScore] = useState(0)

  const totalQuestions = assessmentQuestions.length
  const progress = ((currentQ + 1) / totalQuestions) * 100
  const question = assessmentQuestions[currentQ]

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const handleNext = () => {
    if (selectedOption === null) return

    const newAnswers = { ...answers, [currentQ]: selectedOption }
    setAnswers(newAnswers)

    if (currentQ < totalQuestions - 1) {
      setCurrentQ(currentQ + 1)
      setSelectedOption(newAnswers[currentQ + 1] ?? null)
    } else {
      // Calculate score and tier
      let s = 0
      assessmentQuestions.forEach((q, i) => {
        if (newAnswers[i] === q.correct) s++
      })
      setScore(s)

      let tier: TierType = 'egg'
      if (s >= 9) tier = 'burn'
      else if (s >= 7) tier = 'soar'
      else if (s >= 5) tier = 'fly'
      else if (s >= 3) tier = 'hatch'

      setCalculatedTier(tier)
      setShowNameInput(true)
    }
  }

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
      setSelectedOption(answers[currentQ - 1] ?? null)
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    completeAssessment(answers, calculatedTier, name.trim())
  }

  const tierConfig = TIER_CONFIG[calculatedTier]

  // Name input screen
  if (showNameInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 grid-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/[0.03] border-cyber-border glow-green">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  {tierConfig.emoji}
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
                <p className="text-muted-foreground">
                  Score: <span className="text-neon font-bold">{score}/{totalQuestions}</span>
                </p>
              </div>

              <Badge
                className="mb-6 text-base px-4 py-2"
                style={{
                  backgroundColor: `${tierConfig.color}20`,
                  color: tierConfig.color,
                  borderColor: tierConfig.color,
                }}
                variant="outline"
              >
                Tier: {tierConfig.emoji} {tierConfig.label}
              </Badge>

              <p className="text-sm text-muted-foreground mb-6">{tierConfig.desc}</p>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-sm font-medium mb-2 block">What should Guru call you?</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="bg-white/5 border-cyber-border focus:border-neon"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="w-full bg-neon text-cyber-dark hover:bg-neon/90 font-semibold glow-green-strong"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  See My Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-24 grid-bg">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Badge variant="outline" className="mb-3 border-neon/30 text-neon bg-neon/5 gap-2">
            <Shield className="w-3.5 h-3.5" />
            Skill Assessment
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Find Your <span className="text-neon">Starting Point</span>
          </h1>
          <p className="text-muted-foreground">
            10 questions &bull; No wrong answers &bull; Takes about 2 minutes
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono">
              Question {currentQ + 1} of {totalQuestions}
            </span>
            <span className="text-xs text-neon font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/[0.03] border-cyber-border mb-6">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 mb-6">
                  <span className="text-neon font-mono font-bold text-sm mt-0.5">
                    {String(currentQ + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold leading-relaxed">
                    {question.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {question.options.map((option, i) => {
                    const isSelected = selectedOption === i
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelect(i)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? 'border-neon bg-neon/10 text-neon'
                            : 'border-cyber-border bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-foreground/80'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                            isSelected
                              ? 'bg-neon text-cyber-dark'
                              : 'bg-white/5 text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm sm:text-base">{option}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto text-neon" />}
                      </motion.button>
                    )
                  })}
                </div>

                <div className="mt-2">
                  <Badge variant="outline" className="text-xs border-cyber-border text-muted-foreground">
                    {question.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQ === 0}
            className="border-cyber-border gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {assessmentQuestions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentQ
                    ? 'bg-neon'
                    : i < currentQ
                    ? 'bg-neon/40'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="bg-neon text-cyber-dark hover:bg-neon/90 gap-2 glow-green"
          >
            {currentQ === totalQuestions - 1 ? (
              <>
                <Zap className="w-4 h-4" />
                Finish
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
