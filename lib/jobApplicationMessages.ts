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
import { showPremiumRequiredToast } from '@/lib/showPremiumRequiredToast'
import {
  PREMIUM_REQUIRED_MESSAGE,
  PREMIUM_REQUIRED_ASSISTANCE,
  CONTACT_SUPPORT_PATH,
  CONTACT_SUPPORT_LABEL,
  isPremiumRequiredError,
} from '@/lib/premiumAccess'

export {
  PREMIUM_REQUIRED_MESSAGE,
  PREMIUM_REQUIRED_ASSISTANCE,
  CONTACT_SUPPORT_PATH,
  CONTACT_SUPPORT_LABEL,
  isPremiumRequiredError,
}

export const APPLY_SUCCESS_MESSAGE = 'Application submitted successfully.'
export const ALREADY_APPLIED_MESSAGE = 'You have already applied for this job.'
export const JOB_CLOSED_MESSAGE = 'This job is no longer accepting applications.'

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

/** Detect PREMIUM_REQUIRED from API payload or message text. */
export function isPremiumRequiredApiError(error: unknown): boolean {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
  if (data) {
    if (data.error_code === 'PREMIUM_REQUIRED') return true
    const errField = data.error
    if (errField && typeof errField === 'object' && !Array.isArray(errField)) {
      if ((errField as { error_code?: string }).error_code === 'PREMIUM_REQUIRED') return true
    }
  }
  return isPremiumRequiredError(getApplyErrorMessage(error))
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
    if (typeof data.error_code === 'string' && data.error_code === 'PREMIUM_REQUIRED') {
      return PREMIUM_REQUIRED_MESSAGE
    }
    const errField = data.error
    if (errField && typeof errField === 'object' && !Array.isArray(errField)) {
      const nested = errField as { message?: string; error_code?: string }
      if (nested.error_code === 'PREMIUM_REQUIRED') return PREMIUM_REQUIRED_MESSAGE
      if (typeof nested.message === 'string') return normalizeApplyErrorMessage(nested.message)
    }
    if (typeof data.message === 'string' && data.message.trim()) {
      return normalizeApplyErrorMessage(data.message)
    }
  }
  return normalizeApplyErrorMessage(extractErrorDetail(error))
}

export function toastApplyError(error: unknown): void {
  if (isPremiumRequiredApiError(error)) {
    showPremiumRequiredToast()
    return
  }
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
  | 'premium'

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
    if (isPremiumRequiredApiError(error)) {
      showPremiumRequiredToast()
      return 'premium'
    }
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
