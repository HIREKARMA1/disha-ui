'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { BlogForm } from '@/components/admin/BlogForm'

export default function CreateBlogPage() {
  return (
    <AdminDashboardLayout>
      <BlogForm />
    </AdminDashboardLayout>
  )
}
