import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Aditya Construction.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="prose prose-invert mt-8 max-w-none">
        <p>We respect your privacy. This page will be updated with full policy text.</p>
      </div>
    </div>
  )
}
