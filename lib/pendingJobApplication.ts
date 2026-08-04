/**
 * Persist intended job application across login redirects.
 * Cleared after a successful attempt (or when consumed as expired).
 */

const STORAGE_KEY = 'pending_job_application'
const MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

export interface PendingJobApplication {
  jobId: string
  returnUrl: string
  action: 'apply'
  createdAt: number
}

export function storePendingJobApplication(jobId: string, returnUrl: string): void {
  if (typeof window === 'undefined') return
  const payload: PendingJobApplication = {
    jobId,
    returnUrl,
    action: 'apply',
    createdAt: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function peekPendingJobApplication(): PendingJobApplication | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingJobApplication
    if (!parsed?.jobId || parsed.action !== 'apply') {
      clearPendingJobApplication()
      return null
    }
    if (Date.now() - (parsed.createdAt || 0) > MAX_AGE_MS) {
      clearPendingJobApplication()
      return null
    }
    return parsed
  } catch {
    clearPendingJobApplication()
    return null
  }
}

export function clearPendingJobApplication(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** Build job details return URL that triggers auto-apply after login. */
export function buildJobApplyRedirect(returnPath: string): string {
  const [path, existingQuery = ''] = returnPath.split('?')
  const params = new URLSearchParams(existingQuery)
  params.set('auto_apply', '1')
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

/** Guest apply: persist intent and navigate to student login. */
export function redirectGuestToLoginForApply(
  router: { push: (url: string) => void },
  jobId: string,
  returnPath: string
): void {
  const redirectUrl = buildJobApplyRedirect(returnPath)
  storePendingJobApplication(jobId, redirectUrl)
  try {
    localStorage.setItem('redirect_after_login', redirectUrl)
  } catch {
    // ignore
  }
  router.push(
    `/auth/login?redirect=${encodeURIComponent(redirectUrl)}&type=student`
  )
}
