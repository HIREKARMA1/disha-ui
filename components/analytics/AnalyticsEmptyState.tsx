"use client"

import { LucideIcon, BarChart3 } from 'lucide-react'

interface AnalyticsEmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
}

export function AnalyticsEmptyState({
  title,
  description = 'Data will appear here once available.',
  icon: Icon = BarChart3,
  className = '',
}: AnalyticsEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full min-h-[220px] text-center px-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">{description}</p>
    </div>
  )
}
