'use client'

import { Bell, Search, Settings } from 'lucide-react'
import React from 'react'

export default function DashboardTopbar({
  collapsed,
  onToggleSidebar,
  onSearch,
}: {
  collapsed: boolean
  onToggleSidebar: () => void
  onSearch?: (term: string) => void
}) {
  return (
    <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-soft">
      <div className="flex items-center gap-3">
        <button
          className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/15 md:flex"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {collapsed ? '»' : '«'}
        </button>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/15">
          <Bell className="h-4 w-4" />
        </button>
        <button className="rounded-xl bg-white/10 p-2 text-white hover:bg-white/15">
          <Settings className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center text-sm font-semibold text-white">A</div>
          <div className="hidden flex-col text-left text-xs sm:flex">
            <span className="font-semibold">Admin</span>
            <span className="text-white/60">Owner</span>
          </div>
        </div>
      </div>
    </header>
  )
}
