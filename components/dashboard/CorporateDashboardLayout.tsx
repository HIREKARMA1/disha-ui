'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { CorporateSidebar } from './CorporateSidebar'
import { CorporateWelcomeMessage } from './CorporateWelcomeMessage'
import { CorporateDashboardStats } from './CorporateDashboardStats'
import { CorporateHomeWidgets } from './CorporateHomeWidgets'
import { EventPopup } from '@/components/events/EventPopup'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { corpPageBg } from '@/components/corporate/ui/corporate-theme'

interface CorporateDashboardLayoutProps {
    children?: React.ReactNode
}

export function CorporateDashboardContent({ children }: CorporateDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [corporateProfile, setCorporateProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'corporate') {
                try {
                    setIsLoading(true)
                    const [dashboardDataResult, profileData] = await Promise.all([
                        apiClient.getCorporateDashboard(),
                        apiClient.getCorporateProfile(),
                    ])
                    setDashboardData(dashboardDataResult)
                    setCorporateProfile(profileData)
                    setError(null)
                } catch (err) {
                    console.error('Failed to fetch corporate dashboard data:', err)
                    setError('Failed to load dashboard data')
                    setDashboardData(null)
                    setCorporateProfile(null)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchDashboardData()
    }, [user?.id, user?.user_type, user?.name])

    return (
        <div className={corpPageBg}>
            <Navbar />
            <CorporateSidebar />

            <div className="pt-16 lg:pl-64">
                <main className="p-4 md:p-6 lg:p-8 pb-28 lg:pb-8 min-h-screen">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
                            <EventPopup />

                            {isLoading && (
                                <div className="flex items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                                </div>
                            )}

                            {error && !isLoading && (
                                <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
                                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                                        Error Loading Dashboard
                                    </h3>
                                    <p className="text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}

                            {!isLoading && (
                                <>
                                    <CorporateWelcomeMessage
                                        companyName={
                                            corporateProfile?.company_name ||
                                            corporateProfile?.name ||
                                            'Company'
                                        }
                                    />
                                    <CorporateDashboardStats
                                        dashboardData={dashboardData}
                                        isLoading={isLoading}
                                    />
                                    <CorporateHomeWidgets />
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export function CorporateDashboardLayout({ children }: CorporateDashboardLayoutProps) {
    return (
        <>
            <CorporateDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}
