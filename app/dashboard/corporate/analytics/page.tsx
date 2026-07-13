"use client"

import { useEffect, useState } from 'react'
import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporateAnalyticsDashboard } from '@/components/analytics/CorporateAnalyticsDashboard'
import { CorporateAnalyticsDashboardData } from '@/types/corporateAnalytics'
import { apiClient } from '@/lib/api'

export default function CorporateAnalyticsPage() {
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
        setError('Failed to load analytics data')
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <CorporateDashboardLayout>
      <div className="space-y-6">
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        <CorporateAnalyticsDashboard data={data} isLoading={isLoading} />
      </div>
    </CorporateDashboardLayout>
  )
}
