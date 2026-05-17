'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useVaathiStore } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, BookOpen, Loader2, Sparkles, CheckCircle2,
  XCircle, Brain, Send, Trophy,
} from 'lucide-react'

export default function TopicLearn() {
  const {
    currentTopicId, roadmapTopics, user, setView,
    topicExplanation, topicQuiz, topicLoading,
    loadTopicExplanation, loadTopicQuiz, completeTopic, sendMessage,
  } = useVaathiStore()

  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn')
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'done'>('idle')
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [guruQuestion, setGuruQuestion] = useState('')

  const topic = roadmapTopics.find((t) => t.id === currentTopicId)
  const isCompleted = topic?.status === 'completed'

  useEffect(() => {
    if (currentTopicId) {
      loadTopicExplanation(currentTopicId)
    }
  }, [currentTopicId])

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

  const handleComplete = async () => {
    if (!currentTopicId) return
    setIsCompleting(true)
    await completeTopic(currentTopicId)
    setIsCompleting(false)
  }

  const handleAskGuru = async () => {
    if (!guruQuestion.trim() || !topic) return
    const msg = `I'm learning about "${topic.title}". ${guruQuestion.trim()}`
    setGuruQuestion('')
    await sendMessage(msg)
    setView('guru')
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
              <div className="flex items-center gap-2 mt-1">
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
                {isCompleted && (
                  <Badge className="bg-neon/10 text-neon border border-neon/30 text-[10px] gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-white/[0.03] rounded-xl border border-cyber-border w-fit">
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'learn' ? 'bg-neon/10 text-neon' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5" /> Learn
          </button>
          <button
            onClick={() => { if (activeTab === 'learn' && topicQuiz === null) handleStartQuiz(); setActiveTab('quiz') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'quiz' ? 'bg-neon/10 text-neon' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" /> Quiz
          </button>
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
              {!isCompleted && (
                <Button onClick={handleComplete} disabled={isCompleting} className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90">
                  {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isCompleting ? 'Completing...' : 'Mark as Complete'}
                </Button>
              )}
              <Button onClick={handleStartQuiz} variant="outline" className="gap-2 border-cyber-border">
                <Sparkles className="w-4 h-4" /> Take Quiz
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
                <Card className="bg-white/[0.02] border-cyber-border">
                  <CardContent className="p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <span className="text-4xl">{score === (topicQuiz?.length || 0) ? '🎉' : score >= 2 ? '👍' : '📚'}</span>
                    </motion.div>
                    <h2 className="text-xl font-bold mt-3 mb-1">
                      {score}/{topicQuiz?.length || 0} Correct
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {score === (topicQuiz?.length || 0)
                        ? 'Perfect score! You really know this topic!'
                        : score >= 2
                        ? 'Good job! Review the explanations for the ones you missed.'
                        : 'Keep learning! Go through the explanation again and try once more.'}
                    </p>
                    <div className="flex gap-2 justify-center">
                      {!isCompleted && (
                        <Button onClick={handleComplete} disabled={isCompleting} className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90">
                          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Complete Topic
                        </Button>
                      )}
                      <Button onClick={handleStartQuiz} variant="outline" className="gap-2 border-cyber-border">
                        <Sparkles className="w-4 h-4" /> Retry Quiz
                      </Button>
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
