"use client"

import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { UniversityPracticeManager } from '@/components/university/UniversityPracticeManager'

export default function UniversityPracticePage() {
    return (
        <UniversityDashboardLayout>
            <UniversityPracticeManager />
        </UniversityDashboardLayout>
    )
}
