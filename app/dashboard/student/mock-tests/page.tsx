"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { MockTestsCatalog } from '@/components/mock-tests/MockTestsCatalog'
import { useAuth } from '@/hooks/useAuth'

export default function StudentMockTestsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.user_type !== 'student')) {
      router.replace('/mock-tests')
    }
  }, [isAuthenticated, isLoading, router, user?.user_type])

  if (isLoading || !isAuthenticated || user?.user_type !== 'student') {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0a0c14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <StudentDashboardLayout>
      <MockTestsCatalog />
    </StudentDashboardLayout>
  )
}
