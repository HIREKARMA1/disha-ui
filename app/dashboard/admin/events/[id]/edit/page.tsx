"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventCreateForm } from '@/components/admin/EventCreateForm'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

interface PageProps {
  params: { id: string }
}

export default function EditEventPage({ params }: PageProps) {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <EventCreateForm eventId={params.id} />
      </div>
    </AdminDashboardLayout>
  )
}
