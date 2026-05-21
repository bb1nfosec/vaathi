'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { COMMANDS, COMMAND_HELP } from '@/lib/terminal-commands'
import { X, Trash2, Terminal as TerminalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TerminalLine {
  id: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
}

interface TerminalProps {
  topic: string
  domain?: string
  onClose: () => void
}

// Parse ANSI color codes to JSX spans
function AnsiText({ text }: { text: string }) {
  const parts: Array<{ text: string; className: string }> = []
  const ansiRegex = /\x1b\[(\d+)m(.*?)\x1b\[0m/g
  let lastIndex = 0
  let match

  while ((match = ansiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), className: '' })
    }
    const code = parseInt(match[1])
    const colorClass = code === 32 ? 'text-green-400' :
      code === 36 ? 'text-cyan-400' :
      code === 31 ? 'text-red-400' :
      code === 33 ? 'text-yellow-400' :
      code === 1 ? 'font-bold' :
      code === 2 ? 'text-muted-foreground' : ''
    parts.push({ text: match[2], className: colorClass })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), className: '' })
  }

  if (parts.length === 0) {
    return <span>{text}</span>
  }

  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className={p.className || undefined}>{p.text}</span>
      ))}
    </>
  )
}

export default function Terminal({ topic, domain, onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '0',
      type: 'system',
      content: `Vaathi Terminal Sandbox v1.0 — Topic: ${topic}`,
    },
    {
      id: '1',
      type: 'system',
      content: '⚠️  Simulated environment — outputs are educational approximations',
    },
    {
      id: '2',
      type: 'system',
      content: 'Type "help" to see available commands.',
    },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    setLines((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), type, content },
    ])
  }, [])

  const processCommand = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    // Add to history
    setHistory((h) => [trimmed, ...h.slice(0, 49)])
    setHistoryIndex(-1)

    // Show the command in terminal
    addLine('input', trimmed)

    // Parse command and args
    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    // Handle clear specially
    if (cmd === 'clear') {
      setLines([])
      return
    }

    // Handle exit/quit
    if (cmd === 'exit' || cmd === 'quit') {
      onClose()
      return
    }

    // Look up command
    const commandFn = COMMANDS[cmd]
    if (!commandFn) {
      // Check if it's close to a known command
      const knownCmds = Object.keys(COMMANDS)
      const similar = knownCmds.find((c) => c.startsWith(cmd.slice(0, 2)))
      const suggestion = similar ? ` Did you mean "${similar}"?` : ''
      addLine('error', `bash: ${cmd}: command not found.${suggestion} Type "help" for available commands.`)
      return
    }

    const output = commandFn(args, { topic, domain: domain || 'general' })

    // Check if it's a clear screen escape
    if (output === '\x1b[2J\x1b[H') {
      setLines([])
      return
    }

    if (output) {
      // Split multi-line output into separate lines for better rendering
      const outputLines = output.split('\n')
      for (const line of outputLines) {
        addLine('output', line)
      }
    }
  }, [topic, domain, addLine, onClose])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(newIndex)
      setInput(history[newIndex] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setInput(newIndex === -1 ? '' : history[newIndex] || '')
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Tab completion
      const cmds = Object.keys(COMMANDS)
      const match = cmds.find((c) => c.startsWith(input))
      if (match) setInput(match)
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const handleClear = () => setLines([])

  const lineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-green-300'
      case 'error': return 'text-red-400'
      case 'system': return 'text-cyan-400/80 italic'
      default: return 'text-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col bg-black border border-green-900/40 rounded-xl overflow-hidden shadow-2xl"
      style={{ fontFamily: 'monospace', minHeight: '400px', maxHeight: '520px' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-green-900/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-green-500/70" />
          <span className="text-xs text-green-400/60 font-mono">vaathi@sandbox:~$</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="w-6 h-6 text-gray-500 hover:text-gray-300"
            title="Clear terminal"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-6 h-6 text-gray-500 hover:text-red-400"
            title="Close terminal"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-3 text-xs space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#166534 transparent' }}>
        {lines.map((line) => (
          <div key={line.id} className={`leading-relaxed whitespace-pre-wrap break-all ${lineClass(line.type)}`}>
            {line.type === 'input' ? (
              <span>
                <span className="text-green-500 select-none">$ </span>
                <AnsiText text={line.content} />
              </span>
            ) : (
              <AnsiText text={line.content} />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <div className="flex items-center px-3 py-2 border-t border-green-900/20 bg-black/50">
        <span className="text-green-500 text-xs font-mono mr-2 select-none shrink-0">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-green-200 text-xs font-mono outline-none caret-green-400 placeholder:text-green-900"
          placeholder="type a command..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {/* Command reference strip */}
      <div className="px-3 py-1.5 border-t border-green-900/20 bg-gray-950/50">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(COMMAND_HELP).slice(0, 8).map(([cmd]) => (
            <button
              key={cmd}
              onClick={() => {
                setInput(cmd + ' ')
                inputRef.current?.focus()
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/20 text-green-500/70 hover:bg-green-900/40 hover:text-green-400 transition-colors font-mono"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
