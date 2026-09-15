"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import OpportunityHub from '@/components/home/OpportunityHub'

/** Roles that should land on their dashboard instead of the opportunity hub. */
const DASHBOARD_ROLES = new Set(['university', 'corporate', 'admin'])

export default function HomePageClient() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const shouldGoToDashboard =
    !isLoading &&
    isAuthenticated &&
    user &&
    DASHBOARD_ROLES.has(user.user_type)

  useEffect(() => {
    if (shouldGoToDashboard) {
      router.replace(`/dashboard/${user!.user_type}`)
    }
  }, [shouldGoToDashboard, user, router])

  if (shouldGoToDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return <OpportunityHub />
}
