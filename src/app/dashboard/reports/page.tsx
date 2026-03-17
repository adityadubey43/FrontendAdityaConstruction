'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type ProjectSummary = {
  projectId: string
  projectName?: string
  expenseTotal: number
  paymentTotal: number
  billTotal: number
}

type ReportsData = {
  totalLeads: number
  activeProjects: number
  totalExpenses: number
  totalRevenue: number
  projectSummaries?: ProjectSummary[]
}

type MonthlyExpense = {
  month: string
  total: number
}

type VendorAnalytics = {
  topVendors: Array<{
    name: string
    type: string
    totalPaid: number
    paymentCount: number
  }>
  monthlyVendorPayments: Array<{
    month: string
    total: number
  }>
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([])
  const [monthlyLoading, setMonthlyLoading] = useState(true)
  const [monthlyError, setMonthlyError] = useState<string | null>(null)

  const [vendorAnalytics, setVendorAnalytics] = useState<VendorAnalytics | null>(null)
  const [vendorLoading, setVendorLoading] = useState(true)
  const [vendorError, setVendorError] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''
    setLoading(true)
    apiFetch<ReportsData>('/api/reports/dashboard', { token })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''
    setMonthlyLoading(true)
    apiFetch<MonthlyExpense[]>('/api/reports/monthly-expenses', { token })
      .then(setMonthlyExpenses)
      .catch((e) => setMonthlyError(e instanceof Error ? e.message : 'Failed to load monthly expenses'))
      .finally(() => setMonthlyLoading(false))
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''
    setVendorLoading(true)
    apiFetch<VendorAnalytics>('/api/reports/vendor-analytics', { token })
      .then(setVendorAnalytics)
      .catch((e) => setVendorError(e instanceof Error ? e.message : 'Failed to load vendor analytics'))
      .finally(() => setVendorLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Reports</div>
        <div className="mt-2 text-xs text-white/60">Real-time totals and project financial summaries.</div>
      </div>

      {error && <div className="text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="glass h-24 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-3xl p-5"
            >
              <div className="text-xs text-white/60">Total Leads</div>
              <div className="mt-2 text-2xl font-semibold">{data?.totalLeads ?? '—'}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-3xl p-5"
            >
              <div className="text-xs text-white/60">Active Projects</div>
              <div className="mt-2 text-2xl font-semibold">{data?.activeProjects ?? '—'}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-3xl p-5"
            >
              <div className="text-xs text-white/60">Total Expenses</div>
              <div className="mt-2 text-2xl font-semibold">₹{data ? data.totalExpenses.toLocaleString('en-IN') : '—'}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="glass rounded-3xl p-5"
            >
              <div className="text-xs text-white/60">Total Payment Received</div>
              <div className="mt-2 text-2xl font-semibold">₹{data ? data.totalRevenue.toLocaleString('en-IN') : '—'}</div>
            </motion.div>
          </div>

          {data?.projectSummaries && data.projectSummaries.length > 0 ? (
            <div className="glass rounded-3xl p-5">
              <div className="text-sm font-semibold">Project financial breakdown</div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                    <tr>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Expenses</th>
                      <th className="px-4 py-3">Payment Received</th>
                      <th className="px-4 py-3">Total Bills</th>
                      <th className="px-4 py-3">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projectSummaries.map((proj) => (
                      <tr key={proj.projectId} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-4 py-4">{proj.projectName ?? 'Unknown'}</td>
                        <td className="px-4 py-4">₹{proj.expenseTotal.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4">₹{proj.paymentTotal.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4">₹{(proj.billTotal || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4">₹{(proj.paymentTotal - proj.expenseTotal).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-6 text-sm text-white/60">No project financial summaries available yet.</div>
          )}

          <div className="glass rounded-3xl p-5">
            <div className="text-sm font-semibold">Monthly Expenses</div>
            {monthlyError && <div className="text-sm text-red-300 mt-2">{monthlyError}</div>}
            {monthlyLoading ? (
              <div className="h-64 animate-pulse bg-white/10 rounded mt-4" />
            ) : monthlyExpenses.length > 0 ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="month" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #ffffff20',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="total" fill="#ffc460" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">No monthly expense data available yet.</div>
            )}
          </div>

          <div className="glass rounded-3xl p-5">
            <div className="text-sm font-semibold">Vendor Analytics</div>
            {vendorError && <div className="text-sm text-red-300 mt-2">{vendorError}</div>}
            {vendorLoading ? (
              <div className="h-64 animate-pulse bg-white/10 rounded mt-4" />
            ) : vendorAnalytics ? (
              <div className="mt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Top Vendors by Payment</h4>
                  <div className="space-y-2">
                    {vendorAnalytics.topVendors.map((vendor, index) => (
                      <div key={vendor.name} className="flex items-center justify-between py-2 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white/60">#{index + 1}</span>
                          <div>
                            <div className="text-sm font-medium">{vendor.name}</div>
                            <div className="text-xs text-white/60 capitalize">{vendor.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">₹{(vendor.totalPaid ?? 0).toLocaleString()}</div>
                          <div className="text-xs text-white/60">{vendor.paymentCount} payments</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Monthly Vendor Payment Received</h4>
                  {vendorAnalytics.monthlyVendorPayments.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={vendorAnalytics.monthlyVendorPayments}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="month" stroke="#ffffff60" />
                          <YAxis stroke="#ffffff60" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #ffffff20',
                              borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#ffffff' }}
                            itemStyle={{ color: '#ffffff' }}
                          />
                          <Bar dataKey="total" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-sm text-white/60">No vendor payment data available yet.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">No vendor analytics data available yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
