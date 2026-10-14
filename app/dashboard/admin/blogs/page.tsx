'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { BlogList } from '@/components/admin/BlogList'

export default function AdminBlogsPage() {
  return (
    <AdminDashboardLayout>
      <BlogList />
    </AdminDashboardLayout>
  )
}
