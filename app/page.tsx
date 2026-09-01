"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import DishaHomepage from '@/components/home/DishaHomepage'

export default function HomePage() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            router.replace(`/dashboard/${user.user_type}`)
        }
    }, [isLoading, isAuthenticated, user, router])

    // Only show a redirect state once auth is confirmed — never block the landing page on auth check
    if (!isLoading && isAuthenticated && user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return <DishaHomepage />
}
