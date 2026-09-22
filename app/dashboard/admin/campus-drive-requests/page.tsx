"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CampusDriveRequestList } from '@/components/admin/CampusDriveRequestList'

export default function CampusDriveRequestsPage() {
  return (
    <AdminDashboardLayout>
      <CampusDriveRequestList />
    </AdminDashboardLayout>
  )
}
