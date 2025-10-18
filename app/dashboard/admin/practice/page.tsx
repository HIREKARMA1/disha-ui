"use client"

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPracticeManager } from '@/components/admin/AdminPracticeManager'

export default function AdminPracticePage() {
    return (
        <AdminDashboardLayout>
            <AdminPracticeManager />
        </AdminDashboardLayout>
    )
}