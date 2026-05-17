'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVaathiStore, LANGUAGES, LLM_PROVIDERS } from '@/store/vaathi-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, Shield, Sparkles } from 'lucide-react'

export default function Onboarding() {
  const { saveProfile, setView } = useVaathiStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('english')
  const [llmProvider, setLlmProvider] = useState('groq')
  const [llmApiKey, setLlmApiKey] = useState('')
  const [llmModel, setLlmModel] = useState('llama-3.3-70b-versatile')
  const [llmBaseUrl, setLlmBaseUrl] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [setupError, setSetupError] = useState('')

  const currentProvider = LLM_PROVIDERS.find((p) => p.id === llmProvider)
  const models = currentProvider?.models || []

  const canProceed = () => {
    if (step === 0) return name.trim().length >= 2
    if (step === 1) return true
    if (step === 2) return llmApiKey.trim().length > 0 || llmProvider === 'ollama'
    if (step === 3) return llmModel.trim().length > 0
    return true
  }

  const handleNext = () => {
    setSetupError('')
    if (step < 3 && canProceed()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setSetupError('')
    if (step > 0) setStep(step - 1)
  }

  const handleFinish = async () => {
    if (!canProceed()) return
    setIsSaving(true)
    setSetupError('')

    try {
      const id = await saveProfile({
        name: name.trim(),
        language,
        llmProvider,
        llmApiKey: llmProvider === 'ollama' ? '' : llmApiKey.trim(),
        llmModel: llmModel.trim(),
        llmBaseUrl: llmBaseUrl.trim(),
      })

      setIsSaving(false)

      if (id) {
        setView('dashboard')
      } else {
        setSetupError('No response from server. Check your connection and try again.')
      }
    } catch (err) {
      setIsSaving(false)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setSetupError(msg)
    }
  }

  const steps = [
    { title: 'What\'s your name?', icon: '👋' },
    { title: 'Choose your language', icon: '🌍' },
    { title: 'Set up your LLM', icon: '🤖' },
    { title: 'Pick your model', icon: '⚡' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-bg">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-neon/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < step
                    ? 'bg-neon text-cyber-dark'
                    : i === step
                    ? 'bg-neon/20 text-neon border border-neon/50'
                    : 'bg-white/5 text-muted-foreground border border-cyber-border'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : s.icon}
              </div>
              {i < 3 && (
                <div className={`w-8 sm:w-12 h-0.5 rounded-full ${i < step ? 'bg-neon/50' : 'bg-cyber-border'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white/[0.02] border-cyber-border glow-green">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{steps[step].title}</CardTitle>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
          </CardHeader>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: step > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step > 0 ? -20 : 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 0: Name */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-5xl mb-4"
                      >
                        👋
                      </motion.div>
                      <p className="text-muted-foreground">
                        Hey there, future hacker! What should Guru call you?
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name..."
                        className="mt-2 bg-white/5 border-cyber-border focus:border-neon"
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Step 1: Language */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-5xl mb-4"
                      >
                        🌍
                      </motion.div>
                      <p className="text-muted-foreground">
                        Guru will teach cybersecurity in your preferred language!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                            language === lang.code
                              ? 'border-neon bg-neon/10 glow-green'
                              : 'border-cyber-border bg-white/[0.02] hover:border-white/20'
                          }`}
                        >
                          <div className="text-2xl mb-1">{lang.flag}</div>
                          <div className={`text-sm font-medium ${language === lang.code ? 'text-neon' : ''}`}>
                            {lang.label}
                          </div>
                          {language === lang.code && (
                            <Check className="w-4 h-4 text-neon mx-auto mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: LLM Provider & API Key */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-5xl mb-4"
                      >
                        🤖
                      </motion.div>
                      <p className="text-muted-foreground">
                        Choose your LLM provider and enter your API key.
                      </p>
                      <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-400 bg-amber-500/5">
                        💡 Groq offers free API keys!
                      </Badge>
                    </div>

                    <div>
                      <Label>LLM Provider</Label>
                      <Select value={llmProvider} onValueChange={(val) => {
                        setLlmProvider(val)
                        const provider = LLM_PROVIDERS.find((p) => p.id === val)
                        if (provider && provider.models.length > 0) {
                          setLlmModel(provider.models[0])
                        }
                      }}>
                        <SelectTrigger className="mt-2 bg-white/5 border-cyber-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LLM_PROVIDERS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <div className="relative mt-2">
                        <Input
                          id="apiKey"
                          type={showKey ? 'text' : 'password'}
                          value={llmApiKey}
                          onChange={(e) => setLlmApiKey(e.target.value)}
                          placeholder={llmProvider === 'ollama' ? 'Not needed for Ollama' : 'sk-... or gsk_...'}
                          className="bg-white/5 border-cyber-border focus:border-neon pr-10"
                          disabled={llmProvider === 'ollama'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {llmProvider === 'ollama' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ollama runs locally — no API key needed. Make sure Ollama is running on your machine.
                        </p>
                      )}
                    </div>

                    {llmProvider === 'custom' && (
                      <div>
                        <Label htmlFor="baseUrl">Custom Base URL</Label>
                        <Input
                          id="baseUrl"
                          type="url"
                          value={llmBaseUrl}
                          onChange={(e) => setLlmBaseUrl(e.target.value)}
                          placeholder="https://your-provider.com/v1"
                          className="mt-2 bg-white/5 border-cyber-border focus:border-neon"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Model Selection */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-5xl mb-4"
                      >
                        ⚡
                      </motion.div>
                      <p className="text-muted-foreground">
                        Pick the model you want to power your Guru.
                      </p>
                    </div>

                    {models.length > 0 ? (
                      <div className="space-y-2">
                        {models.map((model) => (
                          <button
                            key={model}
                            onClick={() => setLlmModel(model)}
                            className={`w-full p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                              llmModel === model
                                ? 'border-neon bg-neon/10 glow-green'
                                : 'border-cyber-border bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-mono text-sm font-medium ${llmModel === model ? 'text-neon' : ''}`}>
                                {model}
                              </span>
                              {llmModel === model && <Check className="w-4 h-4 text-neon" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="customModel">Model Name</Label>
                        <Input
                          id="customModel"
                          value={llmModel}
                          onChange={(e) => setLlmModel(e.target.value)}
                          placeholder="Enter your model name..."
                          className="mt-2 bg-white/5 border-cyber-border focus:border-neon font-mono"
                        />
                      </div>
                    )}

                    {/* Summary */}
                    <Card className="bg-white/[0.02] border-cyber-border mt-4">
                      <CardContent className="p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Language</span>
                            <span className="font-medium">{LANGUAGES.find((l) => l.code === language)?.flag} {language}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider</span>
                            <span className="font-medium">{currentProvider?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model</span>
                            <span className="font-mono text-xs">{llmModel}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className={step === 0 ? 'invisible' : 'gap-2'}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!canProceed() || isSaving}
                  className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90 font-semibold"
                >
                  {isSaving ? (
                    'Setting up...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Start Hacking!
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Error message */}
            {setupError && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                ⚠️ {setupError}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
