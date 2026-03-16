import type { Metadata } from 'next'
import ServicesSection from '@/components/sections/ServicesSection'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Construction services by Aditya Construction.',
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
      <p className="mt-3 text-white/70">End-to-end construction delivery with premium craftsmanship.</p>
      <div className="mt-12">
        <ServicesSection compact />
      </div>
    </div>
  )
}
