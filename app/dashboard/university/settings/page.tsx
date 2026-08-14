'use client'

import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { UniversityPageHero } from '@/components/university/ui/UniversityPageHero'
import { UniversityGlassCard } from '@/components/university/ui/UniversityGlassCard'
import { UniversityLicensesManager } from '@/components/university/UniversityLicensesManager'
import { Calendar, Settings } from 'lucide-react'

export default function UniversitySettingsPage() {
    return (
        <UniversityDashboardLayout>
            <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
                <UniversityPageHero
                    title="Settings ⚙️"
                    subtitle="Manage your account, licenses, and institutional preferences."
                    chips={[
                        {
                            label: new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            }),
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                    ]}
                />
                <UniversityGlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gray-500/15 text-gray-500">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Account Settings
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Profile details can be managed from the Profile page. License allocation and renewals
                                for your institution are listed below.
                            </p>
                        </div>
                    </div>
                </UniversityGlassCard>
            </div>
            <UniversityLicensesManager
                showHero={false}
                withLayout={false}
                heroTitle="Settings ⚙️"
                heroSubtitle="Manage your account, licenses, and institutional preferences."
            />
        </UniversityDashboardLayout>
    )
}
