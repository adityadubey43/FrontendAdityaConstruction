import type { Metadata } from 'next'
import ProjectsSection from '@/components/sections/ProjectsSection'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Portfolio projects by Aditya Construction.',
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-3 text-white/70">A selection of our recent work.</p>
      <div className="mt-12">
        <ProjectsSection compact />
      </div>
    </div>
  )
}
