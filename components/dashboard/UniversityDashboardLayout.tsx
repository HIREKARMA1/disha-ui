"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { UniversitySidebar } from './UniversitySidebar'
import { UniversityWelcomeMessage } from './UniversityWelcomeMessage'
import { UniversityDashboardStats } from './UniversityDashboardStats'
import { UniversityHomeWidgets } from './UniversityHomeWidgets'
import { UniversityRecentActivities } from './UniversityRecentActivities'
import { corpPageBg } from '@/components/corporate/ui/corporate-theme'
import { UniversityLockScreen } from './UniversityLockScreen'
import { EventPopup } from '@/components/events/EventPopup'
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
    const [universityStatus, setUniversityStatus] = useState<string | null>(null)
    const [universityName, setUniversityName] = useState<string>('')
    const [universityEmail, setUniversityEmail] = useState<string>('')
    const { user } = useAuth()
    const pathname = usePathname()

    // Fetch university profile to check status
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
                    // Default to active if we can't fetch profile
                    setUniversityStatus('active')
                }
            }
        }

        fetchUniversityProfile()
    }, [user?.user_type])

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

    const isLocked = universityStatus === 'inactive' || universityStatus === 'pending'
    const isAllowedPage = pathname === '/dashboard/university/profile' || pathname === '/dashboard/university/licenses'
    const shouldLock = isLocked && !isAllowedPage

    return (
        <div className={corpPageBg}>
            {/* Navbar is now fixed positioned */}
            <Navbar />

            {/* UniversitySidebar is now fixed positioned */}
            <UniversitySidebar />

            {/* Main Content with proper spacing */}
            <div className="pt-16 lg:pl-64">
                <main className={`p-4 md:p-6 lg:p-8 pb-28 lg:pb-8 min-h-screen relative ${shouldLock ? 'pointer-events-none' : ''}`}>
                    {children ? (
                        <>
                            <div className={shouldLock ? 'opacity-40' : ''}>
                                {children}
                            </div>
                            {/* Lock Screen - positioned within main content */}
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
                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !isLoading && (
                                    <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
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

                                        <UniversityHomeWidgets />

                                        <UniversityRecentActivities
                                            activities={dashboardData.recent_activity}
                                        />
                                    </>
                                )}
                            </div>
                            {/* Lock Screen - positioned within main content */}
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
