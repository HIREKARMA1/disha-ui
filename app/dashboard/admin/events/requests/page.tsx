"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventRequestList } from '@/components/admin/EventRequestList'

export default function EventRequestsPage() {
  return (
    <AdminDashboardLayout>
      <EventRequestList />
    </AdminDashboardLayout>
  )
}
