'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@adityaconstruction.com')
  const [password, setPassword] = useState('Admin@12345')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4">
      <div className="grid w-full gap-8 md:grid-cols-2">
        <div>
          <div className="text-3xl font-semibold tracking-tight">Welcome back</div>
          <div className="mt-3 text-sm text-white/70">Login to access the management dashboard.</div>
        </div>
        <form
          className="glass rounded-3xl p-6"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              const data = await apiFetch<{ token: string } & Record<string, unknown>>('/api/auth/login', {
                method: 'POST',
                body: { email, password },
              })
              localStorage.setItem('acls_token', data.token)
              router.push('/dashboard')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div className="grid gap-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
              placeholder="Password"
              type="password"
              required
            />
            {error && <div className="text-xs text-red-300">{error}</div>}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <a href="/forgot-password" className="text-xs text-white/70 hover:text-white">
              Forgot password?
            </a>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </Button>
          </div>
          <div className="mt-4 text-center text-xs text-white/70">
            New user?{' '}
            {/* Registration link removed: Only admin can create users */}
          </div>
        </form>
      </div>
    </div>
  )
}
