'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { buildAuthPath } from '@/lib/authLinks'

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace(buildAuthPath('/auth/login', { type: 'executive' }))
      return
    }
    if (user.user_type !== 'executive' || user.role !== 'executive') {
      router.replace(user.user_type === 'admin' ? '/dashboard/admin' : '/dashboard')
    }
  }, [isLoading, user, router])

  if (isLoading || !user || user.user_type !== 'executive' || user.role !== 'executive') {
    return <div className="flex min-h-screen items-center justify-center">Loading Executive workspace…</div>
  }
  return <>{children}</>
}
