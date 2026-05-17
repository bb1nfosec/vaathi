'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useVaathiStore, LANGUAGES, LLM_PROVIDERS } from '@/store/vaathi-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Key,
  Languages,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Trash2,
  Brain,
  Trophy,
  Swords,
  Check,
} from 'lucide-react'

export default function Profile() {
  const { user, setView, saveProfile, refreshUser, initSession } = useVaathiStore()
  const [name, setName] = useState(user?.name || '')
  const [language, setLanguage] = useState(user?.language || 'english')
  const [llmProvider, setLlmProvider] = useState(user?.llmProvider || 'groq')
  const [llmApiKey, setLlmApiKey] = useState('')
  const [llmModel, setLlmModel] = useState(user?.llmModel || '')
  const [llmBaseUrl, setLlmBaseUrl] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Derive initial values from user — updated on each render
  const displayName = name || user?.name || ''
  const displayLanguage = language || user?.language || 'english'
  const displayProvider = llmProvider || user?.llmProvider || 'groq'
  const displayModel = llmModel || user?.llmModel || ''

  const currentProvider = LLM_PROVIDERS.find((p) => p.id === displayProvider)
  const models = currentProvider?.models || []

  const handleSave = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    setSaveMsg(null)
    await saveProfile({
      name: name.trim(),
      language,
      llmProvider,
      llmApiKey: llmApiKey.trim(),
      llmModel: llmModel.trim(),
      llmBaseUrl: llmBaseUrl.trim(),
    })
    await refreshUser()
    setIsSaving(false)
    setSaveMsg('Profile saved!')
    setLlmApiKey('')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const handleReset = async () => {
    localStorage.removeItem('vaathi_userId')
    window.location.href = '/'
  }

  if (!user) return null

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Profile & Settings</h1>
        </motion.div>

        <div className="space-y-6">
          {/* User Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-neon" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    value={displayName}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 bg-white/5 border-cyber-border focus:border-neon"
                  />
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={displayLanguage} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-2 bg-white/5 border-cyber-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Guru will teach you in {LANGUAGES.find((l) => l.code === displayLanguage)?.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* LLM Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  LLM Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Status */}
                <div className="flex items-center gap-2">
                  {user.hasApiKey ? (
                    <Badge className="bg-neon/10 text-neon border border-neon/30 gap-1">
                      <Check className="w-3 h-3" />
                      API Key Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 gap-1">
                      <Key className="w-3 h-3" />
                      No API Key — Please add one
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>LLM Provider</Label>
                  <Select value={displayProvider} onValueChange={(val) => {
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
                  <Label htmlFor="profile-api-key">API Key</Label>
                  <div className="relative mt-2">
                    <Input
                      id="profile-api-key"
                      type={showKey ? 'text' : 'password'}
                      value={llmApiKey}
                      onChange={(e) => setLlmApiKey(e.target.value)}
                      placeholder={user.hasApiKey ? 'Leave blank to keep current key' : 'Enter your API key...'}
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
                      Ollama runs locally — no API key needed.
                    </p>
                  )}
                  {llmProvider === 'groq' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Get a free API key at <span className="text-neon">console.groq.com</span>
                    </p>
                  )}
                </div>

                {llmProvider === 'custom' && (
                  <div>
                    <Label htmlFor="profile-base-url">Custom Base URL</Label>
                    <Input
                      id="profile-base-url"
                      type="url"
                      value={llmBaseUrl}
                      onChange={(e) => setLlmBaseUrl(e.target.value)}
                      placeholder="https://your-provider.com/v1"
                      className="mt-2 bg-white/5 border-cyber-border focus:border-neon"
                    />
                  </div>
                )}

                <div>
                  <Label>Model</Label>
                  {models.length > 0 ? (
                    <Select value={displayModel} onValueChange={setLlmModel}>
                      <SelectTrigger className="mt-2 bg-white/5 border-cyber-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      placeholder="Enter model name..."
                      className="mt-2 bg-white/5 border-cyber-border focus:border-neon font-mono text-sm"
                    />
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="w-full gap-2 bg-neon text-cyber-dark hover:bg-neon/90"
                >
                  {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
                </Button>
                {saveMsg && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-neon">
                    {saveMsg}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-cyber-border">
                    <div className="text-xl font-bold text-neon">{user.xp}</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-cyber-border">
                    <div className="text-xl font-bold text-amber-400">Lv.{user.level}</div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-cyber-border">
                    <div className="text-xl font-bold text-ice">{user.completedLabs.length}</div>
                    <div className="text-xs text-muted-foreground">Labs Done</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-cyber-border">
                    <div className="text-xl font-bold text-fire">{user.completedCTFs.length}</div>
                    <div className="text-xs text-muted-foreground">CTFs Solved</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          {user.badges.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Badges ({user.badges.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {user.badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center p-3 rounded-lg bg-white/[0.02] border border-cyber-border">
                        <span className="text-2xl">{badge.emoji}</span>
                        <span className="text-[10px] text-center mt-1 text-foreground/80">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Completed Labs */}
          {user.completedLabs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Swords className="w-4 h-4 text-ice" />
                    Completed Labs ({user.completedLabs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {user.completedLabs.map((lab) => (
                      <div key={lab.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                        <span className="text-sm">🧪</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{lab.labTitle}</div>
                          <div className="text-xs text-muted-foreground">+{lab.xpEarned} XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Completed CTFs */}
          {user.completedCTFs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-white/[0.02] border-cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-fire" />
                    Solved CTFs ({user.completedCTFs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {user.completedCTFs.map((ctf) => (
                      <div key={ctf.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                        <span className="text-sm">🏴</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{ctf.challengeTitle}</div>
                          <div className="text-xs text-muted-foreground">{ctf.category} &bull; +{ctf.pointsEarned} XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Separator className="bg-cyber-border" />

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  This will clear all your progress, badges, and chat history. This cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset All Progress
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account data including all badges, completed labs, CTFs, and chat history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset} className="bg-destructive text-white hover:bg-destructive/90">
                        Yes, reset everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
