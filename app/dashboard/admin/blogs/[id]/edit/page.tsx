'use client'

import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { BlogForm } from '@/components/admin/BlogForm'

export default function EditBlogPage({ params }: { params: { id: string } }) {
  return (
    <AdminDashboardLayout>
      <BlogForm blogId={params.id} />
    </AdminDashboardLayout>
  )
}
