"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminUniversitiesView } from '@/components/dashboard/AdminUniversitiesView'

export default function AdminUniversities() {
    return (
        <AdminDashboardLayout>
            <AdminUniversitiesView />
        </AdminDashboardLayout>
    )
}
