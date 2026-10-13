'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CampusDriveStatistics } from '@/components/admin/CampusDriveStatistics'

export default function CampusDriveStatisticsPage() {
  return (
    <AdminDashboardLayout>
      <CampusDriveStatistics />
    </AdminDashboardLayout>
  )
}
