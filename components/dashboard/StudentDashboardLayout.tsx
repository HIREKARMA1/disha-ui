"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from './StudentSidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { DashboardStats } from './DashboardStats'
import { AnalyticsChart } from './AnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { RecentActivities } from './RecentActivities'
import { StudentQuickActions } from './StudentQuickActions'
import { StudentResumeStrength } from './StudentResumeStrength'
import { StudentLockScreen } from './StudentLockScreen'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'
import { usePathname } from 'next/navigation'

interface StudentDashboardLayoutProps {
    children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
    const [studentName, setStudentName] = useState<string>('Student')
    const [isLocked, setIsLocked] = useState(false)
    const [lockReason, setLockReason] = useState<string>('')
    const [universityName, setUniversityName] = useState<string>('')
    const [universityEmail, setUniversityEmail] = useState<string>('')
    const { user } = useAuth()
    const pathname = usePathname()

    // Check student access and fetch profile
    useEffect(() => {
        const checkAccessAndFetchProfile = async () => {
            if (user?.user_type === 'student' && user?.id) {
                try {
                    const profileData = await apiClient.getStudentProfile()

                    // Debug logging
                    console.log('Profile Data:', profileData)
                    console.log('has_active_license:', profileData?.has_active_license)

                    if (profileData?.name && profileData.name.trim()) {
                        setStudentName(profileData.name)
                    } else if (user?.name) {
                        setStudentName(user.name)
                    }

                    // Check license status from profile response
                    if (profileData?.has_active_license === false) {
                        console.log('Setting locked to TRUE')
                        setIsLocked(true)
                        setLockReason(profileData.license_status_reason || 'Your university license has expired. Please contact your university administrator.')
                        if (profileData.university_name_for_contact) {
                            setUniversityName(profileData.university_name_for_contact)
                        }
                        if (profileData.university_email_for_contact) {
                            setUniversityEmail(profileData.university_email_for_contact)
                        }
                    } else {
                        // Has active license
                        console.log('Setting locked to FALSE')
                        setIsLocked(false)
                    }

                    // Set university name if available
                    if (profileData?.university_id && profileData?.institution) {
                        setUniversityName(profileData.institution)
                    }
                } catch (error: any) {
                    console.error('Failed to fetch student profile:', error)
                    // If profile fetch fails completely, use user name if available
                    if (user?.name) {
                        setStudentName(user.name)
                    }
                }
            }
        }

        checkAccessAndFetchProfile()
    }, [user?.id, user?.user_type])

    // Lock screen should only appear on Job Opportunities page
    const isJobOpportunitiesPage = pathname === '/dashboard/student/jobs'
    const shouldLock = isLocked && isJobOpportunitiesPage

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
            {/* Navbar is now fixed positioned */}
            <Navbar />

            {/* StudentSidebar is now fixed positioned */}
            <StudentSidebar />

            {/* Main Content with proper spacing */}
            <div className="pt-16 lg:pl-64">
                <main className={`p-3 sm:p-5 lg:p-6 pb-safe lg:pb-6 min-h-screen relative ${shouldLock ? 'pointer-events-none' : ''}`}>
                    {children ? (
                        <>
                            <div className={shouldLock ? 'opacity-40' : ''}>
                                {children}
                            </div>
                            {shouldLock && (
                                <StudentLockScreen
                                    isOpen={shouldLock}
                                    universityName={universityName}
                                    universityEmail={universityEmail}
                                    reason={lockReason}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <div className={`space-y-4 sm:space-y-5 ${shouldLock ? 'opacity-40' : ''}`}>
                                <WelcomeMessage studentName={studentName} />
                                <DashboardStats />
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
                                    <div className="xl:col-span-8 space-y-4 sm:space-y-5">
                                        <AnalyticsChart />
                                        <StudentQuickActions />
                                        <RecentActivities />
                                    </div>
                                    <div className="xl:col-span-4 space-y-4 sm:space-y-5">
                                        <StudentResumeStrength />
                                        <AdvertisementBanner />
                                    </div>
                                </div>
                            </div>
                            {shouldLock && (
                                <StudentLockScreen
                                    isOpen={shouldLock}
                                    universityName={universityName}
                                    universityEmail={universityEmail}
                                    reason={lockReason}
                                />
                            )}
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
