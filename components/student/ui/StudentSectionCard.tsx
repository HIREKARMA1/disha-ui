'use client'

import { cn } from '@/lib/utils'

/** Shared dark-theme section card used across student pages */
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
        'relative z-0 h-auto rounded-2xl border border-gray-200/70 dark:border-white/10',
        'bg-white dark:bg-[#151b2b]',
        'shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
        'transition-shadow duration-200 hover:shadow-md',
        pad,
        className
      )}
    >
      {children}
    </div>
  )
}
