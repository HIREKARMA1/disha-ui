"use client"

import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/navbar'
import { AllJobs } from '@/components/jobs/AllJobs'
import { Footer } from '@/components/ui/footer'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'

export default function JobsPage() {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // Authenticated student: show jobs inside dashboard layout (same structure as Campus Drive - no extra container/max-width)
    if (isAuthenticated && user?.user_type === 'student') {
        return (
            <StudentDashboardLayout>
                <AllJobs />
            </StudentDashboardLayout>
        )
    }

    // Unauthenticated or other user types: show public layout (Navbar + Jobs + Footer)
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar variant="transparent" />
            <div className="w-full min-w-0 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 max-w-[1600px] pb-20 sm:pb-24 flex-grow">
                <AllJobs />
            </div>
            <Footer />
        </div>
    )
}
