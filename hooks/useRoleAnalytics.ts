'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { analyticsService } from '@/services/analyticsService'
import type { UserRole } from '@/types/analytics'

export function useRoleAnalytics<T>(role: UserRole) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = (await analyticsService.getAnalyticsForRole(role)) as T
      setData(result)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to load analytics. Please try again.'
      if (message.includes('not authenticated') || message.includes('Authentication')) {
        router.push('/auth/login')
        return
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [role, router])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, loading, error, refetch: fetchAnalytics }
}
