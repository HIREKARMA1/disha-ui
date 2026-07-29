'use client'

import { motion } from 'framer-motion'
import { corpCard } from './corporate-theme'
import { cn } from '@/lib/utils'

interface CorporateGlassCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
  delay?: number
  padding?: boolean
}

export function CorporateGlassCard({
  children,
  className = '',
  title,
  subtitle,
  action,
  delay = 0,
  padding = true,
}: CorporateGlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={cn(corpCard, padding && 'p-6', className)}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-2 mb-3 md:mb-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[14px] md:text-[18px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] md:text-[14px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  )
}
