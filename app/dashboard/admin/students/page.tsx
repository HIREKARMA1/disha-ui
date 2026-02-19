"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminStudentsView } from '@/components/dashboard/AdminStudentsView'

export default function AdminStudentsPage() {
    return (
        <AdminDashboardLayout>
            <AdminStudentsView />
        </AdminDashboardLayout>
    )
}
