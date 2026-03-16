'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Project {
  _id: string
  projectName: string
}

export default function EditVendorPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorType: 'Material Supplier',
    companyName: '',
    email: '',
    phoneNumber: '',
    address: '',
    projectId: ''
  })

  const fetchVendor = useCallback(async () => {
    try {
      const data = await apiFetch<{ vendorName: string; vendorType: string; companyName: string; email: string; phoneNumber: string; address: string; assignedProjects?: Array<{ _id: string }> }>(`/api/vendors/${params.id}`)
      setFormData({
        vendorName: data.vendorName,
        vendorType: data.vendorType,
        companyName: data.companyName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        projectId: data.assignedProjects?.[0]?._id || ''
      })
    } catch (error) {
      console.error('Failed to fetch vendor:', error)
    } finally {
      setFetchLoading(false)
    }
  }, [params.id])

  const fetchProjects = useCallback(async () => {
    try {
      const data = await apiFetch<Project[]>('/api/projects')
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchVendor()
      fetchProjects()
    }
  }, [params.id, fetchVendor, fetchProjects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiFetch(`/api/vendors/${params.id}`, {
        method: 'PATCH',
        body: {
          vendorName: formData.vendorName,
          vendorType: formData.vendorType,
          companyName: formData.companyName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          assignedProjects: formData.projectId ? [formData.projectId] : []
        }
      })
      router.push(`/dashboard/vendors/${params.id}`)
    } catch (error) {
      console.error('Failed to update vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
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
          <h1 className="text-2xl font-bold text-white">Edit Vendor</h1>
          <p className="text-white/60">Update vendor information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name *</Label>
            <Input
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorType">Vendor Type *</Label>
            <Select
              value={formData.vendorType}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, vendorType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectId">Assigned Project</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value: string) => setFormData((prev) => ({ ...prev, projectId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Updating...' : 'Update Vendor'}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link href={`/dashboard/vendors/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </motion.div>
  )
}