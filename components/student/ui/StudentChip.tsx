'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type ChipTone = 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray'

interface StudentChipProps {
  label: string
  icon?: LucideIcon
  tone?: ChipTone
  className?: string
  size?: 'sm' | 'md'
}

export function StudentChip({
  label,
  icon: Icon,
  tone = 'blue',
  className,
  size = 'sm',
}: StudentChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-1 text-[10px] sm:text-xs' : 'px-3 py-1.5 text-xs sm:text-sm',
        tone === 'blue' &&
          'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300',
        tone === 'green' &&
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
        tone === 'purple' &&
          'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
        tone === 'amber' &&
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
        tone === 'red' &&
          'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
        tone === 'gray' &&
          'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
        className
      )}
    >
      {Icon && <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
      {label}
    </span>
  )
}
