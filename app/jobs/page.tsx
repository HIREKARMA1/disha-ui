"use client"

import { Navbar } from '@/components/ui/navbar'
import { AllJobs } from '@/components/jobs/AllJobs'
import { Footer } from '@/components/ui/footer'

export default function PublicJobsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Navbar variant="transparent" />
            <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 pt-16 md:pt-24 max-w-[1600px] pb-12 md:pb-24 flex-grow">
                <AllJobs />
            </div>
            <Footer />
        </div>
    )
}
