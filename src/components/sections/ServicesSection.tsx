'use client'

import Reveal from '@/components/motion/Reveal'
import {
  Building,
  Home,
  Layers,
  Paintbrush,
  PanelLeft,
  Wrench,
} from 'lucide-react'

const services = [
  {
    title: 'Residential Construction',
    desc: 'Villas, bungalows, apartments — built with premium finishes.',
    icon: Home,
  },
  {
    title: 'Commercial Projects',
    desc: 'Offices, retail, warehouses with modern execution.',
    icon: Building,
  },
  {
    title: 'Renovation & Remodeling',
    desc: 'Transform spaces with minimal downtime and clean execution.',
    icon: Paintbrush,
  },
  {
    title: 'Turnkey Projects',
    desc: 'From planning to handover — one accountable partner.',
    icon: Layers,
  },
  {
    title: 'Interior Fit-outs',
    desc: 'Design-aligned interiors with durable materials.',
    icon: PanelLeft,
  },
  {
    title: 'Consultation & Estimation',
    desc: 'BOQ, costing, timelines, and feasibility planning.',
    icon: Wrench,
  },
]

export default function ServicesSection({ compact }: { compact?: boolean }) {
  return (
    <section className={compact ? '' : 'mx-auto max-w-6xl px-4'}>
      <Reveal>
        {!compact && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Services</h2>
            <p className="mt-3 text-sm text-white/70">Construction services designed for premium delivery.</p>
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="glass rounded-2xl p-6 transition hover:translate-y-[-2px] hover:bg-white/[0.08]">
              <div className="flex items-center gap-3">
                <s.icon className="h-6 w-6 text-primary" />
                <div className="text-sm font-semibold">{s.title}</div>
              </div>
              <div className="mt-2 text-xs leading-5 text-white/70">{s.desc}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
