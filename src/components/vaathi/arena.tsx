'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useVaathiStore, TIER_CONFIG } from '@/store/vaathi-store'
import { ctfChallenges, leaderboard, difficultyColors } from '@/lib/vaathi-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Trophy,
  Users,
  Swords,
  Flag,
  Clock,
  Zap,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Search,
  MapPin,
  Award,
  Shield,
} from 'lucide-react'

export default function Arena() {
  const { user, submitCTFFlag } = useVaathiStore()
  const [activeTab, setActiveTab] = useState('challenges')
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [searchCTF, setSearchCTF] = useState('')
  const [flagInput, setFlagInput] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [submitResults, setSubmitResults] = useState<Record<string, string>>({})

  const filteredCTFs = ctfChallenges.filter((ctf) => {
    const matchesSearch = !searchCTF || ctf.title.toLowerCase().includes(searchCTF.toLowerCase())
    const matchesDifficulty = !filterDifficulty || ctf.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const handleFlagSubmit = async (ctfId: string) => {
    const input = flagInput[ctfId]?.trim()
    if (!input || submitting) return
    setSubmitting(ctfId)
    setSubmitResults((prev) => ({ ...prev, [ctfId]: '' }))
    const result = await submitCTFFlag(ctfId, input)
    setSubmitResults((prev) => ({ ...prev, [ctfId]: result.message }))
    if (result.correct) {
      setFlagInput((prev) => ({ ...prev, [ctfId]: '' }))
    }
    setSubmitting(null)
  }

  const userRank = leaderboard.findIndex((e) => e.points <= user.xp) + 1 || leaderboard.length + 1

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-amber-400">Arena</span> &bull; Prove Yourself
          </h1>
          <p className="text-muted-foreground">
            CTF challenges, national leaderboard, team competitions. Show India what you&apos;ve got.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Trophy, label: 'Your Rank', value: `#${userRank}`, color: '#f59e0b' },
            { icon: Flag, label: 'CTFs Solved', value: user.completedCTFs.length.toString(), color: '#22c55e' },
            { icon: Users, label: 'Your Points', value: (user.xp).toLocaleString(), color: '#06b6d4' },
            { icon: Medal, label: 'Your Tier', value: TIER_CONFIG[user.tier].emoji + ' ' + TIER_CONFIG[user.tier].label, color: TIER_CONFIG[user.tier].color },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/[0.02] border-cyber-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-cyber-border mb-6">
            <TabsTrigger value="challenges" className="gap-2 data-[state=active]:bg-neon/10 data-[state=active]:text-neon">
              <Swords className="w-4 h-4" />
              CTF Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2 data-[state=active]:bg-neon/10 data-[state=active]:text-neon">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2 data-[state=active]:bg-neon/10 data-[state=active]:text-neon">
              <Users className="w-4 h-4" />
              Team Mode
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 data-[state=active]:bg-neon/10 data-[state=active]:text-neon">
              <Award className="w-4 h-4" />
              Certificates
            </TabsTrigger>
          </TabsList>

          {/* CTF Challenges */}
          <TabsContent value="challenges">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchCTF}
                  onChange={(e) => setSearchCTF(e.target.value)}
                  placeholder="Search challenges..."
                  className="pl-10 bg-white/5 border-cyber-border focus:border-neon"
                />
              </div>
              <div className="flex gap-2">
                {['Easy', 'Medium', 'Hard', 'Expert'].map((diff) => (
                  <Button
                    key={diff}
                    variant={filterDifficulty === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterDifficulty(filterDifficulty === diff ? null : diff)}
                    className={
                      filterDifficulty === diff
                        ? 'text-cyber-dark'
                        : 'border-cyber-border text-muted-foreground'
                    }
                    style={filterDifficulty === diff ? { backgroundColor: difficultyColors[diff] } : undefined}
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCTFs.map((ctf, i) => {
                const isSolved = user.completedCTFs.includes(ctf.id)
                const resultMsg = submitResults[ctf.id]
                const isSubmitting = submitting === ctf.id
                return (
                  <motion.div key={ctf.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`bg-white/[0.02] border-cyber-border hover:border-white/10 transition-all ${
                      isSolved ? 'border-neon/30' : ''
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs" style={{ borderColor: difficultyColors[ctf.difficulty], color: difficultyColors[ctf.difficulty] }}>
                              {ctf.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-cyber-border text-muted-foreground">
                              {ctf.category}
                            </Badge>
                          </div>
                          {isSolved && (
                            <Badge variant="outline" className="text-xs border-neon/30 text-neon bg-neon/5 gap-1">
                              <Flag className="w-3 h-3" /> Solved
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold mb-2">{ctf.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ctf.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{ctf.points} pts</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ctf.timeRemaining}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ctf.participants}</span>
                        </div>

                        {!isSolved && (
                          <>
                            <div className="flex gap-2">
                              <Input value={flagInput[ctf.id] || ''} onChange={(e) => setFlagInput({ ...flagInput, [ctf.id]: e.target.value })}
                                placeholder="Enter flag..." className="flex-1 bg-white/5 border-cyber-border text-xs font-mono focus:border-neon" />
                              <Button size="sm" onClick={() => handleFlagSubmit(ctf.id)} disabled={!flagInput[ctf.id]?.trim() || isSubmitting}
                                className="bg-neon text-cyber-dark hover:bg-neon/90 text-xs glow-green">
                                {isSubmitting ? '...' : <><Flag className="w-3 h-3 mr-1" />Submit</>}
                              </Button>
                            </div>
                            {resultMsg && (
                              <p className={`text-xs mt-2 ${resultMsg.includes('Incorrect') ? 'text-destructive' : 'text-neon'}`}>{resultMsg}</p>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  National Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ScrollArea className="h-[600px]">
                  {/* Top 3 */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {leaderboard.slice(0, 3).map((entry, i) => {
                      const tierConf = TIER_CONFIG[entry.tier as keyof typeof TIER_CONFIG]
                      const medals = ['#fbbf24', '#94a3b8', '#cd7f32']
                      return (
                        <motion.div
                          key={entry.rank}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`text-center p-4 rounded-xl border ${
                            i === 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/[0.02] border-cyber-border'
                          }`}
                        >
                          <div className="text-2xl mb-2">{i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'}</div>
                          <Avatar className="w-12 h-12 mx-auto mb-2 border-2" style={{ borderColor: medals[i] }}>
                            <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: `${medals[i]}20`, color: medals[i] }}>
                              {entry.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-sm">{entry.name}</h3>
                          <p className="text-xs text-muted-foreground">{entry.college}</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{entry.state}</span>
                          </div>
                          <div className="mt-2 font-mono font-bold" style={{ color: medals[i] }}>
                            {entry.points.toLocaleString()} pts
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px]"
                            style={{ borderColor: tierConf?.color, color: tierConf?.color }}
                          >
                            {tierConf?.emoji} {tierConf?.label}
                          </Badge>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Rest of leaderboard */}
                  <div className="space-y-2">
                    {leaderboard.slice(3).map((entry, i) => {
                      const tierConf = TIER_CONFIG[entry.tier as keyof typeof TIER_CONFIG]
                      return (
                        <motion.div
                          key={entry.rank}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-cyber-border hover:border-white/10 transition-colors"
                        >
                          <span className="w-8 text-center font-mono font-bold text-muted-foreground">
                            #{entry.rank}
                          </span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-white/5 text-xs">{entry.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{entry.name}</div>
                            <div className="text-xs text-muted-foreground">{entry.college} &bull; {entry.state}</div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                            style={{ borderColor: tierConf?.color, color: tierConf?.color }}
                          >
                            {tierConf?.emoji}
                          </Badge>
                          <span className="font-mono font-bold text-sm text-foreground/80 shrink-0">
                            {entry.points.toLocaleString()}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Your position */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-3 rounded-lg bg-neon/5 border border-neon/30 flex items-center gap-4"
                  >
                    <span className="w-8 text-center font-mono font-bold text-neon">#{userRank}</span>
                    <Avatar className="w-8 h-8 border border-neon/30">
                      <AvatarFallback className="bg-neon/10 text-neon text-xs font-bold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neon">{user.name} (You)</div>
                      <div className="text-xs text-muted-foreground">Keep going to climb the ranks!</div>
                    </div>
                    <span className="font-mono font-bold text-sm text-neon">
                      {user.xp.toLocaleString()}
                    </span>
                  </motion.div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Mode */}
          <TabsContent value="teams">
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Team Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Form Your College Team</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Team up with your college mates to compete in CTF challenges. Team scores are aggregated from individual performances.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                    {[
                      { name: 'NullByte Warriors', college: 'IIT Bombay', members: 5, points: 12500 },
                      { name: 'CyberSquad', college: 'NIT Trichy', members: 4, points: 10800 },
                      { name: 'HackTheNorth', college: 'IIIT Delhi', members: 6, points: 9200 },
                    ].map((team) => (
                      <div key={team.name} className="p-4 rounded-lg bg-white/[0.02] border border-cyber-border text-left">
                        <h4 className="font-semibold text-sm">{team.name}</h4>
                        <p className="text-xs text-muted-foreground">{team.college}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{team.members} members</span>
                          <span className="text-neon font-mono">{team.points.toLocaleString()} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-neon text-cyber-dark hover:bg-neon/90 glow-green">
                    Create Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates">
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Certificate NFTs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {user.certificates.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.certificates.map((cert, i) => (
                      <div key={i} className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-center">
                        <Award className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                        <h3 className="font-semibold">{cert}</h3>
                        <p className="text-xs text-muted-foreground mt-1">On-chain verified</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      Complete labs and CTF challenges to earn on-chain certificate NFTs. These are verifiable proof of your cybersecurity skills — huge for the Indian job market!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        'Complete 5 Labs',
                        'Solve 3 CTFs',
                        'Reach Fly Tier',
                        'Win a Team CTF',
                      ].map((req) => (
                        <Badge key={req} variant="outline" className="text-xs border-cyber-border text-muted-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
