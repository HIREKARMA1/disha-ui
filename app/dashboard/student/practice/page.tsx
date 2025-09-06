"use client"

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { PracticeDashboard } from '@/components/practice/PracticeDashboard'

export default function PracticePage() {
    return (
        <StudentDashboardLayout>
            <PracticeDashboard />
        </StudentDashboardLayout>
    )
}
