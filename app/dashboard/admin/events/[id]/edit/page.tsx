"use client"

import { AdminEventLayout } from '@/components/admin/AdminEventLayout'
import { EventCreateForm } from '@/components/admin/EventCreateForm'

interface PageProps {
  params: { id: string }
}

export default function EditEventPage({ params }: PageProps) {
  return (
    <AdminEventLayout>
      <EventCreateForm eventId={params.id} />
    </AdminEventLayout>
  )
}
