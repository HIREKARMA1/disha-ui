"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { PendingApprovalEvents } from '@/components/admin/PendingApprovalEvents'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

export default function PendingApprovalPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <PendingApprovalEvents />
      </div>
    </AdminDashboardLayout>
  )
}
