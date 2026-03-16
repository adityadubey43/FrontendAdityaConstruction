import type { Metadata } from 'next'
import ContactSection from '@/components/sections/ContactSection'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Aditya Construction for a quote.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 text-white/70">Tell us about your project — we’ll get back quickly.</p>
      <div className="mt-12">
        <ContactSection />
      </div>
    </div>
  )
}
