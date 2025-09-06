"use client"

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { ResumeBuilderPage } from '@/components/resume-builder'

export default function ResumeBuilderDashboardPage() {
    return (
        <StudentDashboardLayout>
            <ResumeBuilderPage />
        </StudentDashboardLayout>
    )
}
