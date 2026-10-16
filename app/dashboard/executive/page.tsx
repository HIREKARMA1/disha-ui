'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

const modules = [
  ['Corporate', '/dashboard/admin/corporates', 'corporate'],
  ['Partner Logo', '/dashboard/admin/partner-logos', 'partner_logo'],
  ['Jobs', '/dashboard/admin/jobs', 'jobs'],
  ['University Approval', '/dashboard/admin/university-approval', 'university_approval'],
  ['Job Request', '/dashboard/admin/campus-drive-requests', 'job_request'],
  ['Event', '/dashboard/admin/events', 'event'],
  ['Campus Drive', '/dashboard/admin/campus-drives', 'campus_drive'],
  ['Blogs', '/dashboard/admin/blogs', 'blogs'],
  ['Bulk Mail', '/dashboard/admin/bulk-email', 'bulk_mail'],
  ['Bulk WhatsApp', '/dashboard/admin/bulk-whatsapp', 'bulk_whatsapp'],
  ['Support', '/dashboard/admin/support', 'support'],
] as const

export default function ExecutiveDashboardPage() {
  const { user } = useAuth()
  const allowed = user?.permissions?.modules || []
  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">Executive workspace</p>
          <h1 className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">Welcome, {user?.name || 'Executive'}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Open an assigned module to continue your work.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.filter(([, , permission]) => allowed.includes(permission)).map(([label, href]) => (
            <Link key={href} href={href} className="rounded-xl border border-gray-200 bg-white p-5 font-medium text-gray-900 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {label}<span className="ml-2 text-blue-600" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
