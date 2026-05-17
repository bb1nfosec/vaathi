'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import { labs, difficultyColors } from '@/lib/vaathi-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Terminal,
  Lightbulb,
  Flag,
  CheckCircle2,
  ChevronRight,
  Clock,
  Zap,
  Brain,
  AlertTriangle,
  X,
  Trophy,
} from 'lucide-react'

export default function LabDetail() {
  const { selectedLab, goBack, completeLab, useHint, user, labProgress, updateLabStep } = useVaathiStore()
  const [flagInput, setFlagInput] = useState('')
  const [flagCorrect, setFlagCorrect] = useState(false)
  const [flagWrong, setFlagWrong] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [labComplete, setLabComplete] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [showDebrief, setShowDebrief] = useState(false)

  const lab = labs.find((l) => l.id === selectedLab)

  useEffect(() => {
    if (lab) {
      const progress = labProgress[lab.id]
      if (progress) {
        setCurrentStep(progress.currentStep)
        setCurrentHint(progress.hintsUsed)
      }
    }
  }, [lab, labProgress])

  useEffect(() => {
    if (lab && currentStep > 0) {
      const newLines = lab.steps.slice(0, currentStep).map((step, i) => ({
        text: `$ guru: ${step}`,
        color: i === currentStep - 1 ? 'text-neon' : 'text-foreground/60',
      }))
      setTerminalLines(newLines.map((l) => l.text))
    }
  }, [lab, currentStep])

  if (!lab) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p>Lab not found</p>
      </div>
    )
  }

  const progress = lab ? (currentStep / lab.steps.length) * 100 : 0
  const isCompleted = user.completedLabs.includes(lab.id)
  const currentStepData = lab.steps[currentStep]

  const handleNextStep = () => {
    if (currentStep < lab.steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      updateLabStep(lab.id, nextStep)
      setShowHint(false)
      setFlagWrong(false)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowHint(false)
      setFlagWrong(false)
    }
  }

  const handleHint = () => {
    if (currentHint < lab.hints.length) {
      setShowHint(true)
      setCurrentHint(currentHint + 1)
      useHint(lab.id)
    }
  }

  const handleSubmitFlag = () => {
    if (flagInput.trim().toUpperCase() === lab.flag.toUpperCase()) {
      setFlagCorrect(true)
      setLabComplete(true)
      if (!isCompleted) {
        completeLab(lab.id, lab.xpReward)
      }
    } else {
      setFlagWrong(true)
      setTimeout(() => setFlagWrong(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: difficultyColors[lab.difficulty],
                  color: difficultyColors[lab.difficulty],
                }}
              >
                {lab.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs border-cyber-border text-muted-foreground">
                {lab.category}
              </Badge>
              {isCompleted && (
                <Badge variant="outline" className="text-xs border-neon/30 text-neon bg-neon/5 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{lab.title}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {lab.duration}m
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-neon">
            <Zap className="w-4 h-4" />
            {lab.xpReward} XP
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {lab.steps.length}
            </span>
            <span className="text-xs text-neon font-mono">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Terminal Area */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0d0d14] border-cyber-border overflow-hidden scanline">
              <CardHeader className="p-3 border-b border-cyber-border">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-neon" />
                  <CardTitle className="text-sm font-mono text-muted-foreground">
                    vaathi-lab:{lab.id}$
                  </CardTitle>
                  <div className="flex gap-1 ml-auto">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[400px]">
                  <div className="font-mono text-sm space-y-2">
                    {/* Lab intro */}
                    <div className="text-cyan-400">
                      ╔══════════════════════════════════════════╗
                    </div>
                    <div className="text-cyan-400">
                      ║ VAATHI LAB: {lab.title.padEnd(30)}║
                    </div>
                    <div className="text-cyan-400">
                      ╚══════════════════════════════════════════╝
                    </div>
                    <div className="text-muted-foreground mt-4">
                      {lab.description}
                    </div>
                    <div className="text-foreground/40 mt-4">---</div>

                    {/* Steps */}
                    <AnimatePresence>
                      {lab.steps.slice(0, currentStep + 1).map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className={`flex items-start gap-2 ${i === currentStep ? 'text-neon' : 'text-foreground/50'}`}>
                            <span className="text-neon/60 shrink-0">
                              {i === currentStep ? '>' : '✓'}
                            </span>
                            <span className={i === currentStep ? '' : 'line-through'}>
                              {step}
                            </span>
                          </div>
                          {i < currentStep && <div className="h-1" />}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Cursor */}
                    {!labComplete && (
                      <div className="flex items-center gap-2 text-neon/70">
                        <span>$</span>
                        <span className="cursor-blink">_</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Lab Complete */}
                {labComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 rounded-lg bg-neon/10 border border-neon/30 text-center"
                  >
                    <Trophy className="w-8 h-8 text-neon mx-auto mb-2" />
                    <h3 className="font-bold text-neon text-lg">Lab Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Flag captured: <code className="text-neon font-mono">{lab.flag}</code>
                    </p>
                    <p className="text-sm text-neon font-mono mt-1">+{lab.xpReward} XP earned!</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="border-cyber-border"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNextStep}
                disabled={currentStep >= lab.steps.length - 1}
                className="bg-neon text-cyber-dark hover:bg-neon/90 glow-green flex-1"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={handleHint}
                disabled={currentHint >= lab.hints.length}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Hint (-25 XP)</span>
                <span className="sm:hidden">Hint</span>
              </Button>

              {!labComplete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDebrief(!showDebrief)}
                  className="border-cyber-border text-muted-foreground"
                >
                  Debrief
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Guru AI Sidebar */}
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-neon" />
                  Guru AI — Step {currentStep + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-foreground/70 leading-relaxed">
                  {currentStep < lab.steps.length && (
                    <>
                      <p className="mb-3">
                        <span className="text-neon font-medium">Current task:</span> Follow the instructions in the terminal carefully. Take your time to understand what&apos;s happening at each step.
                      </p>
                      <p className="text-muted-foreground">
                        If you&apos;re stuck, use the hint button below the terminal. Each hint costs 25 XP but saves you time!
                      </p>
                    </>
                  )}
                </div>

                {/* Hint Display */}
                <AnimatePresence>
                  {showHint && currentHint > 0 && lab.hints[currentHint - 1] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                        <Lightbulb className="w-3 h-3" />
                        Hint {currentHint}
                      </div>
                      <p className="text-xs text-foreground/80">{lab.hints[currentHint - 1]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Flag Submission */}
            {!labComplete && (
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4 text-neon" />
                    Submit Flag
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmitFlag()
                    }}
                  >
                    <Input
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="FLAG{...}"
                      className={`mb-3 bg-white/5 border-cyber-border font-mono text-sm focus:border-neon ${
                        flagWrong ? 'border-destructive' : flagCorrect ? 'border-neon' : ''
                      }`}
                    />
                    {flagWrong && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs text-destructive mb-3"
                      >
                        <X className="w-3 h-3" />
                        Incorrect flag. Try again!
                      </motion.div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-neon text-cyber-dark hover:bg-neon/90 font-semibold glow-green"
                      disabled={!flagInput.trim()}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Debrief */}
            <AnimatePresence>
              {showDebrief && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card className="bg-white/[0.02] border-cyber-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        What Did I Just Do?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-xs text-foreground/70 leading-relaxed">
                        <p className="mb-2">
                          This lab demonstrates a real-world cybersecurity technique. In this exercise, you learned how {lab.category.toLowerCase()} vulnerabilities work in practice.
                        </p>
                        <p className="text-muted-foreground">
                          Understanding these techniques is essential for ethical hackers. Remember — always get proper authorization before testing any system!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lab Steps Overview */}
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Lab Steps</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-1">
                  {lab.steps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                        i === currentStep
                          ? 'bg-neon/5 text-neon'
                          : i < currentStep
                          ? 'text-foreground/40'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-mono ${
                          i < currentStep
                            ? 'bg-neon/10 text-neon'
                            : i === currentStep
                            ? 'bg-neon/20 text-neon'
                            : 'bg-white/5 text-muted-foreground'
                        }`}
                      >
                        {i < currentStep ? '✓' : i + 1}
                      </div>
                      <span className="truncate">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
