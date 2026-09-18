'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  /** Kept for API compatibility with prior Image usage */
  priority?: boolean
  className?: string
  imageClassName?: string
  /** Slightly shorter wordmark for tight mobile headers */
  compact?: boolean
}

const LOGO_SRC = '/images/disha-logo.png'
const LOGO_WIDTH = 1567
const LOGO_HEIGHT = 485

/** Disha brand — uploaded DISHA wordmark (person-as-I, path, plane). Favicon unchanged. */
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
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        className={cn(
          'w-auto max-w-full object-contain object-left rounded-sm bg-white',
          'transition-opacity duration-200 group-hover:opacity-90',
          imageClassName ?? (compact ? 'h-8' : 'h-9 sm:h-10')
        )}
      />
    </Link>
  )
}
