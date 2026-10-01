'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CampusDriveCreateForm } from '@/components/admin/CampusDriveCreateForm'

export default function CreateCampusDrivePage() {
  return (
    <AdminDashboardLayout>
      <CampusDriveCreateForm />
    </AdminDashboardLayout>
  )
}
