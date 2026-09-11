'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'

/** Practice exams are paused — send deep links to the Coming Soon page. */
export default function PracticeModulePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/student/practice')
  }, [router])

  return (
    <StudentDashboardLayout>
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Redirecting…
      </div>
    </StudentDashboardLayout>
  )
}
