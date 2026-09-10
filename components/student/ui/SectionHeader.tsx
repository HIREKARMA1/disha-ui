'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  actionHref?: string
  actionLabel?: string
  className?: string
  count?: number
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  actionHref,
  actionLabel = 'View All',
  className,
  count,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3 sm:items-center', className)}>
      <div className="min-w-0">
        <h2 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:gap-x-2.5 sm:text-[22px]">
          <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
          {Icon ? <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400 sm:h-5 sm:w-5" /> : null}
          {title}
          {typeof count === 'number' && (
            <span className="text-sm font-medium text-gray-400 sm:text-base">({count})</span>
          )}
        </h2>
        {subtitle && (
          <p className="mt-1 pl-3.5 text-xs text-gray-500 dark:text-gray-400 sm:mt-1.5 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5',
            'text-xs font-semibold text-primary-700 shadow-sm transition-colors sm:text-sm',
            'hover:border-primary-400 hover:bg-primary-100 hover:shadow-md',
            'dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/60'
          )}
        >
          <span>{actionLabel}</span>
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white',
              'transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-primary-700'
            )}
          >
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </Link>
      )}
    </div>
  )
}
