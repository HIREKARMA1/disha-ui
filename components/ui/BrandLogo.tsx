'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  /** Kept for API compatibility with prior Image usage */
  priority?: boolean
  className?: string
  imageClassName?: string
  /** Icon + short wordmark for tight mobile headers */
  compact?: boolean
}

/**
 * Disha brand — high-contrast monogram D + clear wordmark.
 */
export function BrandLogo({
  href = '/',
  className,
  imageClassName: _imageClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Disha home"
      className={cn('group flex shrink-0 items-center', className)}
    >
      <span className={cn('inline-flex items-center', compact ? 'gap-1.5' : 'gap-2.5')}>
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden',
            compact ? 'h-8 w-8 rounded-[10px]' : 'h-9 w-9 rounded-[11px]',
            'bg-[#0B1F3A] text-[#0B1F3A]',
            'dark:bg-primary-500 dark:text-primary-500',
            'ring-1 ring-black/10 shadow-sm',
            'transition-transform duration-200 group-hover:scale-[1.03]'
          )}
          aria-hidden
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />
          <svg
            viewBox="0 0 40 40"
            className={cn('relative', compact ? 'h-5 w-5' : 'h-6 w-6')}
            fill="none"
          >
            {/* Bold solid D */}
            <path
              d="M11.5 8.5h8.2c6.4 0 10.8 4.3 10.8 11.5S26.1 31.5 19.7 31.5h-8.2V8.5z"
              fill="white"
            />
            {/* Inner cutout matches tile (currentColor) */}
            <path
              d="M17.2 13h2.2c3.9 0 6.5 2.7 6.5 7s-2.6 7-6.5 7h-2.2V13z"
              fill="currentColor"
            />
            {/* Direction accents — thicker for small sizes */}
            <path
              d="M16.8 20.2c2.6-3.4 6.2-4.8 10.2-3.6"
              stroke="#7DD3FC"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M24.4 14.2l3.6 2.4-4.2 1"
              stroke="#FBBF24"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              'font-bold tracking-[-0.035em] text-[#0B1F3A] dark:text-white',
              compact ? 'text-lg' : 'text-[1.45rem] sm:text-[1.55rem]'
            )}
          >
            Disha
          </span>
          {!compact && (
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              Career path
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
