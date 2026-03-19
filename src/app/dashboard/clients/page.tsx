'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/api'
import { ChevronDown, Eye, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangeFilter } from '@/components/ui/date-range-filter'

type ProjectDetail = {
  projectId: string
  projectName: string
  bills: number
  payments: number
  expenses: number
  pending: number
}

type ClientSummary = {
  clientName: string
  totalBills: number
  totalPayments: number
  pendingAmount: number
  projectCount: number
  projects: ProjectDetail[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [fromDate, setFromDate] = useState<string | undefined>(undefined)
  const [toDate, setToDate] = useState<string | undefined>(undefined)

  const token = typeof window !== 'undefined' ? localStorage.getItem('acls_token') || '' : ''

  useEffect(() => {
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)

    apiFetch<{ clientSummaries: ClientSummary[] }>(`/api/reports/client-summary?${params.toString()}`, { token })
      .then((data) => setClients(data.clientSummaries || []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load clients'))
      .finally(() => setLoading(false))
  }, [token, fromDate, toDate])

  const openDetails = (client: ClientSummary) => {
    setSelectedClient(client)
    setShowDetailsModal(true)
  }

  const getPaymentPercentage = (client: ClientSummary) => {
    if (client.totalBills === 0) return 100
    return (client.totalPayments / client.totalBills) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-2xl font-bold">Clients</div>
          <div className="mt-1 text-sm text-white/60">
            Manage client billing and project tracking
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DateRangeFilter
            label="Date range"
            from={fromDate}
            to={toDate}
            onChange={({ from, to }) => {
              setFromDate(from)
              setToDate(to)
            }}
          />
          <div className="flex gap-2 text-sm text-white/60">
            <span>
              Total Clients: <span className="font-semibold text-white">{clients.length}</span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-primary"></div>
            <div className="mt-3 text-white/60">Loading client data...</div>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center rounded-2xl border-2 border-dashed border-white/10 py-16"
        >
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-white/30" />
            <div className="mt-3 text-white/60">No clients found</div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {clients.map((client, idx) => {
            const paymentPercentage = getPaymentPercentage(client)
            const isFullyPaid = paymentPercentage >= 100
            
            return (
              <motion.div
                key={client.clientName}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                <div className="group glass rounded-2xl p-6 transition-all hover:shadow-lg hover:bg-white/[0.08]">
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        {client.clientName}
                      </h3>
                      <p className="mt-1 text-xs text-white/50">{client.projectCount} active project{client.projectCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openDetails(client)}
                        size="sm"
                        variant="secondary"
                        className="gap-2 whitespace-nowrap"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View Details</span>
                      </Button>
                      <button
                        onClick={() => setExpandedClient(expandedClient === client.clientName ? null : client.clientName)}
                        className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${
                            expandedClient === client.clientName ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-blue-400">₹</span>
                        <div className="text-xs text-white/60">Total Bills</div>
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        ₹{Math.round(client.totalBills).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-green-400">₹</span>
                        <div className="text-xs text-white/60">Received</div>
                      </div>
                      <div className="mt-2 text-lg font-bold text-green-400">
                        ₹{Math.round(client.totalPayments).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-amber-400">₹</span>
                        <div className="text-xs text-white/60">Pending</div>
                      </div>
                      <div className={`mt-2 text-lg font-bold ${isFullyPaid ? 'text-green-400' : 'text-amber-400'}`}>
                        ₹{Math.round(client.pendingAmount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{background: `conic-gradient(#10b981 ${paymentPercentage}%, #f59e0b ${paymentPercentage}%)`}} />
                        <div className="text-xs text-white/60">Payment %</div>
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        {paymentPercentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/60">Payment Progress</span>
                      <span className="text-xs font-semibold text-white">
                        ₹{Math.round(client.totalPayments).toLocaleString('en-IN')} / ₹{Math.round(client.totalBills).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isFullyPaid 
                            ? 'bg-gradient-to-r from-green-500 to-green-400' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded project details */}
                  {expandedClient === client.clientName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 pt-4"
                    >
                      <div className="text-xs font-semibold uppercase text-white/60 mb-3">Projects</div>
                      <div className="space-y-2">
                        {client.projects.map((project) => {
                          const projPaymentPercentage = project.bills === 0 ? 100 : (project.payments / project.bills) * 100
                          return (
                            <div
                              key={project.projectId}
                              className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-3 hover:border-white/20 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                  <div className="font-medium text-white">{project.projectName}</div>
                                  <div className="mt-1 flex gap-3 text-xs text-white/60">
                                    <span>Bills: <span className="text-white/80">₹{Math.round(project.bills / 1000)}K</span></span>
                                    <span>Paid: <span className="text-green-400">₹{Math.round(project.payments / 1000)}K</span></span>
                                  </div>
                                </div>
                                <div className={`text-right text-xs font-semibold ${project.pending > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                                  {projPaymentPercentage.toFixed(0)}%
                                </div>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(projPaymentPercentage, 100)}%` }}
                                  transition={{ duration: 0.6 }}
                                  className={`h-full ${
                                    project.pending <= 0 
                                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                                  }`}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-8 border border-white/20"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                  {selectedClient.clientName}
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Complete financial overview for {selectedClient.projectCount} project{selectedClient.projectCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="rounded-lg bg-white/10 p-3 text-white/60 hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-blue-300/80">Total Bills Raised</div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      ₹{Math.round(selectedClient.totalBills).toLocaleString('en-IN')}
                    </div>
                    <div className="mt-1 text-xs text-blue-300/60">
                      {selectedClient.projectCount} project{selectedClient.projectCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-green-300/80">Payment Received</div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      ₹{Math.round(selectedClient.totalPayments).toLocaleString('en-IN')}
                    </div>
                    <div className="mt-1 text-xs text-green-300/60">
                      {getPaymentPercentage(selectedClient).toFixed(0)}% received
                    </div>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl border p-4 ${
                selectedClient.pendingAmount > 0 
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/10 border-amber-500/30' 
                  : 'bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs font-medium ${
                      selectedClient.pendingAmount > 0 
                        ? 'text-amber-300/80' 
                        : 'text-green-300/80'
                    }`}>
                      Pending Amount
                    </div>
                    <div className={`mt-2 text-2xl font-bold ${
                      selectedClient.pendingAmount > 0 
                        ? 'text-amber-300' 
                        : 'text-green-300'
                    }`}>
                      ₹{Math.round(selectedClient.pendingAmount).toLocaleString('en-IN')}
                    </div>
                    <div className={`mt-1 text-xs ${
                      selectedClient.pendingAmount > 0 
                        ? 'text-amber-300/60' 
                        : 'text-green-300/60'
                    }`}>
                      {selectedClient.pendingAmount <= 0 ? 'Fully Paid' : 'Outstanding'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Progress */}
            <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Overall Payment Status</span>
                <span className="text-sm font-bold text-primary">
                  {getPaymentPercentage(selectedClient).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(getPaymentPercentage(selectedClient), 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    selectedClient.pendingAmount <= 0 
                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`}
                />
              </div>
            </div>

            {/* Project Details Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase text-white/80 tracking-wide">Project-wise Details</h3>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-white/80">Project Name</th>
                      <th className="px-4 py-3 text-right font-semibold text-white/80">Bills Raised</th>
                      <th className="px-4 py-3 text-right font-semibold text-white/80">Payments</th>
                      <th className="px-4 py-3 text-right font-semibold text-white/80">Pending</th>
                      <th className="px-4 py-3 text-center font-semibold text-white/80">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {selectedClient.projects.map((project) => {
                      const isFullyPaid = project.pending <= 0
                      
                      return (
                        <tr
                          key={project.projectId}
                          className="hover:bg-white/10 transition-colors"
                        >
                          <td className="px-4 py-4 font-medium text-white">{project.projectName}</td>
                          <td className="px-4 py-4 text-right text-blue-300">
                            ₹{Math.round(project.bills).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-4 text-right text-green-300">
                            ₹{Math.round(project.payments).toLocaleString('en-IN')}
                          </td>
                          <td className={`px-4 py-4 text-right font-semibold ${
                            isFullyPaid ? 'text-green-300' : 'text-amber-300'
                          }`}>
                            ₹{Math.round(project.pending).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              isFullyPaid
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              <span className={`h-2 w-2 rounded-full ${isFullyPaid ? 'bg-green-400' : 'bg-amber-400'}`} />
                              {isFullyPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="secondary"
                className="px-6"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
