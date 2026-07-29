'use client'

import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import { Calendar, Settings } from 'lucide-react'

export default function CorporateSettingsPage() {
    return (
        <CorporateDashboardLayout>
            <div className="space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
                <CorporatePageHero
                    title="Settings ⚙️"
                    subtitle="Manage your account and preferences."
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
                <CorporateGlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gray-500/15 text-gray-500">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Account Settings
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Settings and preference controls will appear here. Your profile can be managed from the
                                Profile page.
                            </p>
                        </div>
                    </div>
                </CorporateGlassCard>
            </div>
        </CorporateDashboardLayout>
    )
}
