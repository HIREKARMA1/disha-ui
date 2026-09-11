'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { HackathonComingSoon } from '@/components/hackathons/HackathonComingSoon'
import { useAuth } from '@/hooks/useAuth'

export default function HackathonsPage() {
  const { user, isLoading } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoading) setReady(true)
  }, [isLoading])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] dark:bg-[#0a0c14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (user?.user_type === 'student') {
    return (
      <StudentDashboardLayout>
        <HackathonComingSoon />
      </StudentDashboardLayout>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
      <Navbar variant="transparent" />
      <div className="flex-1 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <HackathonComingSoon />
      </div>
      <Footer />
    </div>
  )
}
