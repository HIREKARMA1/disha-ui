"use client"

import { AdminEventLayout } from '@/components/admin/AdminEventLayout'
import { EventList } from '@/components/admin/EventList'

export default function AdminEventsPage() {
    return (
        <AdminEventLayout>
            <EventList />
        </AdminEventLayout>
    )
}
