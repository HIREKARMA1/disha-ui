"use client"

import { useState, useEffect } from 'react'
import { StudentTopNav } from './StudentTopNav'
import { StudentSidebar } from './StudentSidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { DashboardStats } from './DashboardStats'
import { AnalyticsChart } from './AnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { RecentActivities } from './RecentActivities'
import { StudentQuickActions } from './StudentQuickActions'
import { StudentResumeStrength } from './StudentResumeStrength'
import { RecommendedJobs } from './RecommendedJobs'
import { EventPopup } from '@/components/events/EventPopup'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'

interface StudentDashboardLayoutProps {
    children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
    const [studentName, setStudentName] = useState<string>('Student')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.user_type === 'student' && user?.id) {
                try {
                    const profileData = await apiClient.getStudentProfile()
                    if (profileData?.name && profileData.name.trim()) {
                        setStudentName(profileData.name)
                    } else if (user?.name) {
                        setStudentName(user.name)
                    }
                } catch (error: any) {
                    console.error('Failed to fetch student profile:', error)
                    if (user?.name) {
                        setStudentName(user.name)
                    }
                }
            }
        }

        fetchProfile()
    }, [user?.id, user?.user_type, user?.name])

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-950">
            <StudentSidebar
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <StudentTopNav onMenuOpen={() => setMobileMenuOpen(true)} />

                <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-visible p-3 pb-6 sm:p-5 lg:p-6">
                    {children ? (
                        <div>{children}</div>
                    ) : (
                        <>
                            <EventPopup />
                            <div className="mx-auto w-full max-w-[1400px] space-y-6 sm:space-y-8">
                                <WelcomeMessage studentName={studentName} />
                                <DashboardStats />
                                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12 xl:gap-5">
                                    <div className="min-w-0 space-y-4 xl:col-span-8">
                                        <AnalyticsChart />
                                        <RecentActivities />
                                    </div>
                                    <div className="min-w-0 space-y-4 self-start xl:col-span-4">
                                        <AdvertisementBanner />
                                        <StudentQuickActions />
                                        <StudentResumeStrength />
                                    </div>
                                </div>
                                <RecommendedJobs />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}

export function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
    return (
        <>
            <StudentDashboardContent children={children} />
            <LoadingOverlay />
        </>
    )
}
