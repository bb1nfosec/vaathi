'use client'

import { motion } from 'framer-motion'
import { useVaathiStore, TIER_CONFIG } from '@/store/vaathi-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Brain,
  Swords,
  Trophy,
  Globe,
  WifiOff,
  Key,
  Languages,
  ChevronRight,
  ArrowRight,
  Zap,
  Star,
  Sparkles,
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
              BYOLLM &bull; Open Source &bull; Made in India
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
            Bring Your Own LLM. Learn cybersecurity with an AI mentor that speaks your language.
            No servers. No subscriptions. Just your API key and Vaathi as the wrapper.
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
              onClick={() => setView('onboarding')}
            >
              <Zap className="w-5 h-5" />
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
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
              { value: '6', label: 'Languages' },
              { value: '5+', label: 'LLM Providers' },
              { value: '5', label: 'Skill Tiers' },
              { value: '∞', label: 'Micro Tasks' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-neon">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BYOLLM Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-neon/30 text-neon bg-neon/5 gap-2">
              <Key className="w-3.5 h-3.5" />
              BYOLLM Architecture
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your LLM. <span className="text-neon">Your Rules.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Vaathi doesn&apos;t lock you into any AI provider. Bring your own API key and model — 
              we generate all learning content dynamically through your LLM.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                title: 'AI Mentor (Guru)',
                desc: 'A fun, adaptive cybersecurity mentor that speaks Tamil, Hindi, Telugu, Malayalam, Kannada, or English.',
                color: '#10b981',
              },
              {
                icon: Swords,
                title: 'Micro Tasks',
                desc: 'Tiny hands-on exercises — code analysis, decode challenges, command drills, log forensics. No VMs needed.',
                color: '#06b6d4',
              },
              {
                icon: Trophy,
                title: 'CTF Arena',
                desc: 'AI creates custom CTF challenges — web, crypto, forensics — tailored to your skill level.',
                color: '#f59e0b',
              },
              {
                icon: Key,
                title: 'Your API Key',
                desc: 'Use Groq (free!), OpenAI, Together AI, Ollama local, or any OpenAI-compatible endpoint.',
                color: '#a855f7',
              },
              {
                icon: Languages,
                title: 'Multilingual',
                desc: 'Learn in your mother tongue. The AI teaches concepts in 6 Indian + English languages.',
                color: '#ec4899',
              },
              {
                icon: Globe,
                title: '100% Offline-Capable',
                desc: 'Use Ollama locally — no internet needed. All content generated on your machine.',
                color: '#22c55e',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-white/[0.02] border-cyber-border hover:border-white/10 transition-colors group">
                  <CardContent className="p-6">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-neon transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
              Tier System
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Path. <span className="text-cyan-400">Your Pace.</span>
            </h2>
          </motion.div>

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
        </div>
      </section>

      {/* Quote */}
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
            <Sparkles className="w-12 h-12 text-neon mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="text-neon">Begin?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              2 minutes to set up. Bring your LLM key. Start hacking (ethically!).
            </p>
            <Button
              size="lg"
              className="gap-2 bg-neon text-cyber-dark hover:bg-neon/90 font-semibold text-lg px-10 py-7 glow-green-strong"
              onClick={() => setView('onboarding')}
            >
              <Zap className="w-5 h-5" />
              Start Your Journey
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
              <span className="text-sm text-muted-foreground ml-2">BYOLLM Cybersecurity Learning OS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                Offline-Capable
              </span>
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                Your Own LLM
              </span>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Made with 💚 for India&apos;s cybersecurity future. 100% Free. 100% Open Source.
          </div>
        </div>
      </footer>
    </div>
  )
}
