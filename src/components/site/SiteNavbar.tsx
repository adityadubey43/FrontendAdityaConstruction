'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const nav = [
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
]

export default function SiteNavbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 shadow-soft">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold tracking-wide">Aditya Construction</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-sm text-white/75 hover:text-white">
                {n.label}
              </Link>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/contact">Get a Quote</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
