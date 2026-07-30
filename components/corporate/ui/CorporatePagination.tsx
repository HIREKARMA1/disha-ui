'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { corpCardSolid } from './corporate-theme'

interface CorporatePaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  limitOptions?: number[]
  itemLabel?: string
  className?: string
}

export function CorporatePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
  itemLabel = 'items',
  className = '',
}: CorporatePaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <div
      className={cn(
        corpCardSolid,
        'p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3',
        className
      )}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
        Showing <span className="font-semibold text-gray-900 dark:text-white">{from}</span> to{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{to}</span> of{' '}
        <span className="font-semibold text-primary-600 dark:text-blue-400">{total}</span>{' '}
        {itemLabel}
      </p>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`e-${idx}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all',
                  p === page
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                    : 'border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {onLimitChange && (
        <div className="flex items-center gap-2 order-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="hidden sm:inline">{itemLabel} per page</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-gray-900 dark:text-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/40"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
