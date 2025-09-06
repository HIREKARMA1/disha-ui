"use client"

import { AdminEventLayout } from '@/components/admin/AdminEventLayout'
import { EventCreateForm } from '@/components/admin/EventCreateForm'

export default function CreateEventPage() {
    return (
        <AdminEventLayout>
            <EventCreateForm />
        </AdminEventLayout>
    )
}
