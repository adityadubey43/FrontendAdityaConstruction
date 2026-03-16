'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import Reveal from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'

export default function ContactSection() {
  const [loading, setLoading] = useState(false)

  return (
    <section className="mx-auto max-w-6xl px-4">
      <Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Get in Touch</h2>
            <p className="mt-3 text-sm text-white/70">
              Start your next project with a trusted partner. Share your requirements and we’ll respond with an estimate.
            </p>

            <div className="mt-8 space-y-4 rounded-3xl bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/10 p-3 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Office Address</div>
                  <div className="mt-1 text-xs text-white/70">123 Landmark Road, Mumbai, India</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/10 p-3 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Phone</div>
                  <div className="mt-1 text-xs text-white/70">+91 98765 43210</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/10 p-3 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Email</div>
                  <div className="mt-1 text-xs text-white/70">contact@adityaconstruction.com</div>
                </div>
              </div>
            </div>
          </div>

          <form
            className="glass rounded-3xl p-6"
            onSubmit={(e) => {
              e.preventDefault()
              setLoading(true)
              setTimeout(() => setLoading(false), 800)
            }}
          >
            <div className="grid gap-3">
              <input className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none" placeholder="Name" required />
              <input className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none" placeholder="Phone" required />
              <input className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none" placeholder="Email" type="email" />
              <textarea className="min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Project details" />
            </div>
            <div className="mt-5">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </div>
      </Reveal>
    </section>
  )
}
