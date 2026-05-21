'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useVaathiStore, MicroTaskData, TaskEvaluation } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft, BookOpen, Loader2, Sparkles, CheckCircle2,
  XCircle, Brain, Send, Trophy, Zap, Code, Terminal,
  FileSearch, Shield, MessageCircle, Lightbulb, RotateCcw, RefreshCw,
} from 'lucide-react'

const TASK_ICONS: Record<string, React.ReactNode> = {
  'code-analysis': <Code className="w-4 h-4" />,
  'command-challenge': <Terminal className="w-4 h-4" />,
  'decode-encode': <Zap className="w-4 h-4" />,
  'scenario-response': <Shield className="w-4 h-4" />,
  'log-analysis': <FileSearch className="w-4 h-4" />,
  'concept-explain': <MessageCircle className="w-4 h-4" />,
}

const TASK_COLORS: Record<string, string> = {
  'code-analysis': '#ef4444',
  'command-challenge': '#22c55e',
  'decode-encode': '#a855f7',
  'scenario-response': '#f59e0b',
  'log-analysis': '#06b6d4',
  'concept-explain': '#ec4899',
}

const TASK_LABELS: Record<string, string> = {
  'code-analysis': 'Code Analysis',
  'command-challenge': 'Command Challenge',
  'decode-encode': 'Decode / Encode',
  'scenario-response': 'Scenario',
  'log-analysis': 'Log Analysis',
  'concept-explain': 'Explain Concept',
}

