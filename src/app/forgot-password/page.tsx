'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('admin@adityaconstruction.com')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4">
      <div className="w-full max-w-xl">
        <div className="text-3xl font-semibold tracking-tight">Reset password</div>
        <div className="mt-3 text-sm text-white/70">Request a reset token (email integration can be added later).</div>

        <form
          className="glass mt-8 rounded-3xl p-6"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setToken(null)
            setLoading(true)
            try {
              const data = await apiFetch<{ ok: boolean; resetToken?: string }>('/api/auth/password-reset/request', {
                method: 'POST',
                body: { email },
              })
              setToken(data.resetToken || null)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Request failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
            placeholder="Email"
            type="email"
            required
          />
          {error && <div className="mt-3 text-xs text-red-300">{error}</div>}
          {token && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
              Reset token: <span className="font-mono">{token}</span>
              <div className="mt-2 text-white/60">Go to /reset-password and paste it.</div>
            </div>
          )}
          <div className="mt-5">
            <Button type="submit" disabled={loading}>
              {loading ? 'Requesting…' : 'Request reset'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
