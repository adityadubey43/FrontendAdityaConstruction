'use client'

import { useMemo, useState } from 'react'
import Reveal from '@/components/motion/Reveal'

const testimonials = [
  { name: 'Rahul S.', quote: 'Quality work and clear communication.', role: 'Homeowner' },
  { name: 'Neha P.', quote: 'On-time delivery and premium finish.', role: 'Commercial Client' },
  { name: 'Amit K.', quote: 'Transparent budgeting and updates.', role: 'Project Manager' },
]

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const current = useMemo(() => testimonials[index], [index])

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length)
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="mx-auto max-w-6xl px-4">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Testimonials</h2>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          Hear from clients who chose Aditya Construction for their most important projects.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="glass w-full max-w-2xl rounded-3xl p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-semibold">{current.name}</div>
                <div className="text-xs text-white/60">{current.role}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/80 transition hover:bg-white/15"
                  aria-label="Previous testimonial"
                >
                  ←
                </button>
                <button
                  onClick={next}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/80 transition hover:bg-white/15"
                  aria-label="Next testimonial"
                >
                  →
                </button>
              </div>
            </div>

            <div className="mt-6 text-sm text-white/70">“{current.quote}”</div>
          </div>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? 'bg-white' : 'bg-white/30'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
