'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api'
import { ArrowLeft, DollarSign, Save } from 'lucide-react'
import Link from 'next/link'

interface Project {
  _id: string
  name: string
}

interface Vendor {
  _id: string
  name: string
  projects: Array<{
    _id: string
    name: string
  }>
}

export default function RecordPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    method: 'cash' as 'cash' | 'check' | 'bank_transfer' | 'credit_card',
    projectId: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (params.id) {
      fetchVendor()
    }
  }, [params.id])

  const fetchVendor = async () => {
    try {
      const data = await apiFetch(`/api/vendors/${params.id}`)
      setVendor(data)
      if (data.projects.length > 0) {
        setFormData(prev => ({ ...prev, projectId: data.projects[0]._id }))
      }
    } catch (error) {
      console.error('Failed to fetch vendor:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiFetch(`/api/vendors/payment`, {
        method: 'POST',
        body: {
          vendorId: params.id,
          ...formData,
          amount: parseFloat(formData.amount)
        }
      })
      router.push(`/dashboard/vendors/${params.id}`)
    } catch (error) {
      console.error('Failed to record payment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!vendor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-white/60">Loading vendor...</div>
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/vendors/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendor
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Record Payment</h1>
          <p className="text-white/60">Record a payment to {vendor.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Payment Method *</Label>
          <Select
            value={formData.method}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {vendor.projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Payment Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link href={`/dashboard/vendors/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </motion.div>
  )
}