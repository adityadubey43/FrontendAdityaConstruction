'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 90])
  const opacity = useTransform(scrollY, [0, 350], [1, 0.3])

  return (
    <section className="relative overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,196,60,0.20),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,196,60,0.10),transparent_40%)]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            Premium construction. Modern management.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Building the Future with <span className="text-primary">Strength</span> and <span className="text-primary">Trust</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-5 max-w-xl text-sm leading-6 text-white/70"
          >
            We deliver high-quality residential and commercial construction with transparency, precision, and reliability.
          </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-col items-start gap-6 md:flex-row md:items-center"
          >
            <div className="grid grid-cols-3 gap-3">
              {[{ k: '15+', v: 'Years Experience' }, { k: '180+', v: 'Projects Completed' }, { k: '98%', v: 'Client Satisfaction' }].map((x) => (
                <div key={x.v} className="glass rounded-2xl px-4 py-4">
                  <div className="text-2xl font-semibold">{x.k}</div>
                  <div className="mt-1 text-xs text-white/70">{x.v}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="animate-bounce rounded-full bg-white/10 px-3 py-2">↓</div>
              <div>Scroll to explore our capabilities</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild>
              <Link href="/contact">Get a Quote</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/projects">View Projects</Link>
            </Button>
          </motion.div>

        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="glass relative rounded-3xl p-6 shadow-soft"
          >
            <div className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-black">
              Live Tracking
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Project</div>
                <div className="mt-1 font-semibold">Modern Villa Build</div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '35%' }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className="h-2 rounded-full bg-primary"
                  />
                </div>
                <div className="mt-2 text-xs text-white/60">35% complete</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Budget</div>
                  <div className="mt-1 text-lg font-semibold">₹45,00,000</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/60">Remaining</div>
                  <div className="mt-1 text-lg font-semibold">₹36,95,000</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Next milestone</div>
                <div className="mt-1 font-semibold">Structure - ground floor</div>
                <div className="mt-1 text-xs text-white/60">ETA: 2 weeks</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
