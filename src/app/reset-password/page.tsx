'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4">
      <div className="w-full max-w-xl">
        <div className="text-3xl font-semibold tracking-tight">Set new password</div>
        <div className="mt-3 text-sm text-white/70">Use the token received from reset request.</div>

        <form
          className="glass mt-8 rounded-3xl p-6"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setMessage(null)
            setLoading(true)
            try {
              await apiFetch<{ ok: boolean }>('/api/auth/password-reset/confirm', {
                method: 'POST',
                body: { token, newPassword },
              })
              setMessage('Password updated. You can login now.')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Reset failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div className="grid gap-3">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-mono outline-none"
              placeholder="Reset token"
              required
            />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
              placeholder="New password"
              type="password"
              required
            />
            {error && <div className="text-xs text-red-300">{error}</div>}
            {message && <div className="text-xs text-green-200">{message}</div>}
          </div>
          <div className="mt-5">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
