"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventStatistics } from '@/components/admin/EventStatistics'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

export default function EventStatisticsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <EventStatistics />
      </div>
    </AdminDashboardLayout>
  )
}
