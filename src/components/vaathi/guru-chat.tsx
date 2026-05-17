'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useVaathiStore, LANGUAGES } from '@/store/vaathi-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Brain,
  Send,
  Languages,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Swords,
  Trophy,
  Trash2,
} from 'lucide-react'

export default function GuruChat() {
  const { chatMessages, sendMessage, isStreaming, streamContent, user, setView } = useVaathiStore()
  const [input, setInput] = useState('')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages, streamContent, isStreaming])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }, [input, isStreaming, sendMessage])

  // Quick action buttons
  const quickPrompts = [
    { label: 'Ask me a question', prompt: 'Ask me a cybersecurity question to test my knowledge', icon: MessageSquare },
    { label: 'Generate a lab', prompt: 'Generate a hands-on lab for me to practice', icon: Swords },
    { label: 'Create a CTF challenge', prompt: 'Create a CTF challenge for me to solve', icon: Trophy },
    { label: 'Explain a concept', prompt: 'Explain a cybersecurity concept to me', icon: Lightbulb },
  ]

  const langFlag = LANGUAGES.find((l) => l.code === user?.language)?.flag || '🇬🇧'
  const langLabel = LANGUAGES.find((l) => l.code === user?.language)?.label || 'English'

  // Parse streaming content for lab/CTF detection
  const hasStructuredContent = (content: string) => {
    return /"type"\s*:\s*"(lab|ctf)"/.test(content)
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center glow-green">
              <Brain className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                Guru AI
                {user?.hasApiKey && (
                  <Badge variant="outline" className="text-xs border-neon/30 text-neon bg-neon/5">
                    Online
                  </Badge>
                )}
                {!user?.hasApiKey && (
                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/5">
                    No API Key
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground">
                {langFlag} {langLabel} &bull; Powered by {user?.llmProvider || 'your LLM'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  className="gap-1 border-cyber-border text-xs"
                >
                  <span>{langFlag}</span>
                  <span className="hidden sm:inline">{langLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current language: {langLabel}. Change in Profile.</p>
              </TooltipContent>
            </Tooltip>

            {/* Clear chat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('profile')}
                  className="gap-1 border-cyber-border text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile & LLM Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Chat Area */}
        <Card className="flex-1 bg-white/[0.02] border-cyber-border flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {!user?.hasApiKey && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Set up your LLM to get started</h2>
                <p className="text-muted-foreground text-sm max-w-md mb-4">
                  Guru needs an LLM API key to generate responses. Go to Profile settings to add your API key.
                </p>
                <Button onClick={() => setView('profile')} className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90">
                  <Sparkles className="w-4 h-4" />
                  Set up LLM
                </Button>
              </motion.div>
            )}

            {user?.hasApiKey && chatMessages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-neon/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-neon" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  Hey {user?.name}! I&apos;m <span className="text-neon">Vaathi Guru</span> 🧑‍💻
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Ask me anything about cybersecurity. I&apos;ll teach you in {langLabel}. 
                  I can generate labs, create CTF challenges, and explain concepts!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput(prompt.prompt)
                        inputRef.current?.focus()
                      }}
                      className="text-xs border-cyber-border hover:border-neon/30 hover:text-neon justify-start gap-2 h-auto py-3 px-4"
                    >
                      <prompt.icon className="w-3.5 h-3.5 shrink-0" />
                      {prompt.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
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
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
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

            {/* Streaming indicator */}
            {isStreaming && streamContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-start"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-neon/10 text-neon text-xs">
                    <Brain className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-white/5 border border-cyber-border text-foreground/90">
                  <div className="markdown-body">
                    <ReactMarkdown>{streamContent}</ReactMarkdown>
                  </div>
                  <span className="inline-block w-2 h-4 bg-neon/70 ml-0.5 cursor-blink" />
                  {hasStructuredContent(streamContent) && (
                    <div className="mt-2 p-2 rounded-lg bg-neon/5 border border-neon/20">
                      <p className="text-xs text-neon flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {streamContent.includes('"type":"lab"') ? '🧪 Lab generated! Opening...' : '🏴 CTF generated! Opening...'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Typing indicator (no content yet) */}
            {isStreaming && !streamContent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
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
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Guru anything about cybersecurity..."
                className="flex-1 bg-white/5 border-cyber-border focus:border-neon placeholder:text-muted-foreground/50"
                disabled={isStreaming || !user?.hasApiKey}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isStreaming || !user?.hasApiKey}
                className="bg-neon text-cyber-dark hover:bg-neon/90 glow-green"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            {user?.hasApiKey && (
              <div className="flex flex-wrap gap-1 mt-2">
                {quickPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => {
                      setInput(prompt.prompt)
                      inputRef.current?.focus()
                    }}
                    className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-cyber-border text-muted-foreground hover:text-neon hover:border-neon/30 transition-colors"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
