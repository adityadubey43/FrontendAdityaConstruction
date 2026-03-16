import Reveal from '@/components/motion/Reveal'

const steps = [
  { t: 'Consultation', d: 'Understand requirements, site, budget.' },
  { t: 'Planning', d: 'Design alignment, estimation, schedule.' },
  { t: 'Execution', d: 'Quality-controlled construction delivery.' },
  { t: 'Handover', d: 'Final inspection and documentation.' },
]

export default function ProcessSection() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Our Process</h2>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          A structured workflow that keeps you informed and keeps the project on track.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="relative">
            <div className="absolute left-5 top-4 h-[calc(100%-1rem)] w-0.5 bg-white/10 md:left-6" />
            <div className="space-y-6">
              {steps.map((s, i) => (
                <div key={s.t} className="relative flex gap-4">
                  <div className="relative">
                    <div className="absolute -left-2 top-0 h-3 w-3 rounded-full bg-primary" />
                    <div className="text-xs text-white/60">Step {i + 1}</div>
                  </div>
                  <div className="glass w-full rounded-2xl p-6">
                    <div className="text-sm font-semibold">{s.t}</div>
                    <div className="mt-2 text-xs text-white/70">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-10 text-white/80">
            <h3 className="text-xl font-semibold">Your project at a glance</h3>
            <p className="mt-3 text-sm text-white/70">
              We use collaborative planning tools and weekly check-ins so you always know where the project stands.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />
                Clear scope & milestones
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />
                Dedicated project manager
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" />
                Transparent budgets & updates
              </li>
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
