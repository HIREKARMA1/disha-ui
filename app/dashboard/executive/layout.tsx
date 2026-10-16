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
    } else if (user.user_type !== 'executive' || user.role !== 'executive') {
      router.replace(`/dashboard/${user.user_type}`)
    }
  }, [isLoading, user, router])

  if (isLoading || user?.user_type !== 'executive' || user.role !== 'executive') {
    return <div className="flex min-h-screen items-center justify-center">Loading Executive dashboard…</div>
  }

  return <>{children}</>
}
