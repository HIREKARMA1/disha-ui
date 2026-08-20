const GUEST_KEY = 'saved_jobs:guest'
export const SAVED_JOBS_EVENT = 'disha:saved-jobs-changed'

function getStorageKey(): string {
  if (typeof window === 'undefined') return GUEST_KEY
  try {
    const raw = localStorage.getItem('user_data')
    if (!raw) return GUEST_KEY
    const parsed = JSON.parse(raw) as { id?: string }
    if (parsed?.id && parsed.id !== 'temp-id') {
      return `saved_jobs:${parsed.id}`
    }
  } catch {
    // ignore parse errors
  }
  return GUEST_KEY
}

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeIds(key: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent(SAVED_JOBS_EVENT, { detail: { ids } }))
  } catch {
    // ignore quota / private mode
  }
}

export function getSavedJobIds(): string[] {
  return readIds(getStorageKey())
}

export function isJobSaved(jobId: string): boolean {
  if (!jobId) return false
  return getSavedJobIds().includes(jobId)
}

/** Returns true when the job is saved after the toggle. */
export function toggleSavedJob(jobId: string): boolean {
  if (!jobId) return false
  const key = getStorageKey()
  const ids = readIds(key)
  const exists = ids.includes(jobId)
  const next = exists ? ids.filter((id) => id !== jobId) : [...ids, jobId]
  writeIds(key, next)
  return !exists
}
