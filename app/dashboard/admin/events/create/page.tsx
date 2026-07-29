"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventCreateForm } from '@/components/admin/EventCreateForm'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

export default function CreateEventPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <EventCreateForm />
      </div>
    </AdminDashboardLayout>
  )
}
