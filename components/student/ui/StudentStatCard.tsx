'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface StudentStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  colorClass?: string
  bgClass?: string
  active?: boolean
  onClick?: () => void
  className?: string
  index?: number
  compact?: boolean
}

export function StudentStatCard({
  label,
  value,
  icon: Icon,
  colorClass = 'text-primary-600 dark:text-primary-400',
  bgClass = 'bg-primary-50/80 dark:bg-primary-900/20',
  active,
  onClick,
  className,
  index = 0,
  compact = false,
}: StudentStatCardProps) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={cn('w-full h-full', className)}
    >
      <Wrapper
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={cn(
          'w-full h-full text-left rounded-2xl border backdrop-blur-sm transition-all duration-200',
          'border-gray-200/80 dark:border-gray-700/70 shadow-sm hover:shadow-md hover:-translate-y-0.5',
          bgClass,
          active && 'ring-2 ring-primary-500/60 border-primary-400 dark:border-primary-500',
          compact ? 'p-2 sm:p-3 rounded-xl' : 'p-4'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={cn(
              'font-medium text-gray-600 dark:text-gray-300 truncate',
              compact ? 'text-[10px] sm:text-xs mb-0' : 'text-sm mb-1'
            )}>
              {label}
            </p>
            <p className={cn(
              'font-bold text-gray-900 dark:text-white tabular-nums',
              compact ? 'text-base sm:text-xl' : 'text-2xl'
            )}>
              {value}
            </p>
          </div>
          <div className={cn(
            'rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-sm shrink-0',
            compact ? 'p-1.5 sm:p-2' : 'p-2.5'
          )}>
            <Icon className={cn(compact ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-5 h-5', colorClass)} />
          </div>
        </div>
      </Wrapper>
    </motion.div>
  )
}
