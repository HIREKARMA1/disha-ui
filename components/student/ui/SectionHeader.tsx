'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  actionHref?: string
  actionLabel?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  actionHref,
  actionLabel = 'View All',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-4', className)}>
      <div className="min-w-0 flex items-start gap-2.5">
        {Icon && (
          <div className="mt-0.5 p-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 whitespace-nowrap shrink-0 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
