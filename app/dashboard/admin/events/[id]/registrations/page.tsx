"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventRegistrations } from '@/components/admin/EventRegistrations'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

export default function AdminEventRegistrationsPage({ params }: { params: { id: string } }) {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <EventRegistrations eventId={params.id} />
      </div>
    </AdminDashboardLayout>
  )
}
