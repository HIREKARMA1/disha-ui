'use client'

import { formatSalaryRange } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface SalaryBadgeProps {
  salaryMin?: number | string | null
  salaryMax?: number | string | null
  className?: string
  /** When salary is missing, render null (default) or fall back to plain empty label. */
  showWhenEmpty?: boolean
  emptyLabel?: string
}

function hasSalaryValue(min?: number | string | null, max?: number | string | null): boolean {
  const minNum = min !== undefined && min !== null && min !== '' ? Number(min) : undefined
  const maxNum = max !== undefined && max !== null && max !== '' ? Number(max) : undefined
  const hasMin = minNum !== undefined && !Number.isNaN(minNum)
  const hasMax = maxNum !== undefined && !Number.isNaN(maxNum)
  return hasMin || hasMax
}

/** Premium stacked cash / wallet mark for salary highlight. */
function PremiumCashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="5.5" width="13" height="9" rx="1.75" fill="currentColor" opacity="0.18" />
      <rect
        x="4"
        y="3.75"
        width="13"
        height="9"
        rx="1.75"
        fill="currentColor"
        opacity="0.28"
      />
      <rect
        x="3"
        y="6.5"
        width="14"
        height="9.25"
        rx="2"
        fill="currentColor"
        opacity="0.92"
      />
      <circle cx="10" cy="11.1" r="2.35" fill="white" opacity="0.95" />
      <path
        d="M10.55 9.55h-.7c-.55 0-.95.28-.95.78 0 .52.42.72 1.02.88l.28.08c.42.12.55.22.55.42 0 .28-.28.42-.7.42-.38 0-.68-.12-.82-.28l-.42.42c.25.28.68.45 1.2.48v.48h.7v-.48c.58-.08.98-.4.98-.95 0-.58-.45-.8-1.08-.95l-.28-.08c-.35-.1-.5-.2-.5-.4 0-.22.2-.38.58-.38.32 0 .55.1.7.25l.4-.4c-.22-.22-.55-.35-.98-.38V9.55z"
        fill="currentColor"
      />
      <path
        d="M4.75 9.1h1.1M14.15 13.55h1.1"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

/**
 * Highlighted salary pill used on job cards and JD surfaces.
 * Uses existing formatSalaryRange — does not invent salary data.
 */
export function SalaryBadge({
  salaryMin,
  salaryMax,
  className,
  showWhenEmpty = false,
  emptyLabel = 'Not specified',
}: SalaryBadgeProps) {
  const available = hasSalaryValue(salaryMin, salaryMax)
  if (!available && !showWhenEmpty) return null

  const label = available
    ? formatSalaryRange(salaryMin, salaryMax)
    : emptyLabel

  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/90',
        'bg-gradient-to-r from-emerald-50 to-green-50 px-2.5 py-1',
        'text-[11px] font-semibold leading-none text-emerald-800 sm:text-xs',
        'dark:border-emerald-500/30 dark:from-emerald-900/35 dark:to-emerald-900/20 dark:text-emerald-300',
        className
      )}
      title={label}
    >
      <span className="min-w-0 max-w-[11rem] truncate sm:max-w-[14rem]">{label}</span>
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
        <PremiumCashIcon className="h-3.5 w-3.5" />
      </span>
    </span>
  )
}

export function hasJobSalary(
  salaryMin?: number | string | null,
  salaryMax?: number | string | null
): boolean {
  return hasSalaryValue(salaryMin, salaryMax)
}
