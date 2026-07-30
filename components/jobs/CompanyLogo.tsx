'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CompanyLogoProps {
  logoUrl?: string | null
  companyName?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-lg sm:h-14 sm:w-14',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
}

/**
 * Shows company logo when available; otherwise alphabet avatar.
 */
export function CompanyLogo({
  logoUrl,
  companyName,
  size = 'md',
  className,
}: CompanyLogoProps) {
  const name = (companyName || '').trim()
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(logoUrl) && !failed

  if (showImage) {
    return (
      <div
        className={cn(
          'shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10',
          sizeClasses[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl as string}
          alt={name ? `${name} logo` : 'Company logo'}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white font-bold text-blue-600 shadow-sm dark:border-white/10 dark:bg-[#151b2b]',
        sizeClasses[size],
        className
      )}
      aria-hidden={!name}
      aria-label={name || 'Company'}
    >
      {initial}
    </div>
  )
}