export default function TopicLearn() {
  const {
    currentTopicId, roadmapTopics, user, setView,
    topicExplanation, topicQuiz, topicLoading,
    loadTopicExplanation, loadTopicQuiz, completeTopic, reviewTopic, sendMessage,
    currentMicroTask, microTaskLoading, microTaskAnswer, microTaskEvaluation,
    microTaskEvaluating, microTasksCompleted,
    loadMicroTask, evaluateMicroTask, setMicroTaskAnswer, clearMicroTask,
    reviewMode, setReviewMode,
  } = useVaathiStore()

  // In review mode, start on the quiz tab to force active recall
  const [activeTab, setActiveTab] = useState<'learn' | 'tasks' | 'quiz'>(reviewMode ? 'quiz' : 'learn')
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'done'>('idle')
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [guruQuestion, setGuruQuestion] = useState('')
  const [showHint, setShowHint] = useState(false)

  const topic = roadmapTopics.find((t) => t.id === currentTopicId)
  const isCompleted = topic?.status === 'completed'

  useEffect(() => {
    if (currentTopicId) {
      if (reviewMode) {
        setActiveTab('quiz')
        loadTopicQuiz(currentTopicId)
        setQuizState('active')
        setCurrentQ(0)
        setScore(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        setActiveTab('learn')
        loadTopicExplanation(currentTopicId)
      }
    }
  }, [currentTopicId, reviewMode])

  const handleStartQuiz = () => {
    if (currentTopicId) {
      loadTopicQuiz(currentTopicId)
      setQuizState('active')
      setCurrentQ(0)
      setScore(0)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setActiveTab('quiz')
    }
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    if (topicQuiz && topicQuiz[currentQ] && index === topicQuiz[currentQ].correctIndex) {
      setScore((s) => s + 1)
    }
    setShowExplanation(true)
  }

  const handleNextQ = () => {
    if (topicQuiz && currentQ < topicQuiz.length - 1) {
      setCurrentQ((q) => q + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizState('done')
    }
  }

  // Map 0-3 correct answers → SM-2 quality 0-5
  const quizScoreToSM2 = (correct: number, total: number): number => {
    const ratio = total > 0 ? correct / total : 0
    if (ratio === 1) return 5       // all correct
    if (ratio >= 0.67) return 4     // 2/3
    if (ratio >= 0.33) return 2     // 1/3 — incorrect, below threshold
    return 1                        // 0/3
  }

  const handleComplete = async (sm2Quality?: number) => {
    if (!currentTopicId) return
    setIsCompleting(true)
    await completeTopic(currentTopicId, sm2Quality)
    setIsCompleting(false)
  }

  const handleSubmitReview = async () => {
    if (!currentTopicId) return
    setIsCompleting(true)
    const quality = quizScoreToSM2(score, topicQuiz?.length ?? 3)
    const result = await reviewTopic(currentTopicId, quality)
    setIsCompleting(false)
    setReviewMode(false)
    setView('roadmap')
    // Brief toast-like feedback could be added here if desired
    void result
  }

  const handleAskGuru = async () => {
    if (!guruQuestion.trim() || !topic) return
    const msg = `I'm learning about "${topic.title}". ${guruQuestion.trim()}`
    setGuruQuestion('')
    await sendMessage(msg)
    setView('guru')
  }

  const handleSubmitTask = async () => {
    if (!currentTopicId || microTaskEvaluating) return
    await evaluateMicroTask(currentTopicId)
  }

  const handleNextTask = async () => {
    if (!currentTopicId) return
    clearMicroTask()
    setShowHint(false)
    await loadMicroTask(currentTopicId)
  }

  if (!topic) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <Card className="bg-white/[0.02] border-cyber-border">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-neon mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Topic Selected</h2>
            <Button onClick={() => setView('roadmap')} className="mt-3 bg-neon text-cyber-dark hover:bg-neon/90 gap-2">
              Go to Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const domainColors: Record<string, string> = {
    networking: '#10b981', linux: '#f59e0b', web: '#06b6d4',
    crypto: '#a855f7', recon: '#ec4899', defense: '#ef4444', general: '#64748b',
  }
  const domainColor = domainColors[topic.domain] || '#64748b'

  const taskColor = currentMicroTask ? (TASK_COLORS[currentMicroTask.type] || '#64748b') : '#64748b'
  const taskIcon = currentMicroTask ? (TASK_ICONS[currentMicroTask.type] || <Zap className="w-4 h-4" />) : null

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('roadmap')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{topic.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: domainColor, color: domainColor }}>
                  {topic.domain}
                </Badge>
                <Badge variant="outline" className="text-[10px]" style={{
                  borderColor: topic.difficulty === 'beginner' ? '#22c55e' : topic.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444',
                  color: topic.difficulty === 'beginner' ? '#22c55e' : topic.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444',
                }}>
                  {topic.difficulty}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-neon/30 text-neon">+{topic.xpReward} XP</Badge>
                {reviewMode ? (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                    <RefreshCw className="w-3 h-3" /> Review Mode
                  </Badge>
                ) : isCompleted ? (
                  <Badge className="bg-neon/10 text-neon border border-neon/30 text-[10px] gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </Badge>
                ) : null}
                {microTasksCompleted > 0 && (
                  <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400 gap-1">
                    <Zap className="w-3 h-3" /> {microTasksCompleted} tasks done
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-white/[0.03] rounded-xl border border-cyber-border w-fit">
          {[
            { id: 'learn' as const, label: 'Learn', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'tasks' as const, label: 'Tasks', icon: <Zap className="w-3.5 h-3.5" />, badge: microTasksCompleted > 0 ? microTasksCompleted : undefined },
            { id: 'quiz' as const, label: 'Quiz', icon: <Sparkles className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'quiz' && topicQuiz === null) handleStartQuiz()
                setActiveTab(tab.id)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id ? 'bg-neon/10 text-neon' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">AI Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                {topicLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating explanation...
                  </div>
                ) : topicExplanation ? (
                  <div className="markdown-body text-sm">
                    <ReactMarkdown>{topicExplanation}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Could not load explanation.</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {!isCompleted && !reviewMode && (
                <Button onClick={handleComplete} disabled={isCompleting} className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90">
                  {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isCompleting ? 'Completing...' : 'Mark as Complete'}
                </Button>
              )}
              <Button onClick={handleStartQuiz} variant="outline" className="gap-2 border-cyber-border">
                <Sparkles className="w-4 h-4" /> Take Quiz
              </Button>
              <Button onClick={() => { setActiveTab('tasks') }} variant="outline" className="gap-2 border-cyber-border text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/5">
                <Zap className="w-4 h-4" /> Practice Tasks
              </Button>
              <Button onClick={() => setView('guru')} variant="outline" className="gap-2 border-cyber-border">
                <Brain className="w-4 h-4" /> Ask Guru
              </Button>
            </div>

            {/* Ask Guru inline */}
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-neon" /> Confused? Ask Guru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAskGuru() }} className="flex gap-2">
                  <input
                    value={guruQuestion}
                    onChange={(e) => setGuruQuestion(e.target.value)}
                    placeholder={`Ask about "${topic.title}"...`}
                    className="flex-1 bg-white/5 border border-cyber-border rounded-lg px-3 py-2 text-sm focus:border-neon focus:outline-none text-foreground placeholder:text-muted-foreground/50"
                  />
                  <Button type="submit" size="sm" className="bg-neon text-cyber-dark hover:bg-neon/90">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {!currentMicroTask && !microTaskLoading && (
              <Card className="bg-gradient-to-br from-cyan-500/5 to-neon/5 border-cyan-500/20">
                <CardContent className="p-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-xl font-bold mb-2">Hands-on Micro Tasks</h2>
                  <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
                    Tiny focused exercises generated by AI. No VMs needed — just your brain and terminal.
                    Each task takes 2-5 minutes.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {Object.entries(TASK_LABELS).map(([key, label]) => (
                      <span key={key} className="text-[10px] px-2 py-1 rounded-full border border-cyber-border text-muted-foreground">
                        {label}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => currentTopicId && loadMicroTask(currentTopicId)}
                    className="gap-2 bg-cyan-500 text-cyber-dark hover:bg-cyan-400"
                  >
                    <Zap className="w-4 h-4" /> Generate a Task
                  </Button>
                  {microTasksCompleted > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">
                      You&apos;ve completed {microTasksCompleted} task{microTasksCompleted !== 1 ? 's' : ''} for this topic!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {microTaskLoading && (
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-400" />
                  <p className="text-sm">Guru is crafting a micro-task for you...</p>
                </CardContent>
              </Card>
            )}

            {currentMicroTask && !microTaskLoading && (
              <AnimatePresence mode="wait">
                <motion.div key={currentMicroTask.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Task Header */}
                  <Card className="bg-white/[0.02] border-cyber-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${taskColor}15`, color: taskColor }}>
                            {taskIcon}
                          </div>
                          <div>
                            <CardTitle className="text-sm">{currentMicroTask.title}</CardTitle>
                            <Badge variant="outline" className="text-[9px] mt-0.5" style={{ borderColor: taskColor, color: taskColor }}>
                              {TASK_LABELS[currentMicroTask.type] || currentMicroTask.type}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-neon/30 text-neon">
                          +{currentMicroTask.xpReward || 25} XP
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-foreground/80">{currentMicroTask.description}</p>

                      {/* Content */}
                      <div className="p-4 rounded-xl bg-black/30 border border-cyber-border font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                        {currentMicroTask.content}
                      </div>

                      {/* Hint */}
                      {!microTaskEvaluation && (
                        <div>
                          {!showHint ? (
                            <button
                              onClick={() => setShowHint(true)}
                              className="text-xs text-muted-foreground hover:text-amber-400 flex items-center gap-1 transition-colors"
                            >
                              <Lightbulb className="w-3.5 h-3.5" /> Stuck? Show hint
                            </button>
                          ) : (
                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/80">
                              <Lightbulb className="w-3.5 h-3.5 inline mr-1" />
                              {currentMicroTask.hint}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Answer Input */}
                      {!microTaskEvaluation && (
                        <div className="space-y-3">
                          <Textarea
                            value={microTaskAnswer}
                            onChange={(e) => setMicroTaskAnswer(e.target.value)}
                            placeholder="Type your answer here... Explain your thinking!"
                            rows={4}
                            className="bg-white/5 border-cyber-border focus:border-cyan-500 placeholder:text-muted-foreground/50 text-sm resize-none"
                            disabled={microTaskEvaluating}
                          />
                          <Button
                            onClick={handleSubmitTask}
                            disabled={!microTaskAnswer.trim() || microTaskEvaluating}
                            className="w-full gap-2 bg-cyan-500 text-cyber-dark hover:bg-cyan-400"
                          >
                            {microTaskEvaluating ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                            ) : (
                              <><Send className="w-4 h-4" /> Submit Answer</>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Evaluation Result */}
                      {microTaskEvaluation && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                          <div className={`p-4 rounded-xl border ${
                            microTaskEvaluation.correct
                              ? 'bg-neon/5 border-neon/30'
                              : 'bg-destructive/5 border-destructive/30'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {microTaskEvaluation.correct ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5 text-neon" />
                                  <span className="font-semibold text-neon">
                                    {microTaskEvaluation.score === 'perfect' ? 'Perfect!' : 'Correct!'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 text-destructive" />
                                  <span className="font-semibold text-destructive">
                                    {microTaskEvaluation.score === 'partial' ? 'Almost there!' : 'Not quite right'}
                                  </span>
                                </>
                              )}
                              <Badge variant="outline" className="text-[10px] ml-auto border-cyber-border capitalize">
                                {microTaskEvaluation.score}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground/80">{microTaskEvaluation.feedback}</p>
                          </div>

                          {/* Full Explanation */}
                          <Card className="bg-white/[0.02] border-cyber-border">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground">
                                <BookOpen className="w-3.5 h-3.5" /> Explanation
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-foreground/80 leading-relaxed">{microTaskEvaluation.explanation}</p>
                            </CardContent>
                          </Card>

                          {/* Next Task */}
                          <Button
                            onClick={handleNextTask}
                            className="w-full gap-2 bg-cyan-500 text-cyber-dark hover:bg-cyan-400"
                          >
                            <RotateCcw className="w-4 h-4" /> Next Task
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {quizState === 'idle' && (
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-neon mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Ready to Test Your Knowledge?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    3 questions generated by AI about {topic.title}
                  </p>
                  <Button onClick={handleStartQuiz} className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90">
                    <Sparkles className="w-4 h-4" /> Start Quiz
                  </Button>
                </CardContent>
              </Card>
            )}

            {quizState === 'active' && topicQuiz && topicQuiz[currentQ] && (
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs border-cyber-border">
                      Question {currentQ + 1}/{topicQuiz.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-neon/30 text-neon">
                      Score: {score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-base font-medium">{topicQuiz[currentQ].question}</h3>
                  <div className="space-y-2">
                    {topicQuiz[currentQ].options.map((option, i) => {
                      const isSelected = selectedAnswer === i
                      const isCorrect = i === topicQuiz[currentQ].correctIndex
                      const showResult = selectedAnswer !== null

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-3 rounded-lg text-left text-sm transition-all border ${
                            showResult && isCorrect
                              ? 'bg-neon/10 border-neon/50 text-neon'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-destructive/10 border-destructive/50 text-destructive'
                              : isSelected
                              ? 'bg-white/5 border-neon/30'
                              : 'bg-white/[0.02] border-cyber-border hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-neon shrink-0" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                            <span>{option}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {showExplanation && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="p-3 rounded-lg bg-white/5 border border-cyber-border text-xs text-foreground/80 leading-relaxed">
                        <strong className="text-neon">Explanation:</strong> {topicQuiz[currentQ].explanation}
                      </div>
                      <Button onClick={handleNextQ} className="w-full mt-3 bg-neon text-cyber-dark hover:bg-neon/90 text-sm">
                        {currentQ < topicQuiz.length - 1 ? 'Next Question' : 'See Results'}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {quizState === 'done' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className={`border-cyber-border ${reviewMode ? 'bg-amber-500/5' : 'bg-white/[0.02]'}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <span className="text-4xl">{score === (topicQuiz?.length || 0) ? '🎉' : score >= 2 ? '👍' : '📚'}</span>
                    </motion.div>
                    <h2 className="text-xl font-bold mt-3 mb-1">
                      {score}/{topicQuiz?.length || 0} Correct
                    </h2>
                    {reviewMode && (
                      <p className="text-xs text-amber-400 font-medium mb-1">
                        {score === (topicQuiz?.length || 0)
                          ? 'Perfect recall! Next review in ~6 days.'
                          : score >= 2
                          ? 'Good recall. Next review in a few days.'
                          : 'Needs work — review scheduled for tomorrow.'}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-4">
                      {score === (topicQuiz?.length || 0)
                        ? 'Perfect score! You really know this topic!'
                        : score >= 2
                        ? 'Good job! Review the explanations for the ones you missed.'
                        : 'Keep learning! Go through the explanation again and try once more.'}
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {reviewMode ? (
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isCompleting}
                          className="gap-2 bg-amber-500 text-cyber-dark hover:bg-amber-400"
                        >
                          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          {isCompleting ? 'Saving...' : 'Submit Review'}
                        </Button>
                      ) : !isCompleted ? (
                        <Button
                          onClick={() => handleComplete(quizScoreToSM2(score, topicQuiz?.length ?? 3))}
                          disabled={isCompleting}
                          className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90"
                        >
                          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Complete Topic
                        </Button>
                      ) : null}
                      {!reviewMode && (
                        <>
                          <Button onClick={handleStartQuiz} variant="outline" className="gap-2 border-cyber-border">
                            <Sparkles className="w-4 h-4" /> Retry Quiz
                          </Button>
                          <Button onClick={() => setActiveTab('tasks')} variant="outline" className="gap-2 border-cyan-500/30 text-cyan-400">
                            <Zap className="w-4 h-4" /> Practice Tasks
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
