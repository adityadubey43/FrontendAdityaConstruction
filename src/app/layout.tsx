import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Aditya Construction',
    template: '%s | Aditya Construction',
  },
  description: 'Premium construction and project management by Aditya Construction.',
  metadataBase: new URL('https://aditya-construction.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
