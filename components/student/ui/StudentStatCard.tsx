'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface StudentStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  colorClass?: string
  iconBgClass?: string
  bgClass?: string
  active?: boolean
  onClick?: () => void
  className?: string
  index?: number
  compact?: boolean
  /** Extra-dense for mobile applications page */
  micro?: boolean
}

export function StudentStatCard({
  label,
  value,
  icon: Icon,
  subtitle,
  colorClass = 'text-blue-500',
  iconBgClass = 'bg-blue-500/15',
  bgClass = 'bg-white dark:bg-[#151b2b]/90',
  active,
  onClick,
  className,
  index = 0,
  compact = false,
  micro = false,
}: StudentStatCardProps) {
  const Wrapper = onClick ? 'button' : 'div'
  const dense = micro || compact

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.24) }}
      className={cn('w-full h-full min-w-0', className)}
    >
      <Wrapper
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={cn(
          'w-full h-full text-left rounded-xl sm:rounded-2xl border transition-all duration-200',
          'border-gray-200/70 dark:border-white/10 shadow-sm hover:shadow-md',
          bgClass,
          active && 'ring-2 ring-blue-500/50 border-blue-400/60',
          micro ? 'p-1.5 sm:p-3 rounded-lg sm:rounded-2xl' : compact ? 'p-2 sm:p-3' : 'p-3.5 sm:p-4'
        )}
      >
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'font-medium text-gray-500 dark:text-gray-400 truncate',
                micro
                  ? 'text-[9px] sm:text-xs mb-0 leading-tight'
                  : dense
                    ? 'text-[10px] sm:text-xs mb-0.5'
                    : 'text-xs sm:text-sm mb-1'
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                'font-bold text-gray-900 dark:text-white tabular-nums leading-none',
                micro
                  ? 'text-sm sm:text-xl'
                  : dense
                    ? 'text-base sm:text-xl'
                    : 'text-2xl sm:text-3xl'
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className={cn(
                  'font-medium truncate',
                  colorClass,
                  micro
                    ? 'mt-0.5 text-[8px] sm:text-[10px] hidden sm:block'
                    : dense
                      ? 'mt-1 text-[10px] hidden sm:block'
                      : 'mt-1 text-xs'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              'rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center',
              iconBgClass,
              micro ? 'w-6 h-6 sm:w-8 sm:h-8' : dense ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10'
            )}
          >
            <Icon
              className={cn(
                micro ? 'w-3 h-3 sm:w-4 sm:h-4' : dense ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-5 h-5',
                colorClass
              )}
            />
          </div>
        </div>
      </Wrapper>
    </motion.div>
  )
}
