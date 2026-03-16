import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for Aditya Construction.',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Terms & Conditions</h1>
      <div className="prose prose-invert mt-8 max-w-none">
        <p>This page will be updated with the terms and conditions.</p>
      </div>
    </div>
  )
}
