import { AdminEventLayout } from '@/components/admin/AdminEventLayout'
import { EventRegistrations } from '@/components/admin/EventRegistrations'

export default function AdminEventRegistrationsPage({ params }: { params: { id: string } }) {
  return (
    <AdminEventLayout>
      <EventRegistrations eventId={params.id} />
    </AdminEventLayout>
  )
}
