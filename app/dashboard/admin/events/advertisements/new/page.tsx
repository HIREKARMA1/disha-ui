"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdvertisementEditForm } from '@/components/admin/AdvertisementEditForm'

export default function NewAdvertisementPage() {
  return (
    <AdminDashboardLayout>
      <AdvertisementEditForm />
    </AdminDashboardLayout>
  )
}
