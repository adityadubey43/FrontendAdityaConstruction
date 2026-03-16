"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed'

type Project = {
  _id: string
  projectName: string
  clientName: string
  location?: string
  startDate?: string
  endDate?: string
  budget?: number
  status: ProjectStatus
  progress: number
}

const statusOptions: ProjectStatus[] = ['Planning', 'In Progress', 'On Hold', 'Completed']

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<Project[]>('/api/projects', { token })
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase()
    return projects
      .filter((p) => (statusFilter === 'all' ? true : p.status === statusFilter))
      .filter((p) => {
        if (!lower) return true
        return (
          p.projectName.toLowerCase().includes(lower) ||
          p.clientName.toLowerCase().includes(lower) ||
          (p.location ?? '').toLowerCase().includes(lower)
        )
      })
  }, [projects, search, statusFilter])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xl font-semibold">Projects</div>
          <div className="mt-1 text-xs text-white/60">Track progress, timelines, budgets and teams.</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-white/50" />
            <input
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button
            onClick={() => {
              setEditing(null)
              setShowModal(true)
            }}
            variant="secondary"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </header>

      {error && <div className="text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="glass h-40 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-white/60">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((project) => (
                  <tr key={project._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{project.projectName}</div>
                      <div className="text-xs text-white/60">{project.location}</div>
                    </td>
                    <td className="px-4 py-4">{project.clientName}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs">
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-white/60">{project.progress ?? 0}%</div>
                    </td>
                    <td className="px-4 py-4">{project.budget ? `₹${project.budget.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(project)
                          setShowModal(true)
                        }}
                        className="rounded-xl bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                      >
                        Edit
                      </button>
                      <a
                        href={`/dashboard/projects/${project._id}`}
                        className="rounded-xl bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProjectModal
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            loadProjects()
          }}
          token={token}
        />
      )}
    </div>
  )
}

function ProjectModal({
  editing,
  token,
  onClose,
  onSaved,
}: {
  editing: Project | null
  token: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Partial<Project>>(
    editing ?? {
      projectName: '',
      clientName: '',
      location: '',
      startDate: '',
      endDate: '',
      budget: 0,
      status: 'Planning',
      progress: 0,
    }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const method = editing ? 'PUT' : 'POST'
      const url = editing ? `/api/projects/${editing._id}` : '/api/projects'
      await apiFetch<Project>(url, { token, method, body: form })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{editing ? 'Edit Project' : 'New Project'}</div>
            <div className="text-xs text-white/60">{editing ? 'Update project details' : 'Create a new project record'}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.projectName ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Project name"
            />
            <input
              required
              value={form.clientName ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Client name"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.location ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Location"
            />
            <input
              value={form.budget ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Budget"
              type="number"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={form.startDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              type="date"
              placeholder="Start date"
            />
            <input
              value={form.endDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              type="date"
              placeholder="End date"
            />
            <select
              value={form.status ?? 'Planning'}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
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
              value={form.progress ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Progress %"
              type="number"
              min={0}
              max={100}
            />
          </div>

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
              {saving ? 'Saving...' : 'Save project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
