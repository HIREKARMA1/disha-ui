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
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
        tone === 'green' &&
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
        tone === 'purple' &&
          'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30',
        tone === 'amber' &&
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
        tone === 'red' &&
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
        tone === 'gray' &&
          'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30',
        className
      )}
    >
      {Icon && <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />}
      {label}
    </span>
  )
}
