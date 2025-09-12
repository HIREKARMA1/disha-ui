"use client"

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { PracticeDashboard } from '@/components/practice/PracticeDashboard'
import FeatureGuard from '@/components/student/FeatureGuard'

export default function PracticePage() {
    return (
        <StudentDashboardLayout>
            <FeatureGuard featureKey="practice">
                <PracticeDashboard />
            </FeatureGuard>
        </StudentDashboardLayout>
    )
}
