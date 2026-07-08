"use client"

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
  FileText,
  Target,
  Clock,
  IndianRupee,
  Building2,
  GraduationCap,
  Brain,
  Users,
} from 'lucide-react'
import { AnalyticsKpi as KpiType } from '@/types/corporateAnalytics'
import { StatsSkeleton } from '@/components/ui/LoadingSkeleton'

const CORPORATE_KPI_IDS = [
  'active_jobs',
  'archived_jobs',
  'total_job_postings',
  'applications',
  'conversion_rate',
  'avg_time_to_hire',
]

const UNIVERSITY_KPI_IDS = [
  'placement_percentage',
  'average_package',
  'highest_package',
  'active_corporate_partners',
  'test_engagement_rate',
]

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  active_jobs: Briefcase,
  archived_jobs: Briefcase,
  total_job_postings: Briefcase,
  applications: FileText,
  conversion_rate: Target,
  avg_time_to_hire: Clock,
  placement_percentage: GraduationCap,
  average_package: IndianRupee,
  highest_package: TrendingUp,
  active_corporate_partners: Building2,
  test_engagement_rate: Brain,
  candidates: Users,
  hires: Target,
}

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  active_jobs: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  archived_jobs: { color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800/40' },
  total_job_postings: { color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  applications: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  conversion_rate: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  avg_time_to_hire: { color: 'text-secondary-600', bg: 'bg-secondary-50 dark:bg-secondary-900/20' },
  placement_percentage: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  average_package: { color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  highest_package: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  active_corporate_partners: { color: 'text-secondary-600', bg: 'bg-secondary-50 dark:bg-secondary-900/20' },
  test_engagement_rate: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
}

function formatKpiValue(kpi: KpiType): string {
  if (kpi.unit === 'INR') {
    return `₹${Number(kpi.value).toLocaleString('en-IN')}`
  }
  if (kpi.unit === '%') {
    return `${kpi.value}%`
  }
  if (kpi.unit === 'days') {
    return `${kpi.value}`
  }
  return Number(kpi.value).toLocaleString('en-IN')
}

interface AnalyticsKpiCardsProps {
  kpis: KpiType[]
  isLoading?: boolean
  columns?: 4 | 5 | 6
  className?: string
  kpiIds?: string[]
}

export function AnalyticsKpiCards({
  kpis,
  isLoading = false,
  columns = 4,
  className = '',
  kpiIds,
}: AnalyticsKpiCardsProps) {
  if (isLoading) {
    return <StatsSkeleton count={columns} />
  }

  const displayKpis = kpiIds?.length
    ? kpiIds.map((id) => kpis.find((k) => k.id === id)).filter(Boolean) as KpiType[]
    : kpis.slice(0, columns)

  const gridClass =
    columns === 6
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'
      : columns === 5
      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'

  return (
    <div className={`${gridClass} ${className}`}>
      {displayKpis.map((kpi, index) => {
        const Icon = ICON_MAP[kpi.id] || Briefcase
        const colors = COLOR_MAP[kpi.id] || COLOR_MAP.total_job_postings
        const TrendIcon =
          kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus
        const trendColor =
          kpi.trend === 'up'
            ? 'text-emerald-600'
            : kpi.trend === 'down'
              ? 'text-red-500'
              : 'text-gray-400'

        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className={`p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 ${colors.bg}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">
                  {kpi.label}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {formatKpiValue(kpi)}
                  {kpi.unit === 'days' && (
                    <span className="text-base font-medium text-gray-500 ml-1">days</span>
                  )}
                </p>
                {kpi.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                    {kpi.description}
                  </p>
                )}
                {kpi.change_percent !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    <span>
                      {kpi.change_percent > 0 ? '+' : ''}
                      {kpi.change_percent}% vs prior period
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm shrink-0">
                <Icon className={`w-6 h-6 ${colors.color}`} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export { CORPORATE_KPI_IDS, UNIVERSITY_KPI_IDS }