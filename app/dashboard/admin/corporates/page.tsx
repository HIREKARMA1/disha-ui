"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminCorporatesView } from '@/components/dashboard/AdminCorporatesView'

export default function AdminCorporates() {
    return (
        <AdminDashboardLayout>
            <AdminCorporatesView />
        </AdminDashboardLayout>
    )
}
