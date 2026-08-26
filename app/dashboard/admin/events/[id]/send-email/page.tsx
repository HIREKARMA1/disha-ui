"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { EventSendEmailForm } from '@/components/admin/EventSendEmailForm'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'

interface PageProps {
  params: { id: string }
}

export default function EventSendEmailPage({ params }: PageProps) {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <EventManagementSubNav />
        <EventSendEmailForm eventId={params.id} />
      </div>
    </AdminDashboardLayout>
  )
}
