'use client'

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporateAnalyticsDashboard } from '@/components/analytics'

export default function CorporateAnalyticsPage() {
  return (
    <CorporateDashboardLayout>
      <CorporateAnalyticsDashboard />
    </CorporateDashboardLayout>
  )
}
