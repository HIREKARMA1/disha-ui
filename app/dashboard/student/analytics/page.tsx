'use client'

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { StudentAnalyticsDashboard } from '@/components/analytics'

export default function StudentAnalyticsPage() {
  return (
    <StudentDashboardLayout>
      <StudentAnalyticsDashboard />
    </StudentDashboardLayout>
  )
}
