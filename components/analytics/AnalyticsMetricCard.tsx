'use client'

import { LucideIcon } from 'lucide-react'

interface AnalyticsMetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}

const accentClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
}

export function AnalyticsMetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent = 'blue',
}: AnalyticsMetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${accentClasses[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
