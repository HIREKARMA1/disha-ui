"use client"

import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { MockTestDashboard } from '@/components/mock-test/MockTestDashboard'

export default function StudentMockTestsPage() {
  return (
    <StudentDashboardLayout>
      <MockTestDashboard />
    </StudentDashboardLayout>
  )
}
