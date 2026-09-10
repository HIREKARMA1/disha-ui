'use client'

import { cn } from '@/lib/utils'

/** Shared section card — matches Opportunity Hub card language */
export function StudentSectionCard({
  children,
  className,
  padding = 'md',
}: {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}) {
  const pad =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-3 sm:p-3.5'
        : padding === 'lg'
          ? 'p-4 sm:p-5 lg:p-6'
          : 'p-3.5 sm:p-4 lg:p-5'

  return (
    <div
      className={cn(
        'relative z-0 h-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        'transition-[box-shadow,border-color] duration-200',
        'dark:border-gray-700 dark:bg-gray-900',
        'hover:border-primary-200 hover:shadow-md dark:hover:border-primary-800',
        pad,
        className
      )}
    >
      {children}
    </div>
  )
}
