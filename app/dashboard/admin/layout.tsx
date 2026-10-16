"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { buildAuthPath } from '@/lib/authLinks'
import { executiveHasModule, executiveModuleForPath, executivePathForAdminPath } from '@/lib/executiveModules'

function normalizeAdminRole(role?: string) {
  const normalized = (role || 'admin').trim().toLowerCase().replace(/[\s-]+/g, '_')
  return normalized === 'superadmin' ? 'super_admin' : normalized
}

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

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
    if (user.user_type === 'executive') {
      if (user.role !== 'executive' || pathname === '/dashboard/admin') {
        router.replace('/dashboard/executive')
        return
      }
      const module = executiveModuleForPath(pathname)
      if (!module || !executiveHasModule(user, module)) {
        router.replace('/dashboard/executive')
      } else if (pathname?.startsWith('/dashboard/admin/')) {
        router.replace(executivePathForAdminPath(pathname))
      }
      return
    }
    if (user.user_type === 'admin' && pathname?.startsWith('/dashboard/executive/')) {
      router.replace(pathname.replace(/^\/dashboard\/executive(?=\/|$)/, '/dashboard/admin'))
      return
    }
    if (user.user_type !== 'admin' || !['admin', 'super_admin'].includes(normalizeAdminRole(user.role))) {
      router.replace(
        buildAuthPath('/auth/login', {
          type: 'admin',
          redirect: '/dashboard/admin/events/requests',
        })
      )
    }
  }, [isLoading, user, router, pathname])

  const allowedExecutivePath = user?.user_type === 'executive' &&
    user.role === 'executive' &&
    pathname !== '/dashboard/admin' &&
    Boolean(executiveModuleForPath(pathname)) &&
    executiveHasModule(user, executiveModuleForPath(pathname) || '')

  if (isLoading || !user || (user.user_type !== 'admin' && !allowedExecutivePath)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md px-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user?.user_type === 'executive' ? 'Opening Executive module…' : 'Admin login required. Redirecting…'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
