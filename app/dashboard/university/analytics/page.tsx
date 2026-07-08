"use client"

import { useEffect, useState } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { UniversityAnalyticsDashboard } from '@/components/analytics/UniversityAnalyticsDashboard'
import { UniversityAnalyticsDashboardData } from '@/types/universityAnalytics'
import { apiClient } from '@/lib/api'

export default function UniversityAnalyticsPage() {
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
        setError('Failed to load analytics data')
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <UniversityDashboardLayout>
      <div className="space-y-6">
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        <UniversityAnalyticsDashboard data={data} isLoading={isLoading} />
      </div>
    </UniversityDashboardLayout>
  )
}
