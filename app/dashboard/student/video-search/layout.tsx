"use client"

import { Navbar } from '@/components/ui/navbar'
import { StudentSidebar } from '@/components/dashboard/StudentSidebar'

export default function VideoSearchLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="flex">
                <StudentSidebar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
