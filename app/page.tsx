"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    // Redirect logic for homepage to prevent flash of content
    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && user) {
                // If logged in, redirect to appropriate dashboard
                router.replace(`/dashboard/${user.user_type}`)
            } else {
                // If not logged in, redirect to login page
                router.replace('/auth/login')
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    // Show loading screen while checking auth status and redirecting
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="transparent" />
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isLoading ? "Loading..." : "Redirecting..."}
                    </p>
                </div>
            </div>
        </div>
    )
}