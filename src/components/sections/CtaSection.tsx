import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'

export default function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <Reveal>
        <div className="glass rounded-3xl p-10 shadow-soft">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="text-2xl font-semibold tracking-tight">Ready to build something premium?</div>
              <div className="mt-3 text-sm text-white/70">Get a quote, timeline, and a clear execution plan.</div>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/contact">Get a Quote</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/projects">View Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
