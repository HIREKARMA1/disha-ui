"use client"

import { useEffect, useState } from 'react'
import { UniversityAnalyticsDashboard } from '@/components/analytics/UniversityAnalyticsDashboard'
import { UniversityAnalyticsDashboardData } from '@/types/universityAnalytics'
import { apiClient } from '@/lib/api'

interface UniversityAnalyticsChartProps {
  className?: string
}

export function UniversityAnalyticsChart({ className = '' }: UniversityAnalyticsChartProps) {
  const [data, setData] = useState<UniversityAnalyticsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const result = await apiClient.getUniversityAnalyticsDashboard()
        setData(result)
        setError(null)
      } catch {
        setError('Failed to load analytics')
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (error && !isLoading) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <UniversityAnalyticsDashboard
      data={data}
      isLoading={isLoading}
      className={className}
      showKpis={false}
    />
  )
}
