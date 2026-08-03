import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'
import {
  clearPendingJobApplication,
  peekPendingJobApplication,
} from '@/lib/pendingJobApplication'
import {
  extractErrorDetail,
  isProfileCompletionError,
} from '@/lib/profileCompletion'
import { showProfileCompletionToast } from '@/lib/showProfileCompletionToast'

export const APPLY_SUCCESS_MESSAGE = 'Application submitted successfully.'
export const ALREADY_APPLIED_MESSAGE = 'You have already applied for this job.'
export const JOB_CLOSED_MESSAGE = 'This job is no longer accepting applications.'
export const PREMIUM_REQUIRED_MESSAGE =
  "You can't apply for this job as you are not a Premium user."

const LEGACY_PREMIUM_SNIPPETS = [
  'applications are enabled only for premium users',
  'your access isn\'t',
  'not available for your college',
  'university is not enrolled under the premium',
  'university_not_mou',
]

export function isPremiumRequiredError(message: string | null | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  if (lower.includes('premium') && (lower.includes('apply') || lower.includes('access') || lower.includes('user'))) {
    return true
  }
  return LEGACY_PREMIUM_SNIPPETS.some((s) => lower.includes(s))
}

export function isAlreadyAppliedError(message: string | null | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return lower.includes('already applied')
}

export function isJobClosedError(message: string | null | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('no longer accepting') ||
    lower.includes('applications are closed') ||
    lower.includes('not currently open') ||
    lower.includes('applications are not currently open')
  )
}

/** Normalize backend apply errors into user-facing copy. */
export function normalizeApplyErrorMessage(raw: string | null | undefined): string {
  if (!raw) return 'Failed to submit application'
  if (isAlreadyAppliedError(raw)) return ALREADY_APPLIED_MESSAGE
  if (isJobClosedError(raw)) return JOB_CLOSED_MESSAGE
  if (isPremiumRequiredError(raw)) return PREMIUM_REQUIRED_MESSAGE
  return raw
}

export function getApplyErrorMessage(error: unknown): string {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
  if (data) {
    if (typeof data.message === 'string' && data.message.trim()) {
      return normalizeApplyErrorMessage(data.message)
    }
    if (typeof data.error_code === 'string' && data.error_code === 'PREMIUM_REQUIRED') {
      return PREMIUM_REQUIRED_MESSAGE
    }
    const errField = data.error
    if (errField && typeof errField === 'object' && !Array.isArray(errField)) {
      const nested = errField as { message?: string; error_code?: string }
      if (nested.error_code === 'PREMIUM_REQUIRED') return PREMIUM_REQUIRED_MESSAGE
      if (typeof nested.message === 'string') return normalizeApplyErrorMessage(nested.message)
    }
  }
  return normalizeApplyErrorMessage(extractErrorDetail(error))
}

export function toastApplyError(error: unknown): void {
  const message = getApplyErrorMessage(error)
  if (isProfileCompletionError(message) || isProfileCompletionError(extractErrorDetail(error))) {
    showProfileCompletionToast()
    return
  }
  toast.error(message)
}

export function defaultApplyPayload(jobId: string) {
  return {
    job_id: jobId,
    cover_letter:
      'I am interested in this position and believe my skills and experience make me a great fit.',
    expected_salary: null as number | null,
    availability_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  }
}

export type AutoApplyResult =
  | 'success'
  | 'already_applied'
  | 'error'
  | 'skipped'
  | 'profile'

/**
 * After login: if a pending job application matches, call Apply API once.
 */
export async function resumePendingJobApplication(expectedJobId?: string): Promise<AutoApplyResult> {
  const pending = peekPendingJobApplication()
  if (!pending) return 'skipped'
  if (expectedJobId && pending.jobId !== expectedJobId) return 'skipped'

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  if (!token) return 'skipped'

  try {
    await apiClient.applyForJob(pending.jobId, defaultApplyPayload(pending.jobId))
    clearPendingJobApplication()
    toast.success(APPLY_SUCCESS_MESSAGE)
    return 'success'
  } catch (error: unknown) {
    clearPendingJobApplication()
    const message = getApplyErrorMessage(error)
    if (isProfileCompletionError(message) || isProfileCompletionError(extractErrorDetail(error))) {
      showProfileCompletionToast()
      return 'profile'
    }
    if (isAlreadyAppliedError(message)) {
      toast.error(ALREADY_APPLIED_MESSAGE)
      return 'already_applied'
    }
    toast.error(message)
    return 'error'
  }
}

/** Strip auto_apply query params after consuming. */
export function clearAutoApplyQueryParams(): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has('auto_apply')) return
  url.searchParams.delete('auto_apply')
  const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '') + url.hash
  window.history.replaceState({}, '', next)
}

export function shouldAutoApplyForJob(jobId: string): boolean {
  const pending = peekPendingJobApplication()
  return !!pending && pending.jobId === jobId && pending.action === 'apply'
}
