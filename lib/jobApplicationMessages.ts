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
export const JOB_NOT_FOR_UNIVERSITY_MESSAGE =
  'Your university is not assigned for this job.'
export const CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE =
  'This campus drive no longer belongs to your university.'
export const CAMPUS_DRIVE_REQUEST_PENDING_MESSAGE = 'Request Pending'
export const CAMPUS_DRIVE_REQUEST_REJECTED_MESSAGE =
  'Your request to apply for this campus drive was rejected.'
export const CAMPUS_DRIVE_REQUEST_SENT_MESSAGE =
  'Your request has been sent to the admin. This job will be automatically applied if your request is approved.'
export const PREMIUM_JOB_INTEREST_TITLE = 'Premium Job Opportunity'
export const PREMIUM_JOB_INTEREST_MESSAGE =
  'This job is exclusively available to Premium Users. If you would still like to apply, you can submit a request to the admin for consideration.'
export const PREMIUM_JOB_REQUEST_REJECTED_MESSAGE =
  'Your request to apply for this premium job was rejected.'
export const JOB_NOT_AVAILABLE_MESSAGE = 'This job is not available for applications.'
export const PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE =
  'Not eligible — graduation batch does not meet the job requirements'

/**
 * Client-side apply eligibility for university assignment / premium public jobs.
 * Jobs stay visible publicly; once universities are assigned, only those may apply.
 * Public-for-all with no assignments remains open to any student.
 * Premium public (public_access_level=premium) requires an accepted Job Request.
 * Accepted Campus Drive / Premium Job Requests unlock apply for that specific job only.
 */
export function getUniversityApplyEligibility(options: {
  isPublic?: boolean | null
  publicAccessLevel?: string | null
  assignedUniversityIds?: string[] | null
  isAuthenticatedStudent: boolean
  studentUniversityId?: string | null
  isCampusDrive?: boolean | null
  hasAcceptedCampusDriveRequest?: boolean | null
}): { canApply: boolean; reason: string | null } {
  const assignments = options.assignedUniversityIds ?? []
  const isPublicForAll = Boolean(
    options.isPublic && options.publicAccessLevel === 'all'
  )
  const isPremiumPublic = Boolean(
    options.isPublic && options.publicAccessLevel === 'premium'
  )

  if (assignments.length === 0) {
    if (isPublicForAll) {
      return { canApply: true, reason: null }
    }
    if (isPremiumPublic) {
      if (options.hasAcceptedCampusDriveRequest) {
        return { canApply: true, reason: null }
      }
      return { canApply: false, reason: PREMIUM_JOB_INTEREST_MESSAGE }
    }
    return { canApply: false, reason: JOB_NOT_AVAILABLE_MESSAGE }
  }

  // Guests can click Apply and be redirected to login; backend still enforces.
  if (!options.isAuthenticatedStudent) {
    return { canApply: true, reason: null }
  }

  if (
    !options.studentUniversityId ||
    !assignments.includes(options.studentUniversityId)
  ) {
    if (options.hasAcceptedCampusDriveRequest) {
      return { canApply: true, reason: null }
    }
    return {
      canApply: false,
      reason: options.isCampusDrive
        ? CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE
        : JOB_NOT_FOR_UNIVERSITY_MESSAGE,
    }
  }

  return { canApply: true, reason: null }
}

export function isCampusDriveNotForUniversityMessage(
  message: string | null | undefined
): boolean {
  if (!message) return false
  return message.toLowerCase().includes('campus drive no longer belongs')
}

export function isPremiumJobInterestMessage(
  message: string | null | undefined
): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('premium users only') ||
    lower.includes('exclusively available to premium') ||
    lower.includes('available exclusively to premium') ||
    lower.includes("i'm still interested") ||
    lower.includes('im still interested')
  )
}

/** True when Apply should open the Job Request interest modal instead of applying. */
export function isJobInterestGateMessage(
  message: string | null | undefined
): boolean {
  return (
    isCampusDriveNotForUniversityMessage(message) ||
    isPremiumJobInterestMessage(message)
  )
}

export function isPremiumPublicJob(options: {
  isPublic?: boolean | null
  publicAccessLevel?: string | null
}): boolean {
  return Boolean(options.isPublic && options.publicAccessLevel === 'premium')
}

/**
 * Client-side passout batch targeting check.
 * Jobs remain visible to all students; apply is limited to selected batches.
 * Empty / missing targeting or "Any" means no batch restriction.
 */
export function getPassoutBatchApplyEligibility(options: {
  passoutBatches?: string | string[] | null
  isAuthenticatedStudent: boolean
  studentGraduationYear?: number | string | null
  studentBatch?: string | null
}): { canApply: boolean; reason: string | null } {
  const raw = options.passoutBatches
  let targeted: string[] = []
  if (Array.isArray(raw)) {
    targeted = raw.map((b) => String(b).trim()).filter(Boolean)
  } else if (typeof raw === 'string' && raw.trim()) {
    targeted = raw.split(',').map((b) => b.trim()).filter(Boolean)
  }

  if (
    targeted.length === 0 ||
    targeted.some((b) => {
      const lower = b.toLowerCase()
      return lower === 'any' || lower === 'all'
    })
  ) {
    return { canApply: true, reason: null }
  }

  // Guests can click Apply and be redirected to login; backend still enforces.
  if (!options.isAuthenticatedStudent) {
    return { canApply: true, reason: null }
  }

  const studentTokens = new Set<string>()
  if (
    options.studentGraduationYear !== null &&
    options.studentGraduationYear !== undefined &&
    String(options.studentGraduationYear).trim()
  ) {
    studentTokens.add(String(options.studentGraduationYear).trim())
  }
  if (options.studentBatch && String(options.studentBatch).trim()) {
    studentTokens.add(String(options.studentBatch).trim())
  }

  if (Array.from(studentTokens).some((token) => targeted.includes(token))) {
    return { canApply: true, reason: null }
  }

  return { canApply: false, reason: PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE }
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
  // Map legacy copy to the current university-assignment message
  if (
    raw === 'This job is not available for your university' ||
    raw.toLowerCase().includes('not available for your university')
  ) {
    return JOB_NOT_FOR_UNIVERSITY_MESSAGE
  }
  if (raw.toLowerCase().includes('campus drive no longer belongs')) {
    return CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE
  }
  if (isPremiumJobInterestMessage(raw)) {
    return PREMIUM_JOB_INTEREST_MESSAGE
  }
  if (
    raw.toLowerCase().includes('targeted batch') ||
    raw.toLowerCase().includes('passout batch') ||
    raw.toLowerCase().includes('graduation batch')
  ) {
    return PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE
  }
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
