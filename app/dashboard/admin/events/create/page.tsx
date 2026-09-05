"use client"

import { Suspense } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventCreateForm } from '@/components/admin/EventCreateForm'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

export default function CreateEventPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading form…</div>}>
          <EventCreateForm />
        </Suspense>
      </div>
    </AdminDashboardLayout>
  )
}
