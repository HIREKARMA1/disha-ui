'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminOfferLetterList } from '@/components/admin/AdminOfferLetterList'

export default function AdminOfferLettersPage() {
  return (
    <AdminDashboardLayout>
      <AdminOfferLetterList />
    </AdminDashboardLayout>
  )
}
