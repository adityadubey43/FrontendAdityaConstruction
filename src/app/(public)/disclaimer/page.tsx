import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer for Aditya Construction.',
}

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Disclaimer</h1>
      <div className="prose prose-invert mt-8 max-w-none">
        <p>This page will be updated with the disclaimer.</p>
      </div>
    </div>
  )
}
