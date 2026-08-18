'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getSavedJobIds,
  isJobSaved,
  toggleSavedJob,
  SAVED_JOBS_EVENT,
} from '@/lib/savedJobs'

export function useSavedJobs(jobId?: string) {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false)

  const refresh = useCallback(() => {
    const ids = getSavedJobIds()
    setSavedIds(ids)
    if (jobId) setIsSaved(ids.includes(jobId))
  }, [jobId])

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener(SAVED_JOBS_EVENT, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(SAVED_JOBS_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [refresh])

  const toggle = useCallback(
    (id: string = jobId || '') => {
      if (!id) return false
      const saved = toggleSavedJob(id)
      if (jobId) setIsSaved(id === jobId ? saved : isJobSaved(jobId))
      setSavedIds(getSavedJobIds())
      return saved
    },
    [jobId]
  )

  return { savedIds, isSaved, toggle, refresh }
}
