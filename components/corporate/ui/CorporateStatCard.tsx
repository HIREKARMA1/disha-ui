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
}: CorporateStatCardProps) {
  const tones = STAT_ACCENTS[accent]

  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-[18px] border p-6 animate-pulse h-full min-h-[140px]',
          tones.card,
          className
        )}
      >
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded mb-3 w-28" />
        <div className="h-10 bg-gray-200 dark:bg-white/10 rounded mb-2 w-16" />
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
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
                        'group p-4 md:p-6 rounded-[18px] border transition-all duration-300 hover:-translate-y-0.5 w-full h-full min-h-[120px] md:min-h-[140px]',
          tones.card,
          onClick && 'cursor-pointer'
        )}
      >
        <div className="flex items-center justify-between gap-4 h-full">
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[14px] font-medium text-gray-600 dark:text-gray-400 mb-1.5 truncate">
              {label}
            </p>
            <p className="text-[28px] md:text-[40px] lg:text-[44px] font-bold text-gray-900 dark:text-white leading-none tabular-nums group-hover:scale-[1.02] transition-transform origin-left">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs md:text-[14px] text-gray-500 dark:text-gray-400 mt-2 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              'w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300',
              tones.icon
            )}
          >
            <Icon className="w-5 h-5 md:w-7 md:h-7" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
