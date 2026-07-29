"use client"

import { memo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PORTAL_STATUS_OPTIONS,
  type PortalStatusFilter,
} from '@/lib/eventsPortalConfig'

export interface StatusCounts {
  all: number
  live: number
  closed: number
}

interface EventsFilterSidebarProps {
  status: PortalStatusFilter
  onStatusChange: (status: PortalStatusFilter) => void
  statusCounts: StatusCounts
  className?: string
}

function EventsFilterSidebarComponent({
  status,
  onStatusChange,
  statusCounts,
  className,
}: EventsFilterSidebarProps) {
  const countForStatus = (value: PortalStatusFilter) => {
    if (value === 'live') return statusCounts.live
    if (value === 'closed') return statusCounts.closed
    return statusCounts.all
  }

  return (
    <aside
      className={cn(
        'rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm',
        'dark:border-gray-700/80 dark:bg-gray-900/80',
        className
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
          <SlidersHorizontal className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
      </div>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Contest Status
        </h3>
        <div className="flex flex-wrap gap-2">
          {PORTAL_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200',
                status === opt.value
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {opt.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  status === opt.value
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                )}
              >
                {countForStatus(opt.value)}
              </span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}

export const EventsFilterSidebar = memo(EventsFilterSidebarComponent)
