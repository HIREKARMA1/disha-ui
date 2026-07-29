"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventList } from '@/components/admin/EventList'

export default function AdminEventsPage() {
  return (
    <AdminDashboardLayout>
      <EventList />
    </AdminDashboardLayout>
  )
}
