"use client"

import { AdminEventLayout } from '@/components/admin/AdminEventLayout'
import { EventStatistics } from '@/components/admin/EventStatistics'

export default function EventStatisticsPage() {
    return (
        <AdminEventLayout>
            <EventStatistics />
        </AdminEventLayout>
    )
}
