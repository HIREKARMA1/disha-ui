'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  priority?: boolean
  className?: string
  imageClassName?: string
}

export function BrandLogo({
  href = '/',
  priority = false,
  className,
  imageClassName,
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn('flex items-center shrink-0', className)}>
      {/* Light mode logo — hidden when .dark is on <html> */}
      <Image
        src="/images/HKlogoblack.png"
        alt="HireKarma Logo"
        width={150}
        height={50}
        className={cn(
          'h-8 w-auto object-contain sm:h-10 dark:hidden',
          imageClassName
        )}
        priority={priority}
      />
      {/* Dark mode logo — CSS-driven to avoid theme hydration flash */}
      <Image
        src="/images/HKlogowhite.png"
        alt="HireKarma Logo"
        width={150}
        height={50}
        className={cn(
          'hidden h-8 w-auto object-contain sm:h-10 dark:block drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] brightness-110',
          imageClassName
        )}
        priority={priority}
      />
    </Link>
  )
}
