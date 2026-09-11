'use client'

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { PracticeComingSoon } from '@/components/practice/PracticeComingSoon'

export default function StudentPracticePage() {
  return (
    <StudentDashboardLayout>
      <PracticeComingSoon />
    </StudentDashboardLayout>
  )
}
