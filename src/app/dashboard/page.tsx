'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/api'

export default function DashboardHome() {
  const [data, setData] = useState<
    | {
        totalLeads: number
        activeProjects: number
        totalExpenses: number
        totalRevenue: number
        projectSummaries?: Array<{
          projectId: string
          projectName?: string
          expenseTotal: number
          paymentTotal: number
        }>
      }
    | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('acls_token') || ''
    apiFetch<{
      totalLeads: number
      activeProjects: number
      totalExpenses: number
      totalRevenue: number
      projectSummaries?: Array<{
        projectId: string
        projectName?: string
        expenseTotal: number
        paymentTotal: number
      }>
    }>('/api/reports/dashboard', {
      token,
    })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  const cards = [
    { label: 'Total Leads', value: data?.totalLeads ?? '—' },
    { label: 'Active Projects', value: data?.activeProjects ?? '—' },
    { label: 'Total Expenses', value: data ? `₹${Math.round(data.totalExpenses).toLocaleString('en-IN')}` : '—' },
    { label: 'Total Payment Received', value: data ? `₹${Math.round(data.totalRevenue).toLocaleString('en-IN')}` : '—' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Dashboard</div>
          <div className="mt-1 text-xs text-white/60">Overview of leads, projects, and expenses.</div>
        </div>
      </div>

      {error && <div className="mt-4 text-xs text-red-300">{error}</div>}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, idx) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.05 }}
            className="glass rounded-3xl p-5"
          >
            <div className="text-xs text-white/60">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold">{c.value}</div>
          </motion.div>
        ))}
      </div>

      {data?.projectSummaries && data.projectSummaries.length > 0 && (
        <div className="mt-6 glass rounded-3xl p-5">
          <div className="text-sm font-semibold">Project financials</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Expenses</th>
                  <th className="px-4 py-3">Payment Received</th>
                </tr>
              </thead>
              <tbody>
                {data.projectSummaries.slice(0, 6).map((project) => (
                  <tr key={project.projectId} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-4">{project.projectName || 'Unknown'}</td>
                    <td className="px-4 py-4">₹{Math.round(project.expenseTotal).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4">₹{Math.round(project.paymentTotal).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.projectSummaries.length > 6 && (
            <div className="mt-3 text-xs text-white/60">Showing top 6 projects by activity.</div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="glass h-[320px] rounded-3xl p-5">
          <div className="text-sm font-semibold">Monthly Expenses</div>
          <div className="mt-2 text-xs text-white/60">Chart wiring comes next.</div>
        </div>
        <div className="glass h-[320px] rounded-3xl p-5">
          <div className="text-sm font-semibold">Lead Conversion</div>
          <div className="mt-2 text-xs text-white/60">Pipeline view comes next.</div>
        </div>
      </div>
    </div>
  )
}
