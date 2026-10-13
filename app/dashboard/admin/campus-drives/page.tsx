'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CampusDriveList } from '@/components/admin/CampusDriveList'

export default function AdminCampusDrivesPage() {
  return (
    <AdminDashboardLayout>
      <CampusDriveList />
    </AdminDashboardLayout>
  )
}
