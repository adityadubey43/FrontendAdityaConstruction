'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/lib/api'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface Vendor {
  _id: string
  name: string
  companyName: string
  type: string
  contact: {
    email: string
    phone: string
  }
  address: string
  projects: Array<{
    _id: string
    projectName: string
  }>
  paymentHistory: Array<{
    _id: string
    amount: number
    date: string
    method: string
    projectId: string
    projectName?: string
    status?: string
    notes?: string
  }>
  totalPaid: number
  createdAt: string
}

export default function VendorsPage() {
  const [showPayModal, setShowPayModal] = useState(false)
  const [payingVendor, setPayingVendor] = useState<Vendor | null>(null)
  const [projects, setProjects] = useState<Array<{ _id: string; projectName: string }>>([])
  const [payForm, setPayForm] = useState({
    amount: '',
    project: '',
    category: 'Miscellaneous',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await apiFetch<Array<{ _id: string; projectName: string }>>('/api/projects')
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<Vendor[]>('/api/vendors')
      setVendors(data)
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter((vendor: Vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase()) ||
                         vendor.contact.email.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || vendor.type === typeFilter
    return matchesSearch && matchesType
  })

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingVendor) return

    try {
      const parsedAmount = Number(payForm.amount.replace(/[^0-9.\-]/g, ''))
      const project = projects.find(p => p._id === payForm.project)
      if (!project) return

      await apiFetch('/api/expenses', {
        method: 'POST',
        body: {
          title: `Payment to ${payingVendor.name}`,
          amount: parsedAmount,
          category: payForm.category,
          project: project._id,
          vendor: payingVendor._id,
          date: payForm.date,
          notes: payForm.notes,
          type: 'expense',
        },
      })

      setShowPayModal(false)
      setPayingVendor(null)
      setPayForm({
        amount: '',
        project: '',
        category: 'Miscellaneous',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
      })
      // Refresh vendors to update totalPaid
      fetchVendors()
    } catch (error) {
      console.error('Failed to record payment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return
    try {
      await apiFetch(`/api/vendors/${id}`, { method: 'DELETE' })
      setVendors(vendors.filter(v => v._id !== id))
    } catch (error) {
      console.error('Failed to delete vendor:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-white/60">Loading vendors...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-white/60">Manage your construction vendors and suppliers</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vendors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Material Supplier">Material Supplier</SelectItem>
            <SelectItem value="Labor Contractor">Labor Contractor</SelectItem>
            <SelectItem value="Equipment Supplier">Equipment Supplier</SelectItem>
            <SelectItem value="Electrician">Electrician</SelectItem>
            <SelectItem value="Plumber">Plumber</SelectItem>
            <SelectItem value="Carpenter">Carpenter</SelectItem>
            <SelectItem value="Transport Vendor">Transport Vendor</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {vendor.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{vendor.contact.email}</div>
                    <div className="text-white/60">{vendor.contact.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[160px] truncate text-sm">
                    {vendor.projects && vendor.projects.length > 0
                      ? vendor.projects
                          .map((p: { projectName?: string; name?: string } | string) => 
                            typeof p === 'string' ? p : (p.projectName ?? p.name ?? 'Unknown')
                          )
                          .slice(0, 2)
                          .join(', ') +
                        (vendor.projects.length > 2 ? ` +${vendor.projects.length - 2}` : '')
                      : 'None'}
                  </div>
                </TableCell>
                <TableCell>₹{(vendor.totalPaid ?? 0).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/vendors/${vendor._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/vendors/${vendor._id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPayingVendor(vendor)
                        setShowPayModal(true)
                      }}
                      className="text-green-400 hover:text-green-300"
                    >
                      Pay
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(vendor._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredVendors.length === 0 && (
          <div className="py-12 text-center text-white/60">
            No vendors found matching your criteria.
          </div>
        )}
      </div>

      {showPayModal && payingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#1b1b1f] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Pay Vendor</div>
                <div className="text-xs text-white/60">Record payment to {payingVendor.name}</div>
              </div>
              <button
                onClick={() => {
                  setShowPayModal(false)
                  setPayingVendor(null)
                  setPayForm({
                    amount: '',
                    project: '',
                    category: 'Miscellaneous',
                    date: new Date().toISOString().slice(0, 10),
                    notes: '',
                  })
                }}
                className="text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePay} className="mt-6 grid gap-3">
              <select
                required
                value={payForm.project}
                onChange={(e) => setPayForm((f) => ({ ...f, project: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectName}
                  </option>
                ))}
              </select>

              <input
                required
                type="text"
                value={payForm.amount}
                onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
                placeholder="Amount (e.g. 1234.56)"
              />

              <select
                required
                value={payForm.category}
                onChange={(e) => setPayForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="Labor">Labor</option>
                <option value="Material">Material</option>
                <option value="Equipment">Equipment</option>
                <option value="Transport">Transport</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              <input
                type="date"
                value={payForm.date}
                onChange={(e) => setPayForm((f) => ({ ...f, date: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              />

              <input
                value={payForm.notes}
                onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
                placeholder="Notes"
              />

              <Button type="submit" className="mt-4">
                Record Payment
              </Button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}