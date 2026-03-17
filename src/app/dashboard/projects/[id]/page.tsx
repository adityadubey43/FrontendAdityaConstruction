"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { ArrowLeft, FileText, ListChecks, Clock, Users, DollarSign, Plus, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

type Bill = {
  _id: string
  billNumber: string
  title: string
  amount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  billDate: string
  dueDate: string
  clientName: string
  description?: string
  notes?: string
  items?: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  taxAmount?: number
  discountAmount?: number
}

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'overview' | 'team' | 'vendors' | 'tasks' | 'timeline' | 'docs' | 'expenses' | 'bills'>('overview')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0)
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const totalBills = bills.reduce((sum, bill) => sum + bill.totalAmount, 0)

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
      apiFetch<Bill[]>(`/api/bills?projectId=${id}`, { token }),
    ])
      .then(([projectData, usersData, expensesData, paymentsData, vendorsData, billsData]) => {
        setProject(projectData)
        setUsers(usersData)
        setExpenses(expensesData)
        setPayments(paymentsData)
        setVendors(vendorsData)
        setBills(billsData)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, token])

  const tabButtons = [
    { key: 'overview', label: 'Overview', icon: Clock },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'vendors', label: 'Vendors', icon: Truck },
    { key: 'tasks', label: 'Tasks', icon: ListChecks },
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'docs', label: 'Documents', icon: FileText },
    { key: 'expenses', label: 'Transactions', icon: DollarSign },
    { key: 'bills', label: 'Bills', icon: FileText },
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
          <div className="text-xs text-white/60">Estimate</div>
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
                        await apiFetch(`/api/projects/${project._id}`, { token, method: 'PATCH', body: { assignedTeam: updated.map((u) => u._id) } })
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
                      <div className="text-sm font-semibold">₹{vendor.totalPaid.toLocaleString()}</div>
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
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Expenses</div>
                <div className="mt-2 text-lg font-semibold">₹{totalExpenses.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Payments</div>
                <div className="mt-2 text-lg font-semibold">₹{totalPayments.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Bills</div>
                <div className="mt-2 text-lg font-semibold">₹{totalBills.toLocaleString()}</div>
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

        {tab === 'bills' && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Bills</div>
              <Button
                variant="secondary"
                onClick={() => setShowBillModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Raise Bill
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Bills</div>
                <div className="mt-2 text-lg font-semibold">{bills.length}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Total Amount</div>
                <div className="mt-2 text-lg font-semibold">₹{bills.reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-white/60">Paid Bills</div>
                <div className="mt-2 text-lg font-semibold">{bills.filter(bill => bill.status === 'paid').length}</div>
              </div>
            </div>
            <div className="mt-4">
              {bills.length === 0 ? (
                <div className="text-sm text-white/60">No bills raised for this project.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                      <tr>
                        <th className="px-4 py-3">Bill Number</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) => (
                        <tr key={bill._id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-4 font-medium">{bill.billNumber}</td>
                          <td className="px-4 py-4">{bill.title}</td>
                          <td className="px-4 py-4">{bill.clientName}</td>
                          <td className="px-4 py-4">₹{bill.totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={
                                bill.status === 'paid' ? 'default' :
                                bill.status === 'sent' ? 'secondary' :
                                bill.status === 'overdue' ? 'destructive' :
                                'outline'
                              }
                            >
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-4">{new Date(bill.billDate).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <Button size="sm" variant="secondary" onClick={() => { setEditingBill(bill); setShowBillModal(true); }}>
                              Edit
                            </Button>
                          </td>
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

      {showBillModal && project && (
        <BillModal
          projectId={project._id}
          token={token}
          onClose={() => { setShowBillModal(false); setEditingBill(null); }}
          onSaved={(newBill) => {
            if (editingBill) {
              setBills(prev => prev.map(b => b._id === newBill._id ? newBill : b))
            } else {
              setBills((prev) => [newBill, ...prev])
            }
          }}
          bill={editingBill}
        />
      )}
    </div>
  )
}

function TeamModal({
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
    await apiFetch(`/api/projects/${project._id}`, { token, method: 'PATCH', body: { assignedTeam: selected } })
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

function ExpenseModal({
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

function BillModal({
  projectId,
  token,
  onClose,
  onSaved,
  bill,
}: {
  projectId: string
  token: string
  onClose: () => void
  onSaved: (bill: Bill) => void
  bill?: Bill | null
}) {
  const [form, setForm] = useState<Partial<Bill>>({
    title: '',
    billDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    clientName: '',
    description: '',
    notes: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    taxAmount: 0,
    discountAmount: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<Array<{ _id: string; clientName: string }>>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    if (bill) {
      setForm({
        title: bill.title,
        billDate: bill.billDate ? new Date(bill.billDate).toISOString().slice(0, 10) : '',
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0, 10) : '',
        clientName: bill.clientName,
        description: bill.description || '',
        notes: bill.notes || '',
        items: bill.items || [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        taxAmount: bill.taxAmount || 0,
        discountAmount: bill.discountAmount || 0,
      })
    } else {
      setForm({
        title: '',
        billDate: new Date().toISOString().slice(0, 10),
        dueDate: '',
        clientName: '',
        description: '',
        notes: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        taxAmount: 0,
        discountAmount: 0,
      })
    }
  }, [bill])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiFetch<Array<{ _id: string; clientName: string }>>('/api/projects', { token })
        setProjects(data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [token])

  // Get unique client names from projects
  const uniqueClients = Array.from(new Set(projects.map(p => p.clientName).filter(Boolean))).sort()

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [...(f.items || []), { description: '', quantity: 1, rate: 0, amount: 0 }]
    }))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    setForm((f) => {
      const items = [...(f.items || [])]
      items[index] = { ...items[index], [field]: value }
      if (field === 'quantity' || field === 'rate') {
        items[index].amount = items[index].quantity * items[index].rate
      }
      return { ...f, items }
    })
  }

  const removeItem = (index: number) => {
    setForm((f) => ({
      ...f,
      items: (f.items || []).filter((_, i) => i !== index)
    }))
  }

  const calculateTotal = () => {
    const subtotal = (form.items || []).reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * ((form.taxAmount || 0) / 100)
    const discountAmount = (form.discountAmount || 0)
    return subtotal + taxAmount - discountAmount
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const billData = {
        ...form,
        project: projectId,
        amount: (form.items || []).reduce((sum, item) => sum + item.amount, 0),
        totalAmount: calculateTotal(),
      }
      const url = bill ? `/api/bills/${bill._id}` : '/api/bills'
      const method = bill ? 'PATCH' : 'POST'
      const billResponse = await apiFetch<Bill>(url, {
        token,
        method,
        body: billData,
      })
      onSaved(billResponse)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-[#1b1b1f] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{bill ? 'Edit Bill' : 'Raise Bill'}</div>
            <div className="text-xs text-white/60">{bill ? 'Update the bill details.' : 'Create an invoice for this project.'}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={form.title ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Bill Title"
            />
            <select
              required
              value={form.clientName ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
              disabled={loadingProjects}
            >
              <option value="">Select Client</option>
              {uniqueClients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              type="date"
              value={form.billDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, billDate: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            />
            <input
              required
              type="date"
              value={form.dueDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Due Date"
            />
          </div>

          <textarea
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            placeholder="Description"
            rows={2}
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Items</div>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {(form.items || []).map((item, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-5 items-end">
                  <input
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    placeholder="Description"
                  />
                  <input
                    required
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    placeholder="Qty"
                    min="1"
                  />
                  <input
                    required
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                    placeholder="Rate"
                    step="0.01"
                  />
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
                    ₹{item.amount.toLocaleString()}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={(form.items || []).length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs text-white/60">Subtotal</label>
              <div className="text-lg font-semibold">₹{(form.items || []).reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</div>
            </div>
            <input
              type="number"
              value={form.taxAmount ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, taxAmount: parseFloat(e.target.value) || 0 }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Tax %"
              step="0.01"
            />
            <input
              type="number"
              value={form.discountAmount ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, discountAmount: parseFloat(e.target.value) || 0 }))}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Discount"
              step="0.01"
            />
          </div>

          <div className="text-right">
            <div className="text-sm text-white/60">Total Amount</div>
            <div className="text-xl font-bold">₹{calculateTotal().toLocaleString()}</div>
          </div>

          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
            placeholder="Notes"
            rows={2}
          />

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
              {saving ? (bill ? 'Updating...' : 'Creating...') : (bill ? 'Update Bill' : 'Create Bill')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
