"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdvertisementList } from '@/components/admin/AdvertisementList'

export default function AdminAdvertisementsPage() {
  return (
    <AdminDashboardLayout>
      <AdvertisementList />
    </AdminDashboardLayout>
  )
}
