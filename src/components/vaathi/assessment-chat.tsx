'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Brain, Send, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'

export default function AssessmentChat() {
  const { sendAssessmentMessage, assessmentMessages, assessmentStreaming, assessmentStreamContent, roadmapGenerated, setView, user } = useVaathiStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [assessmentMessages, assessmentStreamContent])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || assessmentStreaming) return
    const msg = input.trim()
    setInput('')
    await sendAssessmentMessage(msg)
  }, [input, assessmentStreaming, sendAssessmentMessage])

  // If roadmap was generated, redirect
  useEffect(() => {
    if (roadmapGenerated && assessmentMessages.length > 2) {
      const timer = setTimeout(() => setView('roadmap'), 1500)
      return () => clearTimeout(timer)
    }
  }, [roadmapGenerated, assessmentMessages.length, setView])

  if (roadmapGenerated) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
            <Sparkles className="w-12 h-12 text-neon mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-bold text-neon mb-2">Generating Your Roadmap...</h2>
          <p className="text-sm text-muted-foreground">Based on your answers, we&apos;re creating a personalized learning path!</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-neon" />
                Skill Assessment
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.name ? `Hey ${user.name}, ` : ''}let&apos;s figure out what you know
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-cyber-border">
            {assessmentMessages.filter((m) => m.role === 'user').length}/8 exchanges
          </span>
        </motion.div>

        {/* Info Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-neon/5 border-neon/20 mb-4">
            <CardContent className="p-3 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-neon shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <strong className="text-neon">How this works:</strong> I&apos;ll ask you nerdy cybersecurity questions. 
                Just explain what you know in your own words — there are no wrong answers. 
                Based on your explanations, I&apos;ll build a personalized learning roadmap just for you.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat */}
        <Card className="flex-1 bg-white/[0.02] border-cyber-border flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {assessmentMessages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                <Brain className="w-12 h-12 text-neon/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click &quot;Start Assessment&quot; to begin</p>
                <Button onClick={() => sendAssessmentMessage('Start')} className="mt-3 gap-2 bg-neon text-cyber-dark hover:bg-neon/90 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Start Assessment
                </Button>
              </motion.div>
            )}

            <AnimatePresence>
              {assessmentMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-neon/10 text-neon text-xs"><Brain className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neon/10 text-foreground border border-neon/20 rounded-br-sm'
                      : 'bg-white/5 text-foreground/90 border border-cyber-border rounded-bl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-white/10 text-xs font-mono">
                        {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming */}
            {assessmentStreaming && assessmentStreamContent && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-start">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-neon/10 text-neon text-xs"><Brain className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-white/5 border border-cyber-border">
                  <div className="whitespace-pre-wrap">{assessmentStreamContent}</div>
                  <span className="inline-block w-2 h-4 bg-neon/70 ml-0.5 cursor-blink" />
                </div>
              </motion.div>
            )}

            {assessmentStreaming && !assessmentStreamContent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-neon/10 text-neon text-xs"><Brain className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-white/5 border border-cyber-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay }} className="w-2 h-2 rounded-full bg-neon/50" />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cyber-border">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Explain what you know..."
                className="flex-1 bg-white/5 border-cyber-border focus:border-neon placeholder:text-muted-foreground/50"
                disabled={assessmentStreaming}
              />
              <Button type="submit" disabled={!input.trim() || assessmentStreaming} className="bg-neon text-cyber-dark hover:bg-neon/90">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
