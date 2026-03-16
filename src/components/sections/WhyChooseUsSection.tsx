'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import Reveal from '@/components/motion/Reveal'

function useCountUp(target: number, duration = 1200, inView = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    let frame: number
    const start = performance.now()

    const animate = (time: number) => {
      const elapsed = time - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(progress * target))

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [target, duration, inView])

  return value
}

export default function WhyChooseUsSection() {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const years = useCountUp(15, 1300, inView)
  const projects = useCountUp(180, 1500, inView)
  const clients = useCountUp(95, 1400, inView)

  return (
    <section className="mx-auto max-w-6xl px-4" ref={ref}>
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Why Choose Us</h2>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          We deliver premium outcomes through a defined process, trusted partners, and attentive communication.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { label: 'Years of Expertise', value: years, suffix: '+' },
            { label: 'Projects Delivered', value: projects, suffix: '+' },
            { label: 'Satisfied Clients', value: clients, suffix: '%' },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-8">
              <div className="text-3xl font-semibold text-white">
                {item.value}
                <span className="text-lg font-normal">{item.suffix}</span>
              </div>
              <div className="mt-2 text-sm text-white/70">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { t: 'Quality Controls', d: 'On-site checks and material validation.' },
            { t: 'Fast Turnaround', d: 'Precise scheduling for timely completion.' },
            { t: 'Clear Communication', d: 'Regular milestones & updates.' },
            { t: 'Strong Partnerships', d: 'Trusted vendors and expert trades.' },
          ].map((x) => (
            <div key={x.t} className="glass rounded-2xl p-6">
              <div className="text-sm font-semibold">{x.t}</div>
              <div className="mt-2 text-xs text-white/70">{x.d}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
