/**
 * useLookup Hook
 * Professional React hook for fetching lookup data with loading states and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { lookupService, LookupItem } from '@/services/lookupService'

export interface UseLookupOptions {
  skip?: number
  limit?: number
  enabled?: boolean
  refetchOnMount?: boolean
}

export interface UseLookupReturn {
  data: LookupItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearCache: () => void
}

/**
 * Generic hook for fetching lookup data
 */
export function useLookup(
  fetchFunction: () => Promise<LookupItem[]>,
  options: UseLookupOptions = {}
): UseLookupReturn {
  const { enabled = true, refetchOnMount = true } = options
  const [data, setData] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFnRef = useRef(fetchFunction)
  fetchFnRef.current = fetchFunction

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFnRef.current()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      console.error('useLookup error:', err)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const clearCache = useCallback(() => {
    lookupService.clearCache()
  }, [])

  useEffect(() => {
    if (refetchOnMount && enabled) {
      void fetchData()
    }
  }, [enabled, refetchOnMount, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
  }
}

/**
 * Hook for fetching branches
 */
export function useBranches(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getBranches({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching degrees
 */
export function useDegrees(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getDegrees({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching skills
 */
export function useSkills(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getSkills({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching soft skills
 */
export function useSoftSkills(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getSoftSkills({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching industries
 */
export function useIndustries(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getIndustries({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

export function useInstituteTypes(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getInstituteTypes({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching colleges
 */
export function useColleges(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getColleges({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching universities (using existing university management endpoint)
 */
export function useUniversities(options: UseLookupOptions = {}) {
  const { enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(() => lookupService.getUniversities(), [])
  return useLookup(fetchFn, { enabled, refetchOnMount })
}

/**
 * Hook for fetching job categories
 */
export function useJobCategories(options: UseLookupOptions = {}) {
  const { skip = 0, limit = 100, enabled = true, refetchOnMount = true } = options
  const fetchFn = useCallback(
    () => lookupService.getJobCategories({ skip, limit }),
    [skip, limit]
  )
  return useLookup(fetchFn, { enabled, refetchOnMount })
}
