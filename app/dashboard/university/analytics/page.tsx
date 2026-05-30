'use client'

import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { UniversityAnalyticsDashboard } from '@/components/analytics'

export default function UniversityAnalyticsPage() {
  return (
    <UniversityDashboardLayout>
      <UniversityAnalyticsDashboard />
    </UniversityDashboardLayout>
  )
}
