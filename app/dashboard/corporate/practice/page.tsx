"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporatePracticeManager } from '@/components/corporate/CorporatePracticeManager'

export default function CorporatePracticePage() {
    return (
        <CorporateDashboardLayout>
            <CorporatePracticeManager />
        </CorporateDashboardLayout>
    )
}
