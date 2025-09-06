"use client"

import { AdminEventLayout } from '@/components/admin/AdminEventLayout'
import { PendingApprovalEvents } from '@/components/admin/PendingApprovalEvents'

export default function PendingApprovalPage() {
    return (
        <AdminEventLayout>
            <PendingApprovalEvents />
        </AdminEventLayout>
    )
}
