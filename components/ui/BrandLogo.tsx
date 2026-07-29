'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
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
  const { resolvedTheme, theme } = useTheme()
  const isDark =
    resolvedTheme === 'dark' || (resolvedTheme === 'system' && theme === 'dark')
  const src = isDark ? '/images/HKlogowhite.png' : '/images/HKlogoblack.png'

  return (
    <Link href={href} className={cn('flex items-center', className)}>
      <Image
        src={src}
        alt="HireKarma Logo"
        width={150}
        height={50}
        className={cn(
          'h-8 w-auto object-contain sm:h-10',
          imageClassName
        )}
        priority={priority}
      />
    </Link>
  )
}
