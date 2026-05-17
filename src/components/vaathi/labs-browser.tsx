'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import { labs, labCategories, difficultyColors } from '@/lib/vaathi-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Filter,
  Clock,
  Zap,
  CheckCircle2,
  Lock,
  Swords,
  Globe,
  Terminal,
  Shield,
  Key,
  Bug,
  Landmark,
} from 'lucide-react'
import type { Lab } from '@/lib/vaathi-data'

const categoryIcons: Record<string, typeof Terminal> = {
  All: Swords,
  Networking: Globe,
  'Web Hacking': Terminal,
  Linux: Terminal,
  Cryptography: Key,
  Malware: Bug,
  'Indian Context': Landmark,
}

export default function LabsBrowser() {
  const { user, selectLab } = useVaathiStore()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null)

  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      const matchesCategory = activeCategory === 'All' || lab.category === activeCategory
      const matchesSearch =
        !search ||
        lab.title.toLowerCase().includes(search.toLowerCase()) ||
        lab.description.toLowerCase().includes(search.toLowerCase())
      const matchesDifficulty = !difficultyFilter || lab.difficulty === difficultyFilter
      return matchesCategory && matchesSearch && matchesDifficulty
    })
  }, [activeCategory, search, difficultyFilter])

  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-neon">Labs</span> &bull; Hands-On Sandboxes
          </h1>
          <p className="text-muted-foreground">
            Browser-based hacking environments. No setup. Open a lab, start hacking.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search labs..."
              className="pl-10 bg-white/5 border-cyber-border focus:border-neon"
            />
          </div>
          <div className="flex gap-2">
            {['Easy', 'Medium', 'Hard', 'Expert'].map((diff) => (
              <Button
                key={diff}
                variant={difficultyFilter === diff ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
                className={
                  difficultyFilter === diff
                    ? 'text-cyber-dark'
                    : 'border-cyber-border text-muted-foreground hover:text-foreground'
                }
                style={
                  difficultyFilter === diff
                    ? { backgroundColor: difficultyColors[diff] }
                    : undefined
                }
              >
                {diff}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
        >
          {labCategories.map((cat) => {
            const Icon = categoryIcons[cat.name] || Shield
            return (
              <Button
                key={cat.name}
                variant={activeCategory === cat.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.name)}
                className={`shrink-0 gap-2 ${
                  activeCategory === cat.name
                    ? 'bg-neon text-cyber-dark hover:bg-neon/90'
                    : 'border-cyber-border text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Button>
            )
          })}
        </motion.div>

        {/* Lab Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLabs.map((lab, i) => {
            const isCompleted = user.completedLabs.includes(lab.id)
            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`bg-white/[0.02] border-cyber-border hover:border-white/10 transition-all cursor-pointer group hover:-translate-y-0.5 h-full ${
                    isCompleted ? 'opacity-70' : ''
                  }`}
                  onClick={() => selectLab(lab.id)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Top */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold"
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
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-neon shrink-0" />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold mb-2 group-hover:text-neon transition-colors">
                      {lab.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                      {lab.description}
                    </p>

                    {/* Bottom */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-cyber-border">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lab.duration}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {lab.xpReward} XP
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-neon transition-colors">
                        {isCompleted ? 'Replay' : 'Start'} →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {filteredLabs.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No labs found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-cyber-border flex items-center justify-center gap-8 text-sm"
        >
          <span className="text-muted-foreground">
            {labs.length} Total Labs
          </span>
          <span className="text-neon">
            {user.completedLabs.length} Completed
          </span>
          <span className="text-cyan-400">
            {labs.length - user.completedLabs.length} Remaining
          </span>
        </motion.div>
      </div>
    </div>
  )
}
