"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminMockTestManager } from '@/components/admin/AdminMockTestManager'

export default function AdminMockTestsPage() {
  return (
    <AdminDashboardLayout>
      <AdminMockTestManager />
    </AdminDashboardLayout>
  )
}
