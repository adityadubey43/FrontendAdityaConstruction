'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, LineChart, FolderKanban, Wallet, Settings, PhoneCall, Truck } from 'lucide-react'

const items = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/dashboard/users', icon: Users },
  { label: 'Leads', href: '/dashboard/leads', icon: PhoneCall },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Vendors', href: '/dashboard/vendors', icon: Truck },
  { label: 'Expenses', href: '/dashboard/expenses', icon: Wallet },
  { label: 'Payments', href: '/dashboard/payments', icon: Wallet },
  { label: 'Reports', href: '/dashboard/reports', icon: LineChart },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-soft backdrop-blur',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className={cn('h-10 w-10 rounded-xl bg-primary/20', collapsed && 'mx-auto')}></div>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold">Aditya Construction</div>
              <div className="mt-1 text-xs text-white/60">Management</div>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1">
          {items.map((it) => {
            const Icon = it.icon
            const active = pathname === it.href
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition',
                  active ? 'bg-primary/20 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="truncate">{it.label}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mx-4 mb-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            localStorage.removeItem('acls_token')
            router.replace('/login')
          }}
        >
          Logout
        </Button>
      </div>
    </motion.aside>
  )
}
