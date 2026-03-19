import * as React from 'react'

import { cn } from '@/lib/utils'

type DateRangeFilterProps = {
  from?: string
  to?: string
  onChange: (range: { from?: string; to?: string }) => void
  label?: string
  className?: string
}

export function DateRangeFilter({ from, to, onChange, label, className }: DateRangeFilterProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <div className="text-xs text-white/60">{label}</div>}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
          <label className="text-xs text-white/60">From</label>
          <input
            type="date"
            value={from ?? ''}
            onChange={(e) => onChange({ from: e.target.value || undefined, to })}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
          <label className="text-xs text-white/60">To</label>
          <input
            type="date"
            value={to ?? ''}
            onChange={(e) => onChange({ from, to: e.target.value || undefined })}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange({ from: undefined, to: undefined })}
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
