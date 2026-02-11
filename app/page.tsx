"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/hooks/useAuth'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'

export default function HomePage() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
             // If logged in, redirect to appropriate dashboard
             router.replace(`/dashboard/${user.user_type}`)
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Navbar variant="transparent" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            </div>
        )
    }

    // If authenticated, we are redirecting, so return null or a loader to avoid flash
    if (isAuthenticated) {
         return null 
    }

    return (
        <main className="min-h-screen bg-white text-gray-900 dark:bg-[#2A2C38] dark:text-white">
            <Navbar variant="transparent" />
            <HeroSection />
            <FeaturesSection />
        </main>
    )
}
