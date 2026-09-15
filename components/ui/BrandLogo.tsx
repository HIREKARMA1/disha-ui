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
      className={cn('relative', compact ? 'h-[22px] w-[22px]' : 'h-7 w-7 sm:h-8 sm:w-8')}
      fill="none"
      aria-hidden
    >
      <path
        d="M16 12h14.6c10.6 0 18.2 7.2 18.2 20s-7.6 20-18.2 20H16V12z"
        fill="white"
      />
      <path
        d="M26.2 20h3.8c6.2 0 10.4 4.4 10.4 12s-4.2 12-10.4 12h-3.8V20z"
        fill="currentColor"
      />
      <path
        d="M22 35c6.2-6.8 13.4-8.6 22.4-5.2"
        stroke="#5AD0F6"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M24.5 37.4c5.4-5.4 11.6-6.8 19.2-4"
        stroke="#8EE7FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="45.2" cy="28.4" r="5.1" fill="#F5A524" />
      <circle cx="46.6" cy="27" r="1.9" fill="#FFE08A" />
    </svg>
  )
}

/**
 * Disha brand — navy D tile + wordmark + CAREER PATH.
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
      <span className={cn('inline-flex items-center', compact ? 'gap-2' : 'gap-2.5 sm:gap-3')}>
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden',
            compact ? 'h-9 w-9 rounded-[11px]' : 'h-11 w-11 rounded-[13px] sm:h-12 sm:w-12 sm:rounded-[14px]',
            'bg-[#0A1B33] text-[#0A1B33]',
            'dark:bg-[#0A1B33] dark:text-[#0A1B33] dark:ring-white/15',
            'ring-1 ring-black/10 shadow-sm',
            'transition-transform duration-200 group-hover:scale-[1.03]'
          )}
          aria-hidden
        >
          <DishaMonogram compact={compact} />
        </span>

        <span className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              'whitespace-nowrap font-poppins font-bold leading-none text-[#0A1B33] dark:text-white',
              compact ? 'text-lg' : 'text-[1.55rem] sm:text-[1.7rem]'
            )}
          >
            Disha
          </span>
          {!compact && (
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.32em] text-[#8AA0BC] dark:text-[#93A0BD] sm:text-[9px] sm:tracking-[0.36em]">
              Career path
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
