"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { UniversitySidebar } from './UniversitySidebar'
import { UniversityWelcomeMessage } from './UniversityWelcomeMessage'
import { UniversityDashboardStats } from './UniversityDashboardStats'
import { UniversityAnalyticsChart } from './UniversityAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { UniversityRecentActivities } from './UniversityRecentActivities'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { UniversityDashboardData } from '@/types/university'


interface UniversityDashboardLayoutProps {
    children?: React.ReactNode
}

function UniversityDashboardContent({ children }: UniversityDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<UniversityDashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Fetch university dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'university') {
                try {
                    setIsLoading(true)
                    const data = await apiClient.getUniversityDashboard()
                    console.log('🎯 University Dashboard Data:', data)
                    setDashboardData(data)
                    setError(null)
                } catch (error) {
                    console.error('Failed to fetch university dashboard data:', error)
                    setError('Failed to load dashboard data')
                    // Don't set fallback data - only show real data from backend
                    setDashboardData(null)
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

            {/* UniversitySidebar is now fixed positioned */}
            <UniversitySidebar />

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
                            {dashboardData && !isLoading && (
                                <>
                                    <UniversityWelcomeMessage
                                        universityInfo={dashboardData.university_info}
                                    />

                                    <UniversityDashboardStats
                                        studentStats={dashboardData.student_statistics}
                                        jobStats={dashboardData.job_statistics}
                                        isLoading={isLoading}
                                    />

                                    <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
                                        <div className="xl:col-span-7 space-y-6">
                                            {dashboardData.student_statistics && dashboardData.job_statistics && (
                                                <UniversityAnalyticsChart
                                                    studentStats={dashboardData.student_statistics}
                                                    jobStats={dashboardData.job_statistics}
                                                />
                                            )}
                                            <UniversityRecentActivities
                                                activities={dashboardData.recent_activity}
                                            />
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

export function UniversityDashboardLayout({ children }: UniversityDashboardLayoutProps) {
    return (
        <>
            <UniversityDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}
