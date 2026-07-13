"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'

interface AnalyticsChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  isLoading?: boolean
  action?: ReactNode
  className?: string
}

export function AnalyticsChartCard({
  title,
  subtitle,
  children,
  isLoading = false,
  action,
  className = '',
}: AnalyticsChartCardProps) {
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${className}`}>
        <CardSkeleton count={1} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="min-h-[260px]">{children}</div>
    </motion.div>
  )
}
