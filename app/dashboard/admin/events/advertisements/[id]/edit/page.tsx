"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdvertisementEditForm } from '@/components/admin/AdvertisementEditForm'

export default function EditAdvertisementPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <AdminDashboardLayout>
      <AdvertisementEditForm advertisementId={params.id} />
    </AdminDashboardLayout>
  )
}
