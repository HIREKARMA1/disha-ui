"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { CorporateSidebar } from './CorporateSidebar'
import { CorporateWelcomeMessage } from './CorporateWelcomeMessage'
import { CorporateDashboardStats } from './CorporateDashboardStats'
import { CorporateAnalyticsChart } from './CorporateAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { CorporateRecentActivities } from './CorporateRecentActivities'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'

interface CorporateDashboardLayoutProps {
    children?: React.ReactNode
}

export function CorporateDashboardContent({ children }: CorporateDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [corporateProfile, setCorporateProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch corporate dashboard data and profile
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'corporate') {
                try {
                    setIsLoading(true)
                    // Fetch dashboard data and profile in parallel
                    const [dashboardDataResult, profileData] = await Promise.all([
                        apiClient.getCorporateDashboard(),
                        apiClient.getCorporateProfile()
                    ])
                    console.log('🎯 Corporate Dashboard Data:', dashboardDataResult)
                    console.log('🎯 Corporate Profile Data:', profileData)
                    setDashboardData(dashboardDataResult)
                    setCorporateProfile(profileData)
                    setError(null)
                } catch (error) {
                    console.error('Failed to fetch corporate dashboard data:', error)
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar is now fixed positioned */}
            <Navbar />

            {/* CorporateSidebar is now fixed positioned */}
            <CorporateSidebar />

            {/* Main Content with proper spacing */}
            <div className="pt-16 lg:pl-64">
                <main className="p-6 pb-safe lg:pb-6 min-h-screen">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-6">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !isLoading && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                                        Error Loading Dashboard
                                    </h3>
                                    <p className="text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}

                            {/* Dashboard Content */}
                            {!isLoading && (
                                <>
                                    <CorporateWelcomeMessage companyName={corporateProfile?.company_name || corporateProfile?.name || 'Company'} />

                                    <CorporateDashboardStats dashboardData={dashboardData} isLoading={isLoading} />

                                    <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
                                        <div className="xl:col-span-7 space-y-6">
                                            <CorporateAnalyticsChart />
                                            <CorporateRecentActivities />
                                        </div>
                                        <div className="xl:col-span-3 space-y-6">
                                            <AdvertisementBanner />
                                        </div>
                                    </div>
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

