'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { CampusDriveCreateForm } from '@/components/admin/CampusDriveCreateForm'

export default function EditCampusDrivePage({ params }: { params: { id: string } }) {
  return (
    <AdminDashboardLayout>
      <CampusDriveCreateForm driveId={params.id} />
    </AdminDashboardLayout>
  )
}
