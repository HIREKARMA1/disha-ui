"use client"

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { ResumeBuilderPage } from '@/components/resume-builder'
import FeatureGuard from '@/components/student/FeatureGuard'

export default function ResumeBuilderDashboardPage() {
    return (
        <StudentDashboardLayout>
            <FeatureGuard featureKey="resume">
                <ResumeBuilderPage />
            </FeatureGuard>
        </StudentDashboardLayout>
    )
}
