"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { buildAuthPath } from '@/lib/authLinks'
import { usePathname } from 'next/navigation'

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const executivePrefixes: Record<string, string> = {
    '/dashboard/admin/corporates': 'corporate', '/dashboard/admin/partner-logos': 'partner_logo',
    '/dashboard/admin/jobs': 'jobs', '/dashboard/admin/university-approval': 'university_approval',
    '/dashboard/admin/campus-drive-requests': 'job_request', '/dashboard/admin/events': 'event',
    '/dashboard/admin/campus-drives': 'campus_drive', '/dashboard/admin/blogs': 'blogs',
    '/dashboard/admin/bulk-email': 'bulk_mail', '/dashboard/admin/bulk-whatsapp': 'bulk_whatsapp',
    '/dashboard/admin/support': 'support',
  }
  const executiveModule = Object.entries(executivePrefixes).find(([prefix]) => pathname.startsWith(prefix))?.[1]
  const allowed = user?.role !== 'executive' || (!executiveModule ? pathname === '/dashboard/admin' :
    (user.permissions?.modules || []).includes(executiveModule))

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace(
        buildAuthPath('/auth/login', {
          type: 'admin',
          redirect: '/dashboard/admin/events/requests',
        })
      )
      return
    }
    if ((user.user_type !== 'admin' && user.user_type !== 'executive') ||
        (user.user_type === 'executive' && user.role !== 'executive')) {
      router.replace(
        buildAuthPath('/auth/login', {
          type: 'admin',
          redirect: '/dashboard/admin/events/requests',
        })
      )
      return
    }
    if (user.role === 'executive' && !allowed) {
      router.replace('/dashboard/executive')
      return
    }
    if (user.role === 'executive' && pathname === '/dashboard/admin') {
      router.replace('/dashboard/executive')
    }
  }, [isLoading, user, router, allowed, pathname])

  if (isLoading || !user || (user.user_type !== 'admin' && user.user_type !== 'executive') ||
      (user.user_type === 'executive' && user.role !== 'executive') ||
      (user.role === 'executive' && !allowed)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Admin login required. Redirecting…
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
