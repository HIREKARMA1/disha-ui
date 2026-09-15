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

function DishaMonogram({ compact }: { compact: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('relative', compact ? 'h-[22px] w-[22px]' : 'h-7 w-7 sm:h-[30px] sm:w-[30px]')}
      fill="none"
      aria-hidden
    >
      <path
        d="M17 13h14.2c10.2 0 17.6 7 17.6 19s-7.4 19-17.6 19H17V13z"
        fill="white"
      />
      <path
        d="M26.8 21.2h3.4c5.8 0 9.8 4.2 9.8 10.8s-4 10.8-9.8 10.8h-3.4V21.2z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Disha brand — HireKarma blue tile + DISHA wordmark. */
export function BrandLogo({
  href = '/',
  className,
  imageClassName: _imageClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="DISHA home"
      className={cn('group flex shrink-0 items-center', className)}
    >
      <span className={cn('inline-flex items-center', compact ? 'gap-2' : 'gap-2.5')}>
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden',
            compact ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-[10px] sm:h-11 sm:w-11 sm:rounded-xl',
            'bg-[#1b52a4] text-[#1b52a4]',
            'ring-1 ring-[#1b52a4]/20 shadow-[0_1px_2px_rgba(27,82,164,0.18)]',
            'transition-transform duration-200 group-hover:scale-[1.02]'
          )}
          aria-hidden
        >
          <DishaMonogram compact={compact} />
        </span>

        <span
          className={cn(
            'whitespace-nowrap font-poppins font-semibold leading-none tracking-[0.14em] text-[#1b52a4] dark:text-white',
            compact ? 'text-[15px]' : 'text-[1.2rem] sm:text-[1.35rem]'
          )}
        >
          DISHA
        </span>
      </span>
    </Link>
  )
}
