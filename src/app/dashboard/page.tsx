'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/api'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Link from 'next/link'

type MonthlyExpense = {
  month: string
  total: number
}

type ExpenseType = {
  category: string
  total: number
  count: number
}

export default function DashboardHome() {
  const [data, setData] = useState<
    | {
        totalLeads: number
        activeProjects: number
        totalExpenses: number
        totalRevenue: number
        totalBills: number
        projectSummaries?: Array<{
          projectId: string
          projectName?: string
          expenseTotal: number
          paymentTotal: number
          billTotal: number
          netTotal?: number
        }>
      }
    | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  const [fromDate, setFromDate] = useState<string | undefined>(undefined)
  const [toDate, setToDate] = useState<string | undefined>(undefined)

  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([])
  const [monthlyLoading, setMonthlyLoading] = useState(true)
  const [monthlyError, setMonthlyError] = useState<string | null>(null)

  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([])
  const [expenseTypesLoading, setExpenseTypesLoading] = useState(true)
  const [expenseTypesError, setExpenseTypesError] = useState<string | null>(null)

  // Colors for pie chart
  const COLORS = ['#ffc460', '#ff8c42', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd']

  useEffect(() => {
    const token = localStorage.getItem('acls_token') || ''
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    apiFetch<{
      totalLeads: number
      activeProjects: number
      totalExpenses: number
      totalRevenue: number
      totalBills: number
      projectSummaries?: Array<{
        projectId: string
        projectName?: string
        expenseTotal: number
        paymentTotal: number
        billTotal: number
        netTotal?: number
      }>
    }>(`/api/reports/dashboard?${params.toString()}`, {
      token,
    })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [fromDate, toDate])

  useEffect(() => {
    const token = localStorage.getItem('acls_token') || ''
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)

    setMonthlyLoading(true)
    apiFetch<MonthlyExpense[]>(`/api/reports/monthly-expenses?${params.toString()}`, { token })
      .then(setMonthlyExpenses)
      .catch((e) => setMonthlyError(e instanceof Error ? e.message : 'Failed to load monthly expenses'))
      .finally(() => setMonthlyLoading(false))
  }, [fromDate, toDate])

  useEffect(() => {
    const token = localStorage.getItem('acls_token') || ''
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)

    setExpenseTypesLoading(true)
    apiFetch<ExpenseType[]>(`/api/reports/expense-types?${params.toString()}`, { token })
      .then(setExpenseTypes)
      .catch((e) => setExpenseTypesError(e instanceof Error ? e.message : 'Failed to load expense types'))
      .finally(() => setExpenseTypesLoading(false))
  }, [fromDate, toDate])

  const cards = [
    { label: 'Total Leads', value: data?.totalLeads ?? '—' },
    { label: 'Active Projects', value: data?.activeProjects ?? '—' },
    { label: 'Total Expenses', value: data ? `₹${Math.round(data.totalExpenses).toLocaleString('en-IN')}` : '—' },
    { label: 'Total Bills', value: data ? `₹${Math.round(data.totalBills).toLocaleString('en-IN')}` : '—' },
    { label: 'Total Payment Received', value: data ? `₹${Math.round(data.totalRevenue).toLocaleString('en-IN')}` : '—' },
    { label: 'Pending Bills', value: data ? `₹${Math.round(data.totalBills - data.totalRevenue).toLocaleString('en-IN')}` : '—' },
  ]

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xl font-semibold">Dashboard</div>
          <div className="mt-1 text-xs text-white/60">Overview of leads, projects, and expenses.</div>
        </div>
        <DateRangeFilter
          label="Date range"
          from={fromDate}
          to={toDate}
          onChange={({ from, to }) => {
            setFromDate(from)
            setToDate(to)
          }}
        />
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
                  <th className="px-4 py-3">Total Bills</th>
                  <th className="px-4 py-3">Profit/Loss</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.projectSummaries.slice(0, 6).map((project) => (
                  <tr key={project.projectId} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-4">{project.projectName || 'Unknown'}</td>
                    <td className="px-4 py-4">₹{Math.round(project.expenseTotal).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4">₹{Math.round(project.paymentTotal).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4">₹{Math.round(project.billTotal || 0).toLocaleString('en-IN')}</td>
                    <td className={`px-4 py-4 ${(project.netTotal || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{Math.round(project.netTotal || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/projects/${project.projectId}`}>
                        <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors">
                          Details
                        </button>
                      </Link>
                    </td>
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
        <div className="glass h-[320px] rounded-3xl p-5">
          <div className="text-sm font-semibold">Expense Types</div>
          {expenseTypesError && <div className="text-sm text-red-300 mt-2">{expenseTypesError}</div>}
          {expenseTypesLoading ? (
            <div className="h-64 animate-pulse bg-white/10 rounded mt-4" />
          ) : expenseTypes.length > 0 ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {expenseTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/60">No expense data available yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
