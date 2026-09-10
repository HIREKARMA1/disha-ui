'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import type { LucideIcon } from 'lucide-react'

export interface StudentStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  /** Explains the metric on hover / long-press. Defaults to label + subtitle. */
  tooltip?: string
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
  tooltip,
  colorClass = 'text-primary-600 dark:text-primary-400',
  iconBgClass = 'bg-primary-50 dark:bg-primary-950/50',
  bgClass = 'bg-white dark:bg-gray-900',
  active,
  onClick,
  className,
  index = 0,
  compact = false,
  micro = false,
}: StudentStatCardProps) {
  const Wrapper = onClick ? 'button' : 'div'
  const dense = micro || compact
  const tip =
    tooltip ||
    [label, subtitle ? String(subtitle) : null, `Current value: ${value}`]
      .filter(Boolean)
      .join(' — ')

  const card = (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full h-full text-left rounded-xl border transition-[box-shadow,border-color] duration-200',
        'border-gray-200 shadow-sm dark:border-gray-700',
        'hover:border-primary-200 hover:shadow-md dark:hover:border-primary-800',
        bgClass,
        active && 'ring-1 ring-primary-200/60 border-primary-300 dark:ring-primary-800/60 dark:border-primary-700',
        micro ? 'p-1.5 sm:p-3 rounded-lg sm:rounded-xl' : compact ? 'p-2.5 sm:p-3.5' : 'p-3.5 sm:p-4'
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
            'rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10',
            iconBgClass,
            micro ? 'w-6 h-6 sm:w-8 sm:h-8' : dense ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-10 h-10'
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
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.24) }}
      className={cn('w-full h-full min-w-0', className)}
    >
      <Tooltip content={tip}>
        {card}
      </Tooltip>
    </motion.div>
  )
}
