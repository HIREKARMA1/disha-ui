'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { UniversityApprovalList } from '@/components/admin/UniversityApprovalList'

export default function UniversityApprovalPage() {
  return (
    <AdminDashboardLayout>
      <UniversityApprovalList />
    </AdminDashboardLayout>
  )
}
