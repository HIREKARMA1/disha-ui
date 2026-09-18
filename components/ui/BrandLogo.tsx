'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  /** Kept for API compatibility with prior Image usage */
  priority?: boolean
  className?: string
  /** Kept for API compatibility; sizing uses `compact` instead */
  imageClassName?: string
  /** Slightly tighter mark for mobile headers */
  compact?: boolean
}

/** Classic DISHA brand blue (matches product UI). */
const DISHA_BLUE = '#1B52A4'

/**
 * Disha brand — blue rounded square with white D + DISHA wordmark.
 * Favicon is separate and intentionally unchanged.
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
      aria-label="DISHA home"
      className={cn('group flex shrink-0 items-center', className)}
    >
      <span
        className={cn(
          'inline-flex items-center',
          compact ? 'gap-2' : 'gap-2.5'
        )}
      >
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center overflow-hidden text-white shadow-sm',
            'transition-transform duration-200 group-hover:scale-[1.03]',
            compact
              ? 'h-8 w-8 rounded-lg'
              : 'h-9 w-9 rounded-[10px] sm:h-10 sm:w-10 sm:rounded-xl'
          )}
          style={{ backgroundColor: DISHA_BLUE }}
          aria-hidden
        >
          <span
            className={cn(
              'select-none font-poppins font-bold leading-none text-white',
              compact ? 'text-lg' : 'text-xl sm:text-2xl'
            )}
          >
            D
          </span>
        </span>

        <span
          className={cn(
            'select-none whitespace-nowrap font-poppins font-bold uppercase leading-none tracking-[0.14em]',
            compact ? 'text-base' : 'text-lg sm:text-xl'
          )}
          style={{ color: DISHA_BLUE }}
        >
          DISHA
        </span>
      </span>
    </Link>
  )
}
