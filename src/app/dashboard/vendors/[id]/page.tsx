'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { ArrowLeft, Edit, Trash2, Banknote, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Vendor {
  _id: string
  name: string
  type: 'material' | 'labor' | 'equipment' | 'service'
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
    projectName: string
  }>
  totalPaid: number
  createdAt: string
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchVendor = useCallback(async () => {
    try {
      const data = await apiFetch<Vendor>(`/api/vendors/${params.id}`)
      setVendor(data)
    } catch (error) {
      console.error('Failed to fetch vendor:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchVendor()
    }
  }, [params.id, fetchVendor])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor?')) return

    try {
      await apiFetch(`/api/vendors/${params.id}`, { method: 'DELETE' })
      router.push('/dashboard/vendors')
    } catch (error) {
      console.error('Failed to delete vendor:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-white/60">Loading vendor details...</div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-white/60">Vendor not found</div>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/vendors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vendors
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{vendor.name}</h1>
            <p className="text-white/60">Vendor Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/dashboard/vendors/${vendor._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Basic Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {vendor.type}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/60" />
                <span>{vendor.contact.email}</span>
              </div>
              {vendor.contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span>{vendor.contact.phone}</span>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-white/60" />
                  <span>{vendor.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-white/60" />
                <span>Added {new Date(vendor.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Assigned Projects</h2>
            {vendor.projects.length > 0 ? (
              <div className="space-y-2">
                {vendor.projects.map((project) => (
                  <div key={project._id} className="flex items-center justify-between">
                    <span>{project.projectName}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project._id}`}>
                        View Project
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60">No projects assigned</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Payment Summary</h2>
              <Button asChild>
                <Link href={`/dashboard/vendors/${vendor._id}/payment`}>
                  <Banknote className="mr-2 h-4 w-4" />
                  Record Payment
                </Link>
              </Button>
            </div>
            <div className="text-3xl font-bold text-white">
              ₹{(vendor.totalPaid ?? 0).toLocaleString()}
            </div>
            <p className="text-white/60">Total Paid</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Payment History</h2>
            {vendor.paymentHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Project</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.paymentHistory.slice(0, 5).map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell>{payment.projectName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-white/60">No payment history</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}