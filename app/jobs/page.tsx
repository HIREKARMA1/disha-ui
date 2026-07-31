"use client"

import { Suspense, useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AllJobs } from '@/components/jobs/AllJobs'
import { Footer } from '@/components/ui/footer'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { useAuth } from '@/hooks/useAuth'

function JobsPageContent() {
    const { user, isLoading } = useAuth()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!isLoading) setReady(true)
    }, [isLoading])

    if (!ready) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0a0c14] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
        )
    }

    if (user?.user_type === 'student') {
        return (
            <StudentDashboardLayout>
                <div className="pb-16 lg:pb-0">
                    <AllJobs />
                </div>
            </StudentDashboardLayout>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
            <Navbar variant="transparent" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 max-w-[1600px] pb-24 flex-grow overflow-x-hidden">
                <AllJobs />
            </div>
            <Footer />
        </div>
    )
}

export default function PublicJobsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0a0c14] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                </div>
            }
        >
            <JobsPageContent />
        </Suspense>
    )
}
