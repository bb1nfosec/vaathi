'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import { guruResponses } from '@/lib/vaathi-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Brain,
  Send,
  Languages,
  TreePine,
  Lightbulb,
  Sparkles,
  Code2,
  MessageSquare,
} from 'lucide-react'

export default function GuruChat() {
  const { chat, sendMessage, addGuruMessage, setChatLanguage, user } = useVaathiStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMemoryTree, setShowMemoryTree] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chat.messages, isTyping])

  const findResponse = (message: string): string => {
    const lower = message.toLowerCase().trim()
    for (const [key, value] of Object.entries(guruResponses)) {
      if (key !== 'default' && lower.includes(key)) {
        return value
      }
    }
    // Check for partial matches
    if (lower.includes('sql') || lower.includes('injection')) return guruResponses['what is sql injection']
    if (lower.includes('xss') || lower.includes('cross-site')) return guruResponses['what is xss']
    if (lower.includes('arp') || lower.includes('spoof')) return guruResponses['what is arp spoofing']
    if (lower.includes('buffer') || lower.includes('overflow')) return guruResponses['what is buffer overflow']
    if (lower.includes('crypto') || lower.includes('encrypt')) return guruResponses['what is cryptography']
    if (lower.includes('start') || lower.includes('begin') || lower.includes('how to')) return guruResponses['how to start ethical hacking']
    return guruResponses['default']
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const message = input.trim()
    setInput('')
    sendMessage(message)
    setIsTyping(true)

    // Simulate Guru thinking
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

    const response = findResponse(message)
    let finalResponse = response

    // Language adaptation
    if (chat.language === 'hindi') {
      finalResponse = `*[Hindi Mode]*\n\n${response}\n\n_— Guru (yeh explanation aapke liye Hindi context mein hai)_`
    } else if (chat.language === 'tamil') {
      finalResponse = `*[Tamil Mode]*\n\n${response}\n\n_— Guru (ithu ungalukku Tamil context-l irukku)_`
    }

    addGuruMessage(finalResponse)
    setIsTyping(false)
  }

  const quickPrompts = [
    'What is SQL injection?',
    'How to start ethical hacking?',
    'What is XSS?',
    'Explain ARP spoofing',
  ]

  const memoryTopics = [
    { topic: 'SQL Injection', status: 'discussed', color: '#22c55e' },
    { topic: 'Networking Basics', status: 'discussed', color: '#22c55e' },
    { topic: 'XSS Attacks', status: 'discussed', color: '#22c55e' },
    { topic: 'Buffer Overflow', status: 'practiced', color: '#06b6d4' },
    { topic: 'RSA Encryption', status: 'learning', color: '#f59e0b' },
    { topic: 'Privilege Escalation', status: 'locked', color: '#64748b' },
    { topic: 'Malware Analysis', status: 'locked', color: '#64748b' },
    { topic: 'Reverse Engineering', status: 'locked', color: '#64748b' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center glow-green">
              <Brain className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                Guru AI
                <Badge variant="outline" className="text-xs border-neon/30 text-neon bg-neon/5">
                  Online
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Your personal cybersecurity mentor &bull; Explains like a senior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-cyber-border">
              {(['english', 'hindi', 'tamil'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatLanguage(lang)}
                  className={`text-xs px-3 h-7 capitalize ${
                    chat.language === lang ? 'bg-neon/10 text-neon' : 'text-muted-foreground'
                  }`}
                >
                  {lang}
                </Button>
              ))}
              <Languages className="w-3 h-3 text-muted-foreground mr-1" />
            </div>

            {/* Memory Tree Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMemoryTree(!showMemoryTree)}
              className={`gap-2 border-cyber-border ${showMemoryTree ? 'text-neon bg-neon/5 border-neon/30' : ''}`}
            >
              <TreePine className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Memory</span>
            </Button>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Chat Area */}
          <Card className={`flex-1 bg-white/[0.02] border-cyber-border flex flex-col ${showMemoryTree ? '' : 'w-full'}`}>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-neon" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    Hey {user.name}! I&apos;m <span className="text-neon">Guru</span>
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md mb-6">
                    Ask me anything about cybersecurity. I explain things like that one brilliant
                    college senior who actually makes sense. No question is too basic!
                  </p>

                  {/* Quick Prompts */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(prompt)
                        }}
                        className="text-xs border-cyber-border hover:border-neon/30 hover:text-neon"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {chat.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'guru' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-neon/10 text-neon text-xs">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-neon/10 text-foreground border border-neon/20 rounded-br-sm'
                          : 'bg-white/5 text-foreground/90 border border-cyber-border rounded-bl-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-white/10 text-xs font-mono">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 items-start"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-neon/10 text-neon text-xs">
                      <Brain className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white/5 border border-cyber-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-neon/50"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 rounded-full bg-neon/50"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 rounded-full bg-neon/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cyber-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Guru anything about cybersecurity..."
                  className="flex-1 bg-white/5 border-cyber-border focus:border-neon placeholder:text-muted-foreground/50"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-neon text-cyber-dark hover:bg-neon/90 glow-green"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Memory Tree Sidebar */}
          <AnimatePresence>
            {showMemoryTree && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden shrink-0"
              >
                <Card className="h-full bg-white/[0.02] border-cyber-border w-[280px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-neon" />
                      Memory Tree
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {memoryTopics.map((topic, i) => (
                        <motion.div
                          key={topic.topic}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-cyber-border"
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: topic.color }}
                          />
                          <span className={`text-xs flex-1 ${
                            topic.status === 'locked' ? 'text-muted-foreground' : 'text-foreground/80'
                          }`}>
                            {topic.topic}
                          </span>
                          {topic.status === 'locked' && (
                            <span className="text-[10px] text-muted-foreground">🔒</span>
                          )}
                          {topic.status === 'discussed' && (
                            <Lightbulb className="w-3 h-3 text-neon" />
                          )}
                          {topic.status === 'practiced' && (
                            <Code2 className="w-3 h-3 text-cyan-400" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
