"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { AllJobs } from '@/components/jobs/AllJobs'
import { Footer } from '@/components/ui/footer'
import { useAuth } from '@/hooks/useAuth'

export default function PublicJobsPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()

    // Authenticated students: show live jobs inside dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated && user?.user_type === 'student') {
            router.replace('/dashboard/student/jobs')
        }
    }, [isAuthenticated, isLoading, user?.user_type, router])

    if (isLoading || (isAuthenticated && user?.user_type === 'student')) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar variant="transparent" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 max-w-[1600px] pb-24 flex-grow">
                <AllJobs />
            </div>
            <Footer />
        </div>
    )
}
