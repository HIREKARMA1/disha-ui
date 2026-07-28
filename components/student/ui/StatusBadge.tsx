'use client'

import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50',
  shortlisted: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50',
  selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50',
  rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
  withdrawn: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
  under_review: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700/50',
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  selected: 'Selected',
  rejected: 'Rejected',
  pending: 'Pending',
  withdrawn: 'Withdrawn',
  under_review: 'Under Review',
}

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const key = (status || '').toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border capitalize whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        STATUS_STYLES[key] || STATUS_STYLES.pending,
        className
      )}
    >
      {STATUS_LABELS[key] || status}
    </span>
  )
}
