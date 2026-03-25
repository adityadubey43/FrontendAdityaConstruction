'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { apiFetch } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import {
  TrendingUp, AlertTriangle, TrafficCone,
  DollarSign, Activity, Target, Truck
} from 'lucide-react'
import { DateRangeFilter } from '@/components/ui/date-range-filter'

// --- Types ---
type Project = { _id: string, projectName: string, status: string, budget?: number, endDate?: string, progress?: number }
type Expense = { _id: string, amount: number, category: string, date: string, project?: Project | string }
type Payment = { _id: string, amount: number, date: string, project?: Project | string }
type Bill = { _id: string, totalAmount: number, status: string, dueDate: string, clientName: string, project?: Project | string }
type Vendor = { _id: string, name: string, type: string, totalPaid: number }

export default function AdvancedReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [projects, setProjects] = useState<Project[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [fromDate, setFromDate] = useState<string | undefined>(undefined)
  const [toDate, setToDate] = useState<string | undefined>(undefined)

  const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)

    Promise.all([
      apiFetch<Project[]>('/api/projects', { token }),
      apiFetch<Expense[]>(`/api/expenses?${params.toString()}`, { token }),
      apiFetch<Payment[]>(`/api/payments?${params.toString()}`, { token }),
      apiFetch<Bill[]>(`/api/bills?${params.toString()}`, { token }),
      apiFetch<Vendor[]>('/api/vendors', { token })
    ])
      .then(([projData, expData, payData, billData, venData]) => {
        setProjects(projData)
        setExpenses(expData)
        setPayments(payData)
        setBills(billData)
        setVendors(venData)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load report data'))
      .finally(() => setLoading(false))
  }, [fromDate, toDate, token])

  // --- Calculations & Memoizations ---

  // 1. Cash Flow Forecast & Revenue Collection
  const { totalOverdue, cashFlowIn, cashFlowOut } = useMemo(() => {
    let overdue = 0, pending = 0
    const now = new Date()
    bills.forEach(b => {
      // Assuming missing due date means not overdue yet, but usually it exists
      if (b.status === 'overdue' || (b.status !== 'paid' && new Date(b.dueDate) < now)) {
        overdue += b.totalAmount
      } else if (b.status === 'sent' || b.status === 'draft') {
        pending += b.totalAmount
      }
    })

    // simplistic forecast: next 30 days based on last 30 days run rate, plus pending bills
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo).reduce((acc, e) => acc + (e.amount || 0), 0)
    
    return {
      totalOverdue: overdue,
      totalPendingCollection: pending,
      cashFlowIn: pending + overdue, // expected to come in
      cashFlowOut: recentExpenses // estimated fixed burn rate
    }
  }, [bills, expenses])

  // 2. Cost Overrun & Project Profitability
  const projectStats = useMemo(() => {
    return projects.map(p => {
      const pId = p._id
      const pExpenses = expenses.filter(e => {
        if (typeof e.project === 'string') return e.project === pId
        return e.project?._id === pId
      }).reduce((acc, e) => acc + (e.amount || 0), 0)

      const pPayments = payments.filter(pay => {
        if (typeof pay.project === 'string') return pay.project === pId
        return pay.project?._id === pId
      }).reduce((acc, pay) => acc + (pay.amount || 0), 0)

      const budget = p.budget || 0
      const isOverBudget = budget > 0 && pExpenses > budget
      const overrunAmt = pExpenses - budget
      const profit = pPayments - pExpenses
      const margin = pPayments > 0 ? ((profit / pPayments) * 100).toFixed(1) : 0

      // Delayed detection
      const isDelayed = p.endDate && p.status !== 'Completed' && new Date(p.endDate) < new Date()

      return {
        ...p,
        totalExpenses: pExpenses,
        totalPayments: pPayments,
        profit,
        margin,
        isOverBudget,
        overrunAmt,
        isDelayed
      }
    }).sort((a, b) => b.profit - a.profit)
  }, [projects, expenses, payments])

  // Top Insights Auto-Generated
  const GenerateInsights = () => {
    const insights = []
    
    const mostProfitable = [...projectStats].filter(p => p.profit > 0).sort((a,b)=>b.profit - a.profit)[0]
    if (mostProfitable) insights.push({ type: 'success', text: `"${mostProfitable.projectName}" is driving the highest profit (₹${mostProfitable.profit.toLocaleString()}).` })

    const overBudgetSites = projectStats.filter(p => p.isOverBudget)
    if (overBudgetSites.length > 0) insights.push({ type: 'danger', text: `${overBudgetSites.length} project(s) including "${overBudgetSites[0].projectName}" have drastically crossed their estimated budget.` })

    const topVendor = [...vendors].sort((a,b) => b.totalPaid - a.totalPaid)[0]
    if (topVendor) insights.push({ type: 'warning', text: `Vendor "${topVendor.name}" has the highest accumulated spending (₹${topVendor.totalPaid.toLocaleString()}).` })

    const totalDelay = projectStats.filter(p => p.isDelayed).length
    if (totalDelay > 0) insights.push({ type: 'danger', text: `${totalDelay} active site(s) are officially delayed past their target end date.` })

    return insights
  }

  // Trend Data Grouping (Last 6 Months)
  const getTrendData = () => {
    const pData: Record<string, { month: string, revenue: number, expense: number, profit: number }> = {}
    
    const now = new Date()
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear()
      pData[mLabel] = { month: mLabel, revenue: 0, expense: 0, profit: 0 }
    }

    payments.forEach(p => {
      if (!p.date) return
      const d = new Date(p.date)
      const mLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear()
      if (pData[mLabel]) pData[mLabel].revenue += p.amount
    })
    expenses.forEach(e => {
      if (!e.date) return
      const d = new Date(e.date)
      const mLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear()
      if (pData[mLabel]) pData[mLabel].expense += e.amount
    })
    
    return Object.values(pData).map(d => ({ ...d, profit: d.revenue - d.expense }))
  }
  const trendData = useMemo(getTrendData, [payments, expenses])

  // Expense Category Breakdown
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
        const cat = e.category || 'Other'
        map[cat] = (map[cat] || 0) + e.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value)
  }, [expenses])
  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b']

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
        </div>
        <div className="text-white/50 text-sm font-medium tracking-widest uppercase animate-pulse">
            Compiling Analytical Data
        </div>
    </div>
  )

  const insightsList = GenerateInsights()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between sticky top-0 z-10 bg-[#121215]/80 backdrop-blur-xl py-4 -my-4 mb-4 border-b border-white/5">
        <div>
          <div className="text-2xl font-normal tracking-tight text-white drop-shadow-sm pl-[13px]">
            Company Intelligence
          </div>
        </div>
        <DateRangeFilter
          label="Date Filter"
          from={fromDate}
          to={toDate}
          onChange={({ from, to }) => {
            setFromDate(from)
            setToDate(to)
          }}
        />
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm flex items-center gap-2 font-medium">
            <AlertTriangle className="h-5 w-5" />
            {error}
        </motion.div>
      )}

      {/* 10. Top Insights (Auto-generated) */}
      <section className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 group-hover:bg-primary/30 transition-colors duration-700" />
        <div className="glass rounded-[24px] p-6 shadow-2xl border border-white/10 relative z-0">
            <div className="flex items-center gap-2 text-xl font-black mb-6 tracking-tight text-white/90">
               <span className="text-primary text-2xl">⚡</span> Top Auto-Generated Insights
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnimatePresence>
                    {insightsList.map((insight, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1, type: "spring" }}
                            key={idx} className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg
                                ${insight.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 
                                  insight.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : 
                                  'bg-amber-500/10 border-amber-500/20 text-amber-200'}`}
                        >
                            {insight.type === 'danger' && <AlertTriangle className="h-6 w-6 mb-3 opacity-90 drop-shadow-md text-red-400" />}
                            {insight.type === 'warning' && <AlertTriangle className="h-6 w-6 mb-3 opacity-90 drop-shadow-md text-amber-400" />}
                            {insight.type === 'success' && <TrendingUp className="h-6 w-6 mb-3 opacity-90 drop-shadow-md text-green-400" />}
                            <div className="text-[15px] font-semibold tracking-wide leading-relaxed">{insight.text}</div>
                        </motion.div>
                    ))}
                    {insightsList.length === 0 && <div className="text-white/40 text-sm italic col-span-4">No critical insights detected currently. Operating smoothly.</div>}
                </AnimatePresence>
            </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
          
        {/* 1. Cash Flow Forecast & 8. Revenue Collection */}
        <section className="glass rounded-3xl p-6 lg:col-span-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] transition-opacity opacity-0 group-hover:opacity-100 z-0 pointer-events-none" />
            <div className="relative z-10">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-6 tracking-tight text-white/90">
                    <div className="p-2 bg-blue-500/20 rounded-lg"><DollarSign className="text-blue-400 h-5 w-5" /></div>
                    Cash Flow Forecast & Revenue
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 shadow-inner">
                        <div className="text-xs text-white/40 mb-2 tracking-widest uppercase font-semibold">Expected Inflow</div>
                        <div className="text-2xl lg:text-2xl font-normal text-green-400">₹{(cashFlowIn/1000).toFixed(1)}k</div>
                    </div>
                    <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 shadow-inner">
                        <div className="text-xs text-white/40 mb-2 tracking-widest uppercase font-semibold">Overdue Revenue</div>
                        <div className="text-2xl lg:text-2xl font-normal text-red-400">₹{(totalOverdue/1000).toFixed(1)}k</div>
                    </div>
                    <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 shadow-inner">
                        <div className="text-xs text-white/40 mb-2 tracking-widest uppercase font-semibold">Expected Outflow</div>
                        <div className="text-2xl lg:text-2xl font-normal text-amber-400">₹{(cashFlowOut/1000).toFixed(1)}k</div>
                    </div>
                    <div className="bg-[#1a1a1e] rounded-2xl p-5 border border-white/5 shadow-inner">
                        <div className="text-xs text-white/40 mb-2 tracking-widest uppercase font-semibold">Net Cash Flow</div>
                        <div className={`text-2xl lg:text-2xl font-normal ${(cashFlowIn - cashFlowOut) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ₹{((cashFlowIn - cashFlowOut)/1000).toFixed(1)}k
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="h-6 bg-[#1a1a1e] rounded-full overflow-hidden flex shadow-inner border border-white/5 p-1 w-full relative">
                        {cashFlowIn + cashFlowOut > 0 ? (
                            <>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(cashFlowIn / (cashFlowIn + cashFlowOut)) * 100}%`}} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" />
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(cashFlowOut / (cashFlowIn + cashFlowOut)) * 100}%`}} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full ml-1" />
                            </>
                        ) : (
                             <div className="text-xs w-full text-center text-white/30 pt-0.5">Not enough data points found.</div>
                        )}
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold tracking-wider uppercase text-white/40 px-2">
                        <span className="text-green-400/80">Inflow Weight</span>
                        <span className="text-amber-400/80">Outflow Weight</span>
                    </div>
                </div>
            </div>
        </section>

        {/* 11. Risk & Alert Summary & 7. Project Delay Analysis */}
        <section className="glass rounded-3xl p-6 lg:col-span-4 flex flex-col justify-between hover:border-white/20 transition-all duration-300 overflow-hidden">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6 tracking-tight text-white/90">
               <div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle className="text-red-400 h-5 w-5" /></div>
               Risk & Delay Report
            </h3>
            
            <div className="flex-1 space-y-4">
                <div className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                    <div>
                        <div className="text-sm font-bold tracking-wide text-red-200">Over-budget Sites</div>
                        <div className="text-xs font-medium text-red-200/60 mt-1">Cost exceeds BOQ limit</div>
                    </div>
                    <div className="text-4xl font-black text-red-400 drop-shadow-md">{projectStats.filter(p => p.isOverBudget).length}</div>
                </div>

                <div className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                    <div>
                        <div className="text-sm font-bold tracking-wide text-amber-200">Delayed Projects</div>
                        <div className="text-xs font-medium text-amber-200/60 mt-1">Missed completion target</div>
                    </div>
                    <div className="text-4xl font-black text-amber-400 drop-shadow-md">{projectStats.filter(p => p.isDelayed).length}</div>
                </div>

                <div className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <div>
                        <div className="text-sm font-bold tracking-wide text-blue-200">Overdue Invoices</div>
                        <div className="text-xs font-medium text-blue-200/60 mt-1">Client payments delayed</div>
                    </div>
                    <div className="text-4xl font-black text-blue-400 drop-shadow-md">{bills.filter(b => b.status === 'overdue' || (b.status !== 'paid' && new Date(b.dueDate) < new Date())).length}</div>
                </div>
            </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* 9. Trend Reports */}
        <section className="glass rounded-3xl p-6 h-[460px] flex flex-col hover:border-white/20 transition-all duration-300 overflow-hidden">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6 tracking-tight text-white/90">
                <div className="p-2 bg-primary/20 rounded-lg"><Activity className="text-primary h-5 w-5" /></div>
                Monthly Growth Trend
            </h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="month" stroke="#ffffff50" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} dy={15} />
                        <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} tickFormatter={v => `₹${v/1000}k`} dx={-10} />
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', padding: '12px 16px' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '25px', fontWeight: 600, fontSize: '14px' }} iconType="circle" />
                        <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" name="Expenses" dataKey="expense" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* 12. Expense Category Breakdown */}
        <section className="glass rounded-3xl p-6 h-[460px] flex flex-col hover:border-white/20 transition-all duration-300 overflow-hidden">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-2 tracking-tight text-white/90">
               <div className="p-2 bg-purple-500/20 rounded-lg"><PieChart className="text-purple-400 h-5 w-5" /></div>
               Deep Expense Breakdown
            </h3>
            <div className="text-sm font-medium text-white/50 mb-4 ml-12">Categorized spending footprint</div>
            <div className="flex-1 w-full flex items-center">
                <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                        <Pie
                            data={expenseBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth={3}
                            animationBegin={200}
                            animationDuration={1200}
                        >
                            {expenseBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff20', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', padding: '12px 16px', fontWeight: 600 }}
                            formatter={(value: number) => `₹${value.toLocaleString()}`}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: '14px', lineHeight: '30px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>

      </div>

      {/* 2 & 3. Cost Overrun & Project Profitability Analysis */}
      <section className="glass rounded-3xl p-6 overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300">
          <h3 className="text-xl font-bold flex items-center gap-3 mb-6 tracking-tight text-white/90">
             <div className="p-2 bg-cyan-500/20 rounded-lg"><Target className="text-cyan-400 h-5 w-5" /></div>
             Project Profitability & Cost Control Report
          </h3>
          <div className="overflow-x-auto w-full pb-2">
            <table className="w-full min-w-[950px] text-left border-collapse">
                <thead className="bg-[#1a1a1e] text-xs uppercase tracking-wider font-semibold text-white/50">
                    <tr>
                        <th className="px-5 py-4 rounded-tl-xl">Sr No.</th>
                        <th className="px-5 py-4">Project Name</th>
                        <th className="px-5 py-4 text-right">Revenue</th>
                        <th className="px-5 py-4 text-right">BOQ Budget</th>
                        <th className="px-5 py-4 text-right">Actual Cost</th>
                        <th className="px-5 py-4 text-right">Cost Overrun</th>
                        <th className="px-5 py-4 text-right">Net Profit</th>
                        <th className="px-5 py-4 text-center rounded-tr-xl">Margin %</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {projectStats.length === 0 ? (
                        <tr><td colSpan={8} className="py-12 text-center text-white/40 italic font-medium">No project analytical data available.</td></tr>
                    ) : projectStats.map((p, idx) => (
                        <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-5 py-4 text-white/40 font-semibold">{idx + 1}</td>
                            <td className="px-5 py-4 font-bold text-white/90">
                                <span className="flex items-center gap-2">
                                    {p.projectName}
                                    {p.isDelayed && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-amber-500/20 text-amber-300 border border-amber-500/20">Delayed</span>}
                                </span>
                            </td>
                            <td className="px-5 py-4 text-right font-medium text-green-400/80">₹{p.totalPayments.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4 text-right font-medium text-white/60">₹{(p.budget || 0).toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4 text-right font-medium text-white/90">₹{p.totalExpenses.toLocaleString('en-IN')}</td>
                            <td className="px-5 py-4 text-right font-medium">
                                {p.isOverBudget ? (
                                    <span className="text-red-400 flex items-center justify-end gap-1.5 bg-red-500/10 px-2 py-1 rounded inline-flex">
                                        <TrendingUp className="h-4 w-4" /> ₹{p.overrunAmt.toLocaleString('en-IN')}
                                    </span>
                                ) : <span className="text-white/20">—</span>}
                            </td>
                            <td className={`px-5 py-4 text-right font-black ${p.profit >= 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]'}`}>
                                ₹{p.profit.toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex justify-center">
                                    <div className={`px-3 py-1.5 rounded-lg text-[13px] font-black tracking-wide
                                        ${Number(p.margin) > 20 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                          Number(p.margin) > 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                                          'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                        {p.margin}%
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </section>

      {/* 4 & 5 Mock Implementation / Future Ready section */}
      <div className="grid gap-6 md:grid-cols-2">
          {/* 6. Vendor Performance Snapshot */}
          <section className="glass rounded-3xl p-6 hover:border-white/20 transition-all duration-300">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6 tracking-tight text-white/90">
                <div className="p-2 bg-orange-500/20 rounded-lg"><Truck className="text-orange-400 h-5 w-5" /></div>
                Top Vendor Spending Log
            </h3>
            <div className="space-y-4">
                {vendors.sort((a,b)=>b.totalPaid - a.totalPaid).slice(0, 5).map(v => (
                    <div key={v._id} className="flex items-center justify-between p-4 rounded-2xl bg-[#1a1a1e] border border-white/5 shadow-inner">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-500/10 flex items-center justify-center border border-orange-500/30 text-orange-400 font-bold text-lg shadow-sm">
                                {v.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-[15px] font-bold text-white/90">{v.name}</div>
                                <div className="text-[13px] font-medium text-white/50">{v.type || 'General'}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-white/90">₹{v.totalPaid.toLocaleString()}</div>
                            <div className="text-[11px] font-bold tracking-widest uppercase text-white/40">Total Settled</div>
                        </div>
                    </div>
                ))}
                {vendors.length === 0 && <div className="text-center py-6 text-white/40 italic font-medium">No vendor records found.</div>}
            </div>
          </section>

          {/* Productivity & Materials Context - Beautifully designed placeholder */}
          <section className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 bg-[#121215]/50 group cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <TrafficCone className="h-20 w-20 text-white/10 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-black text-white/60 tracking-tight">Labor Productivity & Material Watch</h3>
              <p className="text-white/40 text-sm font-medium mt-4 max-w-sm leading-relaxed">
                  Deep tracking algorithms for exact hours logged per unit of work and structural material consumption audits are currently calibrating.
              </p>
              <div className="mt-8 px-6 py-2.5 rounded-full bg-[#1a1a1e] border border-white/10 text-xs font-black tracking-widest text-primary uppercase shadow-inner">
                 Coming in Version 2.0
              </div>
          </section>
      </div>
      
    </div>
  )
}
