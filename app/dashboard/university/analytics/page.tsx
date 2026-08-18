"use client"

import { useEffect, useState } from 'react'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { UniversityAnalyticsDashboard } from '@/components/analytics/UniversityAnalyticsDashboard'
import { UniversityAnalyticsDashboardData } from '@/types/universityAnalytics'
import { apiClient } from '@/lib/api'
import { UniversityPageHero } from '@/components/university/ui/UniversityPageHero'
import { Calendar, BarChart3 } from 'lucide-react'

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
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <UniversityPageHero
          title="Placement Analytics 📊"
          subtitle="Placements, employability, company engagement, and assessment performance"
          chips={[
            {
              label: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              }),
              tone: 'blue',
              icon: <Calendar className="w-3.5 h-3.5" />,
            },
            {
              label: 'Insights',
              tone: 'purple',
              icon: <BarChart3 className="w-3.5 h-3.5" />,
            },
          ]}
        />
        {error && !isLoading && (
          <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        <UniversityAnalyticsDashboard data={data} isLoading={isLoading} showHeader={false} />
      </div>
    </UniversityDashboardLayout>
  )
}
