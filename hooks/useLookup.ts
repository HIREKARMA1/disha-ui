/**
 * useLookup Hook
 * Professional React hook for fetching lookup data with loading states and error handling
 */

import { useState, useEffect } from 'react'
import { lookupService, LookupItem } from '@/services/lookupService'
import { universityService } from '@/services/universityService'

export interface UseLookupOptions {
  skip?: number
  limit?: number
  enabled?: boolean // Allow disabling the hook
  refetchOnMount?: boolean // Allow disabling refetch on mount
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

  const fetchData = async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      console.error('useLookup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchData()
  }

  const clearCache = () => {
    lookupService.clearCache()
  }

  useEffect(() => {
    if (refetchOnMount) {
      fetchData()
    }
  }, [enabled, refetchOnMount])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  }
}

/**
 * Hook for fetching branches
 */
export function useBranches(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getBranches(options), options)
}

/**
 * Hook for fetching degrees
 */
export function useDegrees(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getDegrees(options), options)
}

/**
 * Hook for fetching skills
 */
export function useSkills(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getSkills(options), options)
}

/**
 * Hook for fetching soft skills
 */
export function useSoftSkills(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getSoftSkills(options), options)
}

/**
 * Hook for fetching industries
 */
export function useIndustries(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getIndustries(options), options)
}

/**
 * Hook for fetching colleges
 */
export function useColleges(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getColleges(options), options)
}

/**
 * Hook for fetching universities (using existing university management endpoint)
 */
export function useUniversities(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getUniversities(options), options)
}

/**
 * Hook for fetching job categories
 */
export function useJobCategories(options: UseLookupOptions = {}) {
  return useLookup(() => lookupService.getJobCategories(options), options)
}

