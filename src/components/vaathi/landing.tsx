'use client'

import { motion } from 'framer-motion'
import { useVaathiStore } from '@/store/vaathi-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TIER_CONFIG } from '@/store/vaathi-store'
import {
  Shield,
  Brain,
  Swords,
  Trophy,
  Globe,
  Wifi,
  WifiOff,
  Users,
  GitBranch,
  Lock,
  Zap,
  ChevronRight,
  ArrowRight,
  DollarSign,
  GraduationCap,
  Building2,
  Briefcase,
  TrendingUp,
  Star,
  MessageSquare,
  BookOpen,
  Terminal,
  Container,
  Cpu,
  Database,
  Key,
  Mic,
  Code2,
} from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export default function LandingPage() {
  const { setView } = useVaathiStore()

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 grid-bg">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <Badge variant="outline" className="mb-6 border-neon/30 text-neon bg-neon/5 gap-2">
              <Shield className="w-3.5 h-3.5" />
              Open Source &bull; Free Forever &bull; Made in India
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6"
          >
            <span className="text-neon glow-text">VAATHI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground/80 mb-4"
          >
            India&apos;s Open Source Cybersecurity Learning OS
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            From zero to ethical hacker — in your language, at your pace, on your machine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90 font-semibold text-base px-8 py-6 glow-green-strong"
              onClick={() => setView('assessment')}
            >
              <Zap className="w-5 h-5" />
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-cyber-border text-foreground hover:bg-white/5 font-semibold text-base px-8 py-6"
              onClick={() => setView('dashboard')}
            >
              Explore Dashboard
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {[
              { value: '15+', label: 'Hands-on Labs' },
              { value: '8', label: 'CTF Challenges' },
              { value: '5', label: 'Skill Tiers' },
              { value: '100%', label: 'Free & Open Source' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-neon">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive bg-destructive/5">
              The Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Indian Students Are <span className="text-destructive">Left Behind</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              The cybersecurity learning gap is real. Here are the 5 problems no one has fully solved — until now.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: DollarSign,
                title: 'TryHackMe / HackTheBox',
                desc: 'Great platforms but expensive at $14/month. Fully in English with no Indian context or relevance.',
                color: '#f59e0b',
              },
              {
                icon: MessageSquare,
                title: 'YouTube Tutorials',
                desc: 'Scattered across channels, often outdated, and worst of all — no hands-on environment to practice.',
                color: '#ef4444',
              },
              {
                icon: GraduationCap,
                title: 'College Curriculum',
                desc: 'Teaches theory from 10-year-old textbooks. Never lets you touch a real terminal or hack anything.',
                color: '#a855f7',
              },
              {
                icon: BookOpen,
                title: 'AI Tools Like ChatGPT',
                desc: 'Will refuse to explain attack techniques — even for educational purposes. Safety filters block learning.',
                color: '#06b6d4',
              },
              {
                icon: TrendingUp,
                title: 'No Adaptive Path',
                desc: 'A beginner and an intermediate get the exact same content. No personalization, no progression tracking.',
                color: '#22c55e',
              },
            ].map((problem, i) => (
              <motion.div
                key={problem.title}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-white/[0.02] border-cyber-border hover:border-white/10 transition-colors group">
                  <CardContent className="p-6">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${problem.color}15` }}
                    >
                      <problem.icon className="w-5 h-5" style={{ color: problem.color }} />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-neon transition-colors">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{problem.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="mt-8 text-center">
            <p className="text-lg font-medium">
              <span className="text-neon">Vaathi fixes all five simultaneously.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-neon/30 text-neon bg-neon/5">
              The Three Pillars
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              One Platform. <span className="text-neon">Three Powers.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every pillar talks to the others. Always. Your progress in Labs feeds your Arena rank. Your Arena performance shapes your Guru&apos;s guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Guru AI',
                subtitle: 'The Brain',
                color: '#22c55e',
                features: [
                  'Remembers you across sessions — your weak spots, your wins',
                  'Adaptive roadmap based on your skill tier',
                  'Explains attack techniques in sandboxed, educational context',
                  'Vernacular mode: Ask in Tamil, Hindi, Telugu',
                  '"Explains like a senior" — casual, fun, uses analogies',
                ],
              },
              {
                icon: Swords,
                title: 'Labs',
                subtitle: 'The Hands',
                color: '#06b6d4',
                features: [
                  'Browser-based, offline-capable sandboxed environments',
                  '6 categories: Networking, Web, Linux, Crypto, Malware, Indian Context',
                  'Guru AI sidebar explaining every step in real time',
                  'Hint system that costs XP — encourages trying first',
                  '"What did I just do?" debrief after completion',
                ],
              },
              {
                icon: Trophy,
                title: 'Arena',
                subtitle: 'The Fire',
                color: '#f59e0b',
                features: [
                  'Weekly CTF challenges with Indian-themed scenarios',
                  'National leaderboard — College-wise, state-wise rankings',
                  'Team mode — Form a college team, compete together',
                  'Bug bounty simulation — Write reports like a pro',
                  'Certificate NFTs — On-chain proof of completion',
                ],
              },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Card className="h-full bg-white/[0.02] border-cyber-border hover:border-white/10 transition-all group hover:-translate-y-1 duration-300">
                  <CardContent className="p-8">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 glow-green"
                      style={{ backgroundColor: `${pillar.color}15` }}
                    >
                      <pillar.icon className="w-7 h-7" style={{ color: pillar.color }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{pillar.subtitle}</p>
                    <ul className="space-y-3">
                      {pillar.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground/70">
                          <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: pillar.color }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Adaptive Engine */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
              Adaptive Engine
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Path. <span className="text-cyan-400">Your Pace.</span>
            </h2>
          </motion.div>

          {/* Tier Flow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 mb-12">
            {Object.values(TIER_CONFIG).map((tier, i) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2"
                    style={{ borderColor: tier.color, backgroundColor: `${tier.color}10` }}
                  >
                    {tier.emoji}
                  </div>
                  <span className="mt-2 text-xs font-medium" style={{ color: tier.color }}>
                    {tier.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center max-w-[80px]">{tier.desc}</span>
                </div>
                {i < 4 && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground hidden sm:block mx-2" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Flow steps */}
          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-4 font-mono text-sm">
                  {[
                    { text: 'New user joins Vaathi', indent: 0 },
                    { text: 'Skill assessment (10 min, feels like a game)', indent: 1 },
                    { text: 'Placed into one of 5 tiers: Egg → Burn', indent: 1 },
                    { text: 'Guru AI generates a personal 30-day roadmap', indent: 1 },
                    { text: 'Every lab completed → memory updated → roadmap adjusts', indent: 1 },
                    { text: 'Stuck for 2 days? → Guru proactively nudges with a hint', indent: 1 },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ paddingLeft: `${step.indent * 24}px` }}>
                      <span className="text-neon">{step.indent === 0 ? '>' : '→'}</span>
                      <span className="text-foreground/80">{step.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Offline First */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/5 gap-2">
              <WifiOff className="w-3.5 h-3.5" />
              Offline-First
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Works Where WiFi <span className="text-cyan-400">Doesn&apos;t</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Students in tier-2 colleges have patchy WiFi. Vaathi is designed for India&apos;s reality.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Container,
                title: 'Docker Containers',
                desc: 'Labs run locally via Docker containers pulled once. No constant internet needed.',
              },
              {
                icon: Cpu,
                title: 'On-Device AI',
                desc: 'Ollama + Llama 3.2 3B for basic guidance. Full sync when connected.',
              },
            ].map((item, i) => (
              <motion.div key={item.title} {...stagger} transition={{ delay: i * 0.1 }}>
                <Card className="bg-white/[0.02] border-cyber-border h-full">
                  <CardContent className="p-6">
                    <item.icon className="w-8 h-8 text-cyan-400 mb-4" />
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-neon/30 text-neon bg-neon/5 gap-2">
              <Code2 className="w-3.5 h-3.5" />
              Tech Stack
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Built With <span className="text-neon">Modern Tools</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Next.js', desc: 'Frontend Framework' },
              { name: 'Tauri', desc: 'Desktop App' },
              { name: 'Docker', desc: 'Lab Sandboxes' },
              { name: 'WebAssembly', desc: 'Browser Labs' },
              { name: 'Ollama', desc: 'Local AI' },
              { name: 'Llama 3.2', desc: 'On-Device Model' },
              { name: 'Claude API', desc: 'Cloud AI' },
              { name: 'SQLite', desc: 'Local Storage' },
              { name: 'Whisper', desc: 'Voice Input' },
              { name: 'GitHub OAuth', desc: 'Authentication' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'Prisma', desc: 'Database ORM' },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                {...stagger}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Card className="bg-white/[0.02] border-cyber-border hover:border-neon/20 transition-colors text-center">
                  <CardContent className="p-4">
                    <div className="font-mono font-semibold text-neon text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{tech.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400 bg-amber-500/5 gap-2">
              <Building2 className="w-3.5 h-3.5" />
              Sustainable & Open
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Core is Always Free. <span className="text-amber-400">Always Open Source.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Building2, title: 'Corporate CTF Hosting', desc: 'TCS, Infosys, Wipro pay to host hiring CTFs on the platform' },
              { icon: GraduationCap, title: 'College Partnerships', desc: '₹50/student/year for institution dashboard + certificates' },
              { icon: Lock, title: 'Pro Labs', desc: 'Advanced malware / red team labs behind a thin paywall' },
              { icon: Briefcase, title: 'Placement Prep', desc: 'Mock interviews with AI for cybersecurity roles' },
            ].map((rev, i) => (
              <motion.div key={rev.title} {...stagger} transition={{ delay: i * 0.1 }}>
                <Card className="bg-white/[0.02] border-cyber-border h-full">
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <rev.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{rev.title}</h3>
                      <p className="text-sm text-muted-foreground">{rev.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Go-To-Market */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-neon/30 text-neon bg-neon/5 gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Go-To-Market
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The <span className="text-neon">Launch Plan</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-cyber-border" />

            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: 'College Pilot',
                  desc: 'Get the cybersecurity club at a top NIT/IIT to pilot Vaathi as their official learning platform.',
                },
                {
                  step: 2,
                  title: 'Viral Content',
                  desc: 'One viral Tamil/Hindi YouTube video — "I hacked a website in 30 minutes using this free Indian app".',
                },
                {
                  step: 3,
                  title: 'Smart India Hackathon',
                  desc: 'Submit to SIH — government loves the "Made in India, cybersecurity awareness" narrative.',
                },
                {
                  step: 4,
                  title: 'CERT-In Alignment',
                  desc: 'Partner with India\'s national cybersecurity agency for credibility and institutional trust.',
                },
                {
                  step: 5,
                  title: 'GitHub India Launch',
                  desc: 'Trending in a week if the README is good. Open source developers love a good security project.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative flex gap-6"
                >
                  <div className="w-12 h-12 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center shrink-0 z-10">
                    <span className="font-mono font-bold text-neon">{item.step}</span>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Flywheel */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div {...fadeIn} className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-neon/30 text-neon bg-neon/5 gap-2">
              <GitBranch className="w-3.5 h-3.5" />
              Open Source Flywheel
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Community <span className="text-neon">Powers Everything</span>
            </h2>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <Card className="bg-white/[0.02] border-cyber-border">
              <CardContent className="p-8">
                <div className="space-y-4 text-center font-mono text-sm">
                  {[
                    'Students use Vaathi → get good → contribute labs back',
                    '↓',
                    'More labs → more students → more contributors',
                    '↓',
                    'College clubs adopt it as their official platform',
                    '↓',
                    'Companies sponsor CTF prizes → monetization without paywalls',
                  ].map((line, i) => (
                    <div key={i}>
                      <span className={`${
                        line === '↓' ? 'text-neon text-lg' : 'text-foreground/80'
                      }`}>
                        {line}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid sm:grid-cols-3 gap-4">
                  {[
                    { title: 'Lab SDK', desc: 'Build and submit new labs in markdown + Docker' },
                    { title: 'Translation Bounties', desc: 'Contribute Hindi/Tamil explanations, earn XP' },
                    { title: 'Plugin System', desc: 'Nmap, Burp Suite, Metasploit wrappers by community' },
                  ].map((item) => (
                    <div key={item.title} className="text-center p-4 rounded-lg bg-white/[0.02] border border-cyber-border">
                      <div className="font-semibold text-neon mb-1">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Viral Quote */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn}>
            <Card className="bg-gradient-to-br from-neon/5 to-cyan-500/5 border-neon/20 glow-green">
              <CardContent className="p-8 sm:p-12 text-center">
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-6" />
                <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6 italic text-foreground/90">
                  &ldquo;I failed my college networking paper. Six months with Vaathi, I got a job at a
                  cybersecurity firm. And it&apos;s free.&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-neon">AK</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Anonymous Student</div>
                    <div className="text-xs text-muted-foreground">NIT Trichy &bull; Placed at CrowdStrike</div>
                  </div>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  That testimonial — in a LinkedIn post — is worth a crore in marketing.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-neon/[0.03] to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="text-neon">Begin?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              10 minutes. That&apos;s all it takes. Take the skill assessment and get your personalized learning path.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90 font-semibold text-lg px-10 py-7 glow-green-strong"
              onClick={() => setView('assessment')}
            >
              <Zap className="w-5 h-5" />
              Take the Assessment
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon" />
              <span className="font-bold text-neon">VAATHI</span>
              <span className="text-sm text-muted-foreground ml-2">Open Source Cybersecurity Learning OS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Community
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                English / Hindi / Tamil
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" />
                Offline Ready
              </span>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Made with passion for India&apos;s cybersecurity future. 100% Free. 100% Open Source.
          </div>
        </div>
      </footer>
    </div>
  )
}
