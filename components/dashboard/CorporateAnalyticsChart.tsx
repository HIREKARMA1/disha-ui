"use client"

import { useEffect, useState } from 'react'
import { CorporateAnalyticsDashboard } from '@/components/analytics/CorporateAnalyticsDashboard'
import { CorporateAnalyticsDashboardData } from '@/types/corporateAnalytics'
import { apiClient } from '@/lib/api'

interface CorporateAnalyticsChartProps {
  className?: string
}

export function CorporateAnalyticsChart({ className = '' }: CorporateAnalyticsChartProps) {
  const [data, setData] = useState<CorporateAnalyticsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const result = await apiClient.getCorporateAnalyticsDashboard()
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
    <CorporateAnalyticsDashboard
      data={data}
      isLoading={isLoading}
      className={className}
      showKpis={false}
    />
  )
}
