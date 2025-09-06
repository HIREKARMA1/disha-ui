"use client"

import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'

export default function UniversityJobs() {
    return (
        <UniversityDashboardLayout>
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Jobs
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Browse and manage job opportunities for your students.
                    </p>
                </div>
            </div>
        </UniversityDashboardLayout>
    )
}






