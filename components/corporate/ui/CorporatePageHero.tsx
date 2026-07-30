'use client'

import { motion } from 'framer-motion'
import { CHIP_STYLES, corpHero, type ChipTone } from './corporate-theme'
import { cn } from '@/lib/utils'

export interface HeroChip {
  label: string
  tone?: ChipTone
  icon?: React.ReactNode
}

interface CorporatePageHeroProps {
  title: string
  subtitle?: string
  chips?: HeroChip[]
  actions?: React.ReactNode
  className?: string
  /** When true, removes card chrome on mobile (dashboard welcome style) */
  bareOnMobile?: boolean
}

export function CorporatePageHero({
  title,
  subtitle,
  chips = [],
  actions,
  className = '',
  bareOnMobile = false,
}: CorporatePageHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        bareOnMobile
          ? 'md:rounded-[18px] md:p-6 md:border md:border-primary-200/60 dark:md:border-blue-500/20 md:bg-gradient-to-r md:from-primary-50 md:to-primary-100 dark:md:from-blue-950/40 dark:md:via-[#0D1628] dark:md:to-violet-950/30 p-0 border-0 bg-transparent'
          : corpHero,
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-[22px] md:text-[32px] lg:text-[40px] font-bold text-gray-900 dark:text-white mb-1 md:mb-2 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-[13px] md:text-sm mb-2.5 md:mb-4">
              {subtitle}
            </p>
          )}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, i) => (
                <motion.span
                  key={`${chip.label}-${i}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.05 * i }}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] md:text-sm font-medium',
                    CHIP_STYLES[chip.tone || 'blue']
                  )}
                >
                  {chip.icon}
                  {chip.label}
                </motion.span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </motion.div>
  )
}
