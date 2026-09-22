'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  /** Load eagerly for above-the-fold headers */
  priority?: boolean
  className?: string
  /** Optional height override for the wordmark image */
  imageClassName?: string
  /** Slightly tighter mark for mobile headers */
  compact?: boolean
}

const LOGO_SRC = '/images/disha-brand-logo.png'

/**
 * Disha brand wordmark (image). Favicon is separate and intentionally unchanged.
 */
export function BrandLogo({
  href = '/',
  priority = false,
  className,
  imageClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="DISHA home"
      className={cn('group flex shrink-0 items-center', className)}
    >
      <Image
        src={LOGO_SRC}
        alt="DISHA"
        width={compact ? 120 : 152}
        height={compact ? 32 : 40}
        priority={priority}
        className={cn(
          'w-auto object-contain object-left transition-opacity duration-200 group-hover:opacity-90',
          compact ? 'h-8' : 'h-9 sm:h-10',
          imageClassName
        )}
      />
    </Link>
  )
}
