"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/auth/login?type=admin&redirect=/dashboard/admin/events/requests')
      return
    }
    if (user.user_type !== 'admin') {
      router.replace('/auth/login?type=admin&redirect=/dashboard/admin/events/requests')
    }
  }, [isLoading, user, router])

  if (isLoading || !user || user.user_type !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Admin login required. Redirecting…
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
