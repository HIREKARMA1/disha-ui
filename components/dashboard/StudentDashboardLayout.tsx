"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from './StudentSidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { DashboardStats } from './DashboardStats'
import { AnalyticsChart } from './AnalyticsChart'
import { AdvertisementBanner } from './AdvertisementBanner'
import { RecentActivities } from './RecentActivities'
import { useAuth } from '@/hooks/useAuth'
import { useStudentFeatures } from '@/hooks/useStudentFeatures'
import { apiClient } from '@/lib/api'
import { LoadingOverlay } from './LoadingOverlay'


interface StudentDashboardLayoutProps {
    children?: React.ReactNode
}

function StudentDashboardContent({ children }: StudentDashboardLayoutProps) {
    const [studentName, setStudentName] = useState<string>('Student')
    const { user } = useAuth()
    const { features, loading: featuresLoading, error: featuresError } = useStudentFeatures()
    

    // Fetch student profile data to get the name
    useEffect(() => {
        const fetchStudentName = async () => {
            if (user?.user_type === 'student') {
                try {
                    const profileData = await apiClient.getStudentProfile()
                    if (profileData?.name && profileData.name.trim()) {
                        setStudentName(profileData.name)
                    } else if (user?.name) {
                        setStudentName(user.name)
                    }
                } catch (error) {
                    console.error('Failed to fetch student profile:', error)
                    // Fallback to user name from auth
                    if (user?.name) {
                        setStudentName(user.name)
                    }
                }
            }
        }

        fetchStudentName()
    }, [user?.id])


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar is now fixed positioned */}
            <Navbar />

            {/* StudentSidebar is now fixed positioned */}
            <StudentSidebar />

            {/* Main Content with proper spacing */}
            <div className="pt-16 lg:pl-64">
                <main className="p-6 pb-safe lg:pb-6 min-h-screen">
                    {children ? (
                        children
                    ) : (
                        <div className="space-y-6">
                            <WelcomeMessage studentName={studentName} />
                            <DashboardStats />
                            <div className="xl:grid-cols-10 grid grid-cols-1 gap-6">
                                <div className="xl:col-span-7 space-y-6">
                                    <AnalyticsChart />
                                    <RecentActivities />
                                </div>
                                <div className="xl:col-span-3 space-y-6">
                                    <AdvertisementBanner />
                                </div>
                            </div>
                        </div>
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
