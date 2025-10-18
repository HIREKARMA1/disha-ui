"use client"

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { PracticeDashboard } from '@/components/practice/PracticeDashboard'

export default function StudentPracticePage() {
    return (
        <StudentDashboardLayout>
            <PracticeDashboard />
        </StudentDashboardLayout>
    )
}