"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AdminEventSidebar } from './AdminEventSidebar'
import { LoadingOverlay } from '@/components/dashboard/LoadingOverlay'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface AdminEventLayoutProps {
    children: React.ReactNode
}

export function AdminEventLayout({ children }: AdminEventLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { user, isLoading } = useAuth()
    const router = useRouter()

    // Redirect if not admin
    useEffect(() => {
        if (!isLoading && user?.user_type !== 'admin') {
            router.push('/dashboard')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <LoadingOverlay />
    }

    if (user?.user_type !== 'admin') {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar */}
            <Navbar />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <AdminEventSidebar />
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="pt-16 min-h-screen">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile menu button */}
            <button
                className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>
        </div>
    )
}
