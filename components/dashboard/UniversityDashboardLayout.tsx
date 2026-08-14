"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { UniversitySidebar } from './UniversitySidebar'
import { UniversityWelcomeMessage } from './UniversityWelcomeMessage'
import { UniversityDashboardStats } from './UniversityDashboardStats'
import { UniversityAnalyticsChart } from './UniversityAnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { UniversityRecentActivities } from './UniversityRecentActivities'
import { UniversityQuickActions } from './UniversityQuickActions'
import { UniversityLockScreen } from './UniversityLockScreen'
import { EventPopup } from '@/components/events/EventPopup'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { UniversityDashboardData } from '@/types/university'
import { uniPageBg } from '@/components/university/ui/university-theme'

interface UniversityDashboardLayoutProps {
    children?: React.ReactNode
}

function UniversityDashboardContent({ children }: UniversityDashboardLayoutProps) {
    const [dashboardData, setDashboardData] = useState<UniversityDashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [universityStatus, setUniversityStatus] = useState<string | null>(null)
    const [universityName, setUniversityName] = useState<string>('')
    const [universityEmail, setUniversityEmail] = useState<string>('')
    const { user } = useAuth()
    const pathname = usePathname()

    useEffect(() => {
        const fetchUniversityProfile = async () => {
            if (user?.user_type === 'university') {
                try {
                    const profile = await apiClient.getUniversityProfile()
                    setUniversityStatus(profile.status || 'active')
                    setUniversityName(profile.university_name || profile.name || '')
                    setUniversityEmail(profile.email || '')
                } catch (error) {
                    console.error('Failed to fetch university profile:', error)
                    setUniversityStatus('active')
                }
            }
        }

        fetchUniversityProfile()
    }, [user?.user_type])

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user?.user_type === 'university') {
                try {
                    setIsLoading(true)
                    const data = await apiClient.getUniversityDashboard()
                    setDashboardData(data)
                    setError(null)
                } catch (error) {
                    console.error('Failed to fetch university dashboard data:', error)
                    setError('Failed to load dashboard data')
                    setDashboardData(null)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        fetchDashboardData()
    }, [user?.id, user?.user_type, user?.name])

    const isLocked = universityStatus === 'inactive' || universityStatus === 'pending'
    const isAllowedPage =
        pathname === '/dashboard/university/profile' ||
        pathname === '/dashboard/university/licenses' ||
        pathname === '/dashboard/university/settings'
    const shouldLock = isLocked && !isAllowedPage

    return (
        <div className={uniPageBg}>
            <Navbar />
            <UniversitySidebar />

            <div className="pt-16 lg:pl-64">
                <main
                    className={`p-4 md:p-6 lg:p-8 pb-28 lg:pb-8 min-h-screen relative overflow-x-hidden ${shouldLock ? 'pointer-events-none' : ''}`}
                >
                    {children ? (
                        <>
                            <div className={shouldLock ? 'opacity-40' : ''}>{children}</div>
                            {shouldLock && (
                                <UniversityLockScreen
                                    isOpen={shouldLock}
                                    universityName={universityName}
                                    email={universityEmail}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <EventPopup />
                            <div className={`space-y-4 md:space-y-6 max-w-[1600px] mx-auto ${shouldLock ? 'opacity-40' : ''}`}>
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

                                {dashboardData && !isLoading && (
                                    <>
                                        <UniversityWelcomeMessage universityInfo={dashboardData.university_info} />

                                        <UniversityDashboardStats
                                            studentStats={dashboardData.student_statistics}
                                            jobStats={dashboardData.job_statistics}
                                            isLoading={isLoading}
                                        />

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 items-start">
                                            <div className="xl:col-span-8 space-y-4 md:space-y-6 min-w-0">
                                                <UniversityAnalyticsChart />
                                                <UniversityRecentActivities
                                                    activities={dashboardData.recent_activity}
                                                />
                                            </div>
                                            <div className="xl:col-span-4 space-y-4 md:space-y-6 min-w-0">
                                                <AdvertisementBanner />
                                                <UniversityQuickActions />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {shouldLock && (
                                <UniversityLockScreen
                                    isOpen={shouldLock}
                                    universityName={universityName}
                                    email={universityEmail}
                                />
                            )}
                        </>
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
