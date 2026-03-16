'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

type Settings = {
  siteName: string
  theme: 'light' | 'dark'
}

type AccountUser = {
  _id: string
  name: string
  email: string
  countryCode: string
  mobilenumber: number
  role: string
}

type AccountForm = {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState<Settings>({ siteName: '', theme: 'light' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [account, setAccount] = useState<AccountUser | null>(null)
  const [accountForm, setAccountForm] = useState<AccountForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''
    setLoading(true)
    apiFetch<Settings>('/api/settings', { token })
      .then((data) => {
        setSettings(data)
        setForm(data)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''
    setAccountLoading(true)
    apiFetch<{ userdetails: AccountUser }>('/api/auth/userdetail', { token })
      .then((data) => {
        setAccount(data.userdetails)
        setAccountForm((prev) => ({
          ...prev,
          name: data.userdetails.name,
          email: data.userdetails.email,
        }))
      })
      .catch((e) => setAccountError(e instanceof Error ? e.message : 'Failed to load account info'))
      .finally(() => setAccountLoading(false))
  }, [])

  const canSave = useMemo(() => {
    if (!settings) return false
    return settings.siteName !== form.siteName || settings.theme !== form.theme
  }, [form, settings])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

    try {
      const updated = await apiFetch<Settings>('/api/settings', {
        method: 'PATCH',
        token,
        body: form,
      })
      setSettings(updated)
      setForm(updated)
      setSuccess('Settings saved successfully.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleAccountSave(e: React.FormEvent) {
    e.preventDefault()
    setAccountError(null)
    setAccountSuccess(null)

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setAccountError('New password and confirmation do not match.')
      return
    }

    setAccountSaving(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

    try {
      const payload: Record<string, unknown> = {
        name: accountForm.name,
        email: accountForm.email,
      }

      if (accountForm.newPassword) {
        payload.password = accountForm.newPassword
      }

      const updated = await apiFetch<{ userdetails: AccountUser }>('/api/auth/userdetail', {
        method: 'PATCH',
        token,
        body: payload,
      })

      setAccount(updated.userdetails)
      setAccountForm((prev) => ({
        ...prev,
        name: updated.userdetails.name,
        email: updated.userdetails.email,
        newPassword: '',
        confirmPassword: '',
        currentPassword: '',
      }))
      setAccountSuccess('Account updated successfully.')
    } catch (e) {
      setAccountError(e instanceof Error ? e.message : 'Failed to update account')
    } finally {
      setAccountSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="mt-2 text-xs text-white/60">Configure site preferences and appearance.</div>
      </div>

      {error && <div className="text-sm text-red-300">{error}</div>}
      {success && <div className="text-sm text-emerald-300">{success}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="glass h-24 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="glass rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-white/60">Site name</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.siteName}
                onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
                placeholder="Aditya Construction"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/60">Theme</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.theme}
                onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/60">
              {settings ? 'Changes will be saved to the server.' : 'No settings are available.'}
            </div>
            <Button type="submit" disabled={!canSave || saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </form>
      )}

      <div>
        <div className="text-xl font-semibold">My account</div>
        <div className="mt-2 text-xs text-white/60">Update your profile or change your password.</div>
        {account && (
          <div className="mt-1 text-xs text-white/50">Signed in as {account.email}</div>
        )}
      </div>

      {accountError && <div className="text-sm text-red-300">{accountError}</div>}
      {accountSuccess && <div className="text-sm text-emerald-300">{accountSuccess}</div>}

      {accountLoading ? (
        <div className="glass h-48 animate-pulse rounded-3xl" />
      ) : (
        <form onSubmit={handleAccountSave} className="glass rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-white/60">Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={accountForm.name}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/60">Email</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={accountForm.email}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <label className="text-xs font-medium text-white/60">Current password</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={accountForm.currentPassword}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="(optional)"
                type="password"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/60">New password</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={accountForm.newPassword}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="New password"
                type="password"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-white/60">Confirm new password</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={accountForm.confirmPassword}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                type="password"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-white/60">Leave password fields blank to keep your current password.</div>
            <Button type="submit" disabled={accountSaving}>
              {accountSaving ? 'Saving…' : 'Save account'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
