'use client'

import { motion } from 'framer-motion'
import { STAT_ACCENTS, type StatAccent } from './corporate-theme'
import { cn } from '@/lib/utils'

interface CorporateStatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  accent?: StatAccent
  index?: number
  isLoading?: boolean
  className?: string
  onClick?: () => void
  /** Tighter padding / height for dense dashboards (e.g. Admin home). */
  compact?: boolean
}

export function CorporateStatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = 'blue',
  index = 0,
  isLoading = false,
  className = '',
  onClick,
  compact = false,
}: CorporateStatCardProps) {
  const tones = STAT_ACCENTS[accent]

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-[18px] border animate-pulse h-full',
          compact ? 'p-2.5 min-h-[72px]' : 'p-6 min-h-[140px]',
          tones.card,
          className
        )}
      >
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded mb-2 w-24" />
        <div className={cn('bg-gray-200 dark:bg-white/10 rounded mb-1.5 w-14', compact ? 'h-6' : 'h-10')} />
        <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-20" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className={cn('w-full h-full', className)}
    >
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick()
              }
            : undefined
        }
        className={cn(
          'group rounded-[18px] border transition-all duration-300 hover:-translate-y-0.5 w-full h-full',
          compact
            ? 'p-2.5 md:p-3 min-h-[72px] md:min-h-[80px]'
            : 'p-4 md:p-6 min-h-[120px] md:min-h-[140px]',
          tones.card,
          onClick && 'cursor-pointer'
        )}
      >
        <div className={cn('flex items-center justify-between h-full', compact ? 'gap-2' : 'gap-4')}>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p
              className={cn(
                'font-medium text-gray-600 dark:text-gray-400 truncate',
                compact ? 'text-[12px] mb-0.5' : 'text-[14px] mb-1.5'
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                'font-bold text-gray-900 dark:text-white leading-none tabular-nums group-hover:scale-[1.02] transition-transform origin-left',
                compact
                  ? 'text-[20px] md:text-[24px] lg:text-[26px]'
                  : 'text-[28px] md:text-[40px] lg:text-[44px]'
              )}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className={cn(
                  'text-gray-500 dark:text-gray-400 truncate',
                  compact ? 'text-[11px] mt-0.5' : 'text-xs md:text-[14px] mt-2'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              'rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300',
              compact ? 'w-8 h-8' : 'w-10 h-10 md:w-14 md:h-14',
              tones.icon
            )}
          >
            <Icon className={cn(compact ? 'w-4 h-4' : 'w-5 h-5 md:w-7 md:h-7')} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
