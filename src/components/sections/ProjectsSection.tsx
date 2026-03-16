import Reveal from '@/components/motion/Reveal'

const projects = [
  { name: 'Modern Villa Build', location: 'Pune', tag: 'In Progress' },
  { name: 'Commercial Office Fitout', location: 'Mumbai', tag: 'Completed' },
  { name: 'Luxury Apartment Renovation', location: 'Nashik', tag: 'Completed' },
]

export default function ProjectsSection({ compact }: { compact?: boolean }) {
  return (
    <section className={compact ? '' : 'mx-auto max-w-6xl px-4'}>
      <Reveal>
        {!compact && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Projects Portfolio</h2>
            <p className="mt-3 text-sm text-white/70">A curated look at our work.</p>
          </div>
        )}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {projects.map((p) => (
            <div key={p.name} className="glass group relative overflow-hidden rounded-3xl p-6 shadow-soft transition hover:translate-y-[-2px] hover:bg-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">{p.location}</div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                  {p.tag}
                </div>
              </div>
              <div className="mt-4 text-sm font-semibold">{p.name}</div>
              <div className="relative mt-3 h-24 overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" />
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="flex h-full items-center justify-center bg-black/20">
                    <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white">
                      View project
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-white/60 group-hover:text-white/70">
                Click to explore milestones & visuals
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
