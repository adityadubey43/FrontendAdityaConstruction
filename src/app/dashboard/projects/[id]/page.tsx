"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { ArrowLeft, FileText, ListChecks, Timeline, Users, DollarSign, Plus, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed'

type ProjectDetail = {
  _id: string
  projectName: string
  clientName: string
  location?: string
  startDate?: string
  endDate?: string
  budget?: number
  status: ProjectStatus
  progress: number
  assignedTeam?: Array<{ _id: string; name: string; email: string }>
  timeline?: Array<{ title: string; description?: string; date?: string }>
  tasks?: Array<{ title: string; status: string; assignedTo?: string }>
  documents?: Array<{ name: string; url: string }>
}

type Expense = {
  _id: string
  title: string
  amount: number
  type?: 'expense' | 'payment'
  category: string
  paymentMethod?: string
  date?: string
  notes?: string
}

type Payment = {
  _id: string
  title: string
  amount: number
  category: string
  paymentMethod?: string
  date?: string
  notes?: string
}

type User = {
  _id: string
  name: string
  email: string
}

type Vendor = {
  _id: string
  name: string
  type: string
  contact: {
    email: string
    phone: string
  }
  totalPaid: number
}

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'overview' | 'team' | 'vendors' | 'tasks' | 'timeline' | 'docs' | 'expenses'>('overview')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const allTransactions = [
    ...expenses.map(e => ({ ...e, transactionType: 'expense' as const })),
    ...payments.map(p => ({ ...p, transactionType: 'payment' as const })),
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

  const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      apiFetch<ProjectDetail>(`/api/projects/${id}`, { token }),
      apiFetch<User[]>('/api/users', { token }),
      apiFetch<Expense[]>(`/api/expenses?projectId=${id}`, { token }),
      apiFetch<Payment[]>(`/api/payments?projectId=${id}`, { token }),
      apiFetch<Vendor[]>(`/api/vendors?projectId=${id}`, { token }),
    ])
      .then(([projectData, usersData, expensesData, paymentsData, vendorsData]) => {
        setProject(projectData)
        setUsers(usersData)
        setExpenses(expensesData)
        setPayments(paymentsData)
        setVendors(vendorsData)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, token])

  const tabButtons = [
    { key: 'overview', label: 'Overview', icon: Timeline },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'vendors', label: 'Vendors', icon: Truck },
    { key: 'tasks', label: 'Tasks', icon: ListChecks },
    { key: 'timeline', label: 'Timeline', icon: Timeline },
    { key: 'docs', label: 'Documents', icon: FileText },
    { key: 'expenses', label: 'Transactions', icon: DollarSign },
  ] as const

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass h-10 w-40 animate-pulse rounded-2xl" />
        <div className="glass h-80 animate-pulse rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-300">{error}</div>
  }

  if (!project) {
    return <div className="text-white/70">Project not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-xl font-semibold">{project.projectName}</div>
          <div className="mt-1 text-xs text-white/60">Client: {project.clientName}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{project.status}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{project.progress}% complete</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="glass rounded-3xl p-4">
          <div className="text-xs text-white/60">Start</div>
          <div className="mt-1 font-semibold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</div>
        </div>
        <div className="glass rounded-3xl p-4">
          <div className="text-xs text-white/60">End</div>
          <div className="mt-1 font-semibold">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</div>
        </div>
        <div className="glass rounded-3xl p-4">
          <div className="text-xs text-white/60">Location</div>
          <div className="mt-1 font-semibold">{project.location ?? '-'}</div>
        </div>
        <div className="glass rounded-3xl p-4">
          <div className="text-xs text-white/60">Budget</div>
          <div className="mt-1 font-semibold">{project.budget ? `₹${project.budget.toLocaleString()}` : '-'}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabButtons.map((button) => {
          const active = tab === button.key
          const Icon = button.icon
          return (
            <button
              key={button.key}
              onClick={() => setTab(button.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                active ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {button.label}
            </button>
          )
        })}
      </div>

      <div className="glass rounded-3xl p-6">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="text-sm font-semibold">Project Overview</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs text-white/60">Description</div>
                <div className="mt-2 text-sm text-white/80">{project?.projectName} is currently in {project.status} phase.</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Team</div>
                <div className="mt-2 text-sm text-white/80">{project.assignedTeam?.length ? `${project.assignedTeam.length} user(s) assigned` : 'No team assigned yet.'}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'team' && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Team Members</div>
              <Button
                variant="secondary"
                onClick={() => setShowTeamModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Manage Team
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {project.assignedTeam && project.assignedTeam.length > 0 ? (
                project.assignedTeam.map((member) => (
                  <div key={member._id} className="glass flex items-center justify-between rounded-2xl p-4">
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-xs text-white/60">{member.email}</div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!project) return
                        const updated = project.assignedTeam?.filter((u) => u._id !== member._id) ?? []
                        await apiFetch(`/api/projects/${project._id}`, { token, method: 'PUT', body: { assignedTeam: updated.map((u) => u._id) } })
                        setProject({ ...project, assignedTeam: updated })
                      }}
                      className="rounded-xl bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60">No team members assigned.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'vendors' && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Vendors</div>
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard/vendors/new')}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Vendor
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <div key={vendor._id} className="glass flex items-center justify-between rounded-2xl p-4">
                    <div>
                      <div className="font-semibold">{vendor.name}</div>
                      <div className="text-xs text-white/60 capitalize">{vendor.type}</div>
                      <div className="text-xs text-white/60">{vendor.contact.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${vendor.totalPaid.toLocaleString()}</div>
                      <div className="text-xs text-white/60">Total Paid</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/vendors/${vendor._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60">No vendors assigned to this project.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            <div className="text-sm font-semibold">Tasks</div>
            <div className="mt-4 text-sm text-white/70">Task tracking and checklist will be shown here.</div>
          </div>
        )}

        {tab === 'timeline' && (
          <div>
            <div className="text-sm font-semibold">Timeline</div>
            <div className="mt-4 text-sm text-white/70">Project milestones and timeline events will be shown here.</div>
          </div>
        )}

        {tab === 'docs' && (
          <div>
            <div className="text-sm font-semibold">Documents</div>
            <div className="mt-4 text-sm text-white/70">Project documents and uploads will be shown here.</div>
          </div>
        )}

        {tab === 'expenses' && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Transactions</div>
              <Button
                variant="secondary"
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Expenses</div>
                <div className="mt-2 text-lg font-semibold">₹{totalExpenses.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Payments</div>
                <div className="mt-2 text-lg font-semibold">₹{totalPayments.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4">
              {allTransactions.length === 0 ? (
                <div className="text-sm text-white/60">No transactions logged for this project.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTransactions.map((transaction) => (
                        <tr key={transaction._id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-4">{transaction.title}</td>
                          <td className="px-4 py-4">{transaction.transactionType === 'payment' ? 'Payment' : 'Expense'}</td>
                          <td className="px-4 py-4">₹{transaction.amount.toLocaleString()}</td>
                          <td className="px-4 py-4">{transaction.category}</td>
                          <td className="px-4 py-4">{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-4">{transaction.notes ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showTeamModal && project && (
        <TeamModal
          project={project}
          allUsers={users}
          token={token}
          onClose={() => setShowTeamModal(false)}
          onSaved={(newTeam) => setProject({ ...project, assignedTeam: newTeam })}
        />
      )}

      {showExpenseModal && project && (
        <ExpenseModal
          projectId={project._id}
          token={token}
          onClose={() => setShowExpenseModal(false)}
          onSaved={(newTransaction) => {
            if (newTransaction.type === 'payment') {
              setPayments((prev) => [newTransaction as Payment, ...prev])
            } else {
              setExpenses((prev) => [newTransaction as Expense, ...prev])
            }
          }}
        />
      )}
    </div>
  )
}

export function TeamModal({
  project,
  allUsers,
  token,
  onClose,
  onSaved,
}: {
  project: ProjectDetail
  allUsers: User[]
  token: string
  onClose: () => void
  onSaved: (team: Array<{ _id: string; name: string; email: string }>) => void
}) {
  const [selected, setSelected] = useState<string[]>(project.assignedTeam?.map((u) => u._id) ?? [])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const save = async () => {
    const updatedTeam = allUsers.filter((u) => selected.includes(u._id))
    await apiFetch(`/api/projects/${project._id}`, { token, method: 'PUT', body: { assignedTeam: selected } })
    onSaved(updatedTeam)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Manage Team</div>
            <div className="text-xs text-white/60">Select users to assign to this project.</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 max-h-[450px] overflow-y-auto">
          {allUsers.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => toggle(user._id)}
              className={`flex w-full items-center justify-between rounded-2xl border border-white/10 p-4 text-left transition ${
                selected.includes(user._id) ? 'bg-primary/20' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-white/60">{user.email}</div>
              </div>
              <div className="text-xs text-white/60">{selected.includes(user._id) ? 'Selected' : 'Add'}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-primary/40 hover:bg-primary/90"
          >
            Save team
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExpenseModal({
  projectId,
  token,
  onClose,
  onSaved,
}: {
  projectId: string
  token: string
  onClose: () => void
  onSaved: (transaction: Expense & { type?: 'expense' | 'payment' }) => void
}) {
  const [form, setForm] = useState<Partial<Expense & { type?: 'expense' | 'payment' }>>({
    title: '',
    amount: 0,
    type: 'expense',
    category: 'Miscellaneous',
    paymentMethod: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const apiEndpoint = form.type === 'payment' ? '/api/payments' : '/api/expenses'
      const transaction = await apiFetch<Expense>(apiEndpoint, {
        token,
        method: 'POST',
        body: { ...form, project: projectId },
      })
      onSaved(transaction)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Add Transaction</div>
            <div className="text-xs text-white/60">Log an expense or payment against this project.</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            required
            value={form.title ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            placeholder="Title"
          />
          <input
            required
            type="number"
            value={form.amount ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            placeholder="Amount"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={form.type ?? 'expense'}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'expense' | 'payment' }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="expense">Expense</option>
              <option value="payment">Payment</option>
            </select>
            <select
              value={form.category ?? 'Miscellaneous'}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="Labor">Labor</option>
              <option value="Material">Material</option>
              <option value="Equipment">Equipment</option>
              <option value="Transport">Transport</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
            <input
              value={form.paymentMethod ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Payment method"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="date"
              value={form.date ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            />
            <input
              value={form.notes ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Notes"
            />
          </div>
          {error && <div className="text-sm text-red-300">{error}</div>}
          <div className="flex justify-end gap-2">
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
              {saving ? 'Saving...' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
