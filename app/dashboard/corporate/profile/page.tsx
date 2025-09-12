"use client"

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'

export default function CorporateProfilePage() {
    return (
        <CorporateDashboardLayout>
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Company Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your company information and settings.
                    </p>
                </div>
            </div>
        </CorporateDashboardLayout>
    )
}

