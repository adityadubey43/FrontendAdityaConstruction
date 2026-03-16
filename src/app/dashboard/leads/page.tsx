"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'

type LeadStatus = 'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'

type Lead = {
  _id: string
  name: string
  email?: string
  phone?: string
  projectType?: string
  budget?: number
  status: LeadStatus
  source?: string
  notes?: string
  followUpDate?: string
}

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'table' | 'pipeline'>('table')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<Lead[]>('/api/leads', { token })
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = useMemo(() => {
    const lower = query.toLowerCase().trim()
    return leads
      .filter((lead) => {
        if (statusFilter !== 'All' && lead.status !== statusFilter) return false
        if (!lower) return true
        return (
          lead.name.toLowerCase().includes(lower) ||
          (lead.email?.toLowerCase().includes(lower) ?? false) ||
          (lead.phone?.toLowerCase().includes(lower) ?? false) ||
          (lead.projectType?.toLowerCase().includes(lower) ?? false)
        )
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1))
  }, [leads, query, statusFilter])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-semibold">Leads</div>
          <div className="mt-1 text-xs text-white/60">Manage your sales pipeline and follow-ups.</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-white/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'All')}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="All">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={() => setView((prev) => (prev === 'table' ? 'pipeline' : 'table'))}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {view === 'table' ? 'Pipeline view' : 'Table view'}
            </button>
            <button
              onClick={() => {
                setEditing(null)
                setOpenModal(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary/40 hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add lead
            </button>
          </div>
        </div>
      </header>

      {error && <div className="text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="glass h-28 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : view === 'pipeline' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {statusOptions.map((status) => (
            <div key={status} className="glass rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{status}</div>
                <div className="text-xs text-white/60">{filteredLeads.filter((l) => l.status === status).length}</div>
              </div>
              <div className="mt-4 space-y-3">
                {filteredLeads
                  .filter((lead) => lead.status === status)
                  .map((lead) => (
                    <div key={lead._id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold">{lead.name}</div>
                      <div className="mt-1 text-xs text-white/60">{lead.projectType ?? 'No project type'}</div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span>{lead.phone}</span>
                        <span className="rounded-full bg-white/10 px-2 py-1">{lead.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="border-b border-white/10">
                  <td className="px-4 py-4">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-xs text-white/60">{lead.email}</div>
                  </td>
                  <td className="px-4 py-4">{lead.projectType ?? '-'}</td>
                  <td className="px-4 py-4">{lead.budget ? `₹${lead.budget.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{lead.status}</span>
                  </td>
                  <td className="px-4 py-4">{lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setEditing(lead)
                        setOpenModal(true)
                      }}
                      className="rounded-xl bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openModal && (
        <LeadModal
          lead={editing}
          onClose={() => {
            setOpenModal(false)
            setEditing(null)
          }}
          onSave={() => {
            setOpenModal(false)
            setEditing(null)
            fetchLeads()
          }}
          token={token}
        />
      )}
    </div>
  )
}

function LeadModal({
  lead,
  onClose,
  onSave,
  token,
}: {
  lead: Lead | null
  onClose: () => void
  onSave: () => void
  token: string
}) {
  const [form, setForm] = useState<Partial<Lead>>(
    lead ?? {
      name: '',
      email: '',
      phone: '',
      projectType: '',
      budget: undefined,
      status: 'New',
      source: '',
      notes: '',
      followUpDate: '',
    }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const method = lead ? 'PUT' : 'POST'
      const url = lead ? `/api/leads/${lead._id}` : '/api/leads'
      await apiFetch<Lead>(url, { token, method, body: form })
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{lead ? 'Edit Lead' : 'New Lead'}</div>
            <div className="text-xs text-white/60">{lead ? 'Update lead details' : 'Add a new lead to your pipeline'}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Lead name"
            />
            <input
              value={form.email ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.phone ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Phone"
            />
            <input
              value={form.projectType ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Project type"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.budget ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Budget"
              type="number"
            />
            <select
              value={form.status ?? 'New'}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as LeadStatus }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.source ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Source"
            />
            <input
              value={form.followUpDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Follow-up date"
              type="date"
            />
          </div>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="min-h-[120px] resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            placeholder="Notes"
          />
          {error && <div className="text-sm text-red-300">{error}</div>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary/40 hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
