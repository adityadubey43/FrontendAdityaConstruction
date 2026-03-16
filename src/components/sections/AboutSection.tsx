import Reveal from '@/components/motion/Reveal'

export default function AboutSection() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">About Us</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              At Aditya Construction, we deliver premium residential and commercial projects with a modern approach, transparent process, and unwavering attention to detail.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">Our Mission</div>
                <div className="mt-2 text-xs text-white/70">
                  Craft spaces that elevate communities while delivering a seamless client experience.
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">Our Vision</div>
                <div className="mt-2 text-xs text-white/70">
                  Become the trusted partner for ambitious builds through clarity, quality, and craftsmanship.
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">Our Promise</div>
                <div className="mt-2 text-xs text-white/70">
                  Transparent milestones, consistent communication, and a commitment to exceptional results.
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 py-10 px-4">
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" />
            <div className="relative flex w-full flex-col items-start gap-4 max-w-sm">
              <div className="text-sm font-semibold uppercase tracking-wide text-white/50">Why choose us</div>
              <div className="text-2xl font-semibold text-white">A partner you can trust in every phase.</div>
              <p className="text-sm leading-7 text-white/70">
                We combine a structured approach with deep industry expertise to deliver projects that stand the test of time.
              </p>
              <div className="mt-6 grid gap-3 rounded-2xl bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">Experienced Team</div>
                <div className="text-xs text-white/60">Our qualified project managers and crews are on-site every step of the way.</div>
                <div className="text-sm font-semibold text-white">Clear Communication</div>
                <div className="text-xs text-white/60">Receive regular updates, milestone reports, and easy access to our team.</div>
                <div className="text-sm font-semibold text-white">Quality Assurance</div>
                <div className="text-xs text-white/60">Rigorous inspections and a culture of accountability ensure premium delivery.</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
