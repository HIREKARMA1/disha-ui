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
import { QuickAccountSetupModal } from '@/components/jobs/QuickAccountSetupModal'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { isQuickAccountSetupPending } from '@/lib/quickAccountSetupStorage'

interface StudentDashboardLayoutProps {
    children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
    const [studentName, setStudentName] = useState<string>('Student')
    const [quickSetupPending, setQuickSetupPending] = useState(false)
    const [showQuickSetup, setShowQuickSetup] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        const pending = isQuickAccountSetupPending()
        setQuickSetupPending(pending)
        setShowQuickSetup(pending)
    }, [])

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

    const handleQuickSetupComplete = () => {
        setQuickSetupPending(false)
        setShowQuickSetup(false)
    }

    return (
        <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0a0c14]">
            <StudentTopNav />
            <StudentSidebar />

            <div className="pt-16 lg:pl-64">
                <main className="relative min-h-0 min-w-0 p-3 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:p-5 lg:p-6 lg:pb-6">
                    {children ? (
                        <div>{children}</div>
                    ) : (
                        <>
                            {showQuickSetup && (
                                <QuickAccountSetupModal
                                    onClose={() => setShowQuickSetup(false)}
                                    onComplete={handleQuickSetupComplete}
                                />
                            )}
                            {!quickSetupPending && <EventPopup />}
                            <div className="space-y-6">
                                <WelcomeMessage studentName={studentName} />
                                <DashboardStats />
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 items-start">
                                    <div className="xl:col-span-8 space-y-3 sm:space-y-4 min-w-0 h-auto">
                                        <AnalyticsChart />
                                        <RecentActivities />
                                    </div>
                                    <div className="xl:col-span-4 space-y-3 sm:space-y-4 min-w-0 h-auto self-start">
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
