import { toast } from 'react-hot-toast'
import { campusDriveRequestService } from '@/services/campusDriveRequestService'
import type { CampusDriveRequestStatus } from '@/types/campusDriveRequest'
import {
  CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
  CAMPUS_DRIVE_REQUEST_PENDING_MESSAGE,
  CAMPUS_DRIVE_REQUEST_REJECTED_MESSAGE,
  CAMPUS_DRIVE_REQUEST_SENT_MESSAGE,
  PREMIUM_JOB_INTEREST_MESSAGE,
  PREMIUM_JOB_INTEREST_TITLE,
  PREMIUM_JOB_REQUEST_REJECTED_MESSAGE,
  getApplyErrorMessage,
  isJobInterestGateMessage,
  isPremiumJobInterestMessage,
  isPremiumPublicJob,
} from '@/lib/jobApplicationMessages'

export type CampusDriveInterestOutcome =
  | 'eligible'
  | 'show_interest_modal'
  | 'pending'
  | 'rejected'
  | 'accepted'
  | 'error'

export type JobInterestModalKind = 'campus_drive' | 'premium'

export function getJobInterestModalCopy(kind: JobInterestModalKind): {
  title?: string
  message: string
  confirmLabel: string
} {
  if (kind === 'premium') {
    return {
      title: PREMIUM_JOB_INTEREST_TITLE,
      message: PREMIUM_JOB_INTEREST_MESSAGE,
      confirmLabel: "I'm Still Interested",
    }
  }
  return {
    message: CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
    confirmLabel: "Still I'm Interested",
  }
}

export function resolveJobInterestModalKind(options: {
  isPublic?: boolean | null
  publicAccessLevel?: string | null
  isCampusDrive?: boolean | null
  reason?: string | null
}): JobInterestModalKind {
  if (isPremiumJobInterestMessage(options.reason)) return 'premium'
  if (
    isPremiumPublicJob({
      isPublic: options.isPublic,
      publicAccessLevel: options.publicAccessLevel,
    }) &&
    !options.isCampusDrive
  ) {
    return 'premium'
  }
  return 'campus_drive'
}

/**
 * Apply-button override from campus-drive / premium job request status.
 * Application status always wins when present (priority 1–2 → Applied).
 */
export function getCampusDriveRequestApplyOverride(
  campusDriveRequestStatus?: string | null
): 'pending' | 'rejected' | null {
  if (campusDriveRequestStatus === 'pending') return 'pending'
  if (campusDriveRequestStatus === 'rejected') return 'rejected'
  return null
}

/**
 * Resolve how a non-eligible campus-drive / premium apply should be handled for this student+job.
 */
export async function resolveCampusDriveInterestOutcome(
  jobId: string
): Promise<{
  outcome: CampusDriveInterestOutcome
  status?: CampusDriveRequestStatus | null
}> {
  try {
    const existing = await campusDriveRequestService.getMyRequestForJob(jobId)
    if (!existing.exists || !existing.status) {
      return { outcome: 'show_interest_modal' }
    }
    if (existing.status === 'pending') {
      return { outcome: 'pending', status: 'pending' }
    }
    if (existing.status === 'rejected') {
      return { outcome: 'rejected', status: 'rejected' }
    }
    if (existing.status === 'accepted') {
      return { outcome: 'accepted', status: 'accepted' }
    }
    return { outcome: 'show_interest_modal', status: existing.status }
  } catch {
    return { outcome: 'error' }
  }
}

export function toastCampusDriveRequestStatus(
  outcome: CampusDriveInterestOutcome,
  kind: JobInterestModalKind = 'campus_drive'
): void {
  if (outcome === 'pending') {
    toast(CAMPUS_DRIVE_REQUEST_PENDING_MESSAGE)
  } else if (outcome === 'rejected') {
    toast.error(
      kind === 'premium'
        ? PREMIUM_JOB_REQUEST_REJECTED_MESSAGE
        : CAMPUS_DRIVE_REQUEST_REJECTED_MESSAGE
    )
  }
}

export async function submitCampusDriveInterest(jobId: string): Promise<{
  ok: boolean
  status?: CampusDriveRequestStatus
  message?: string
}> {
  try {
    const created = await campusDriveRequestService.createRequest(jobId)
    const status = created.status as CampusDriveRequestStatus
    if (status === 'pending') {
      toast.success(CAMPUS_DRIVE_REQUEST_SENT_MESSAGE)
    } else if (status === 'accepted') {
      toast.success('Your request was already accepted. You can apply for this job.')
    } else if (status === 'rejected') {
      toast.error(
        created.request_type === 'premium'
          ? PREMIUM_JOB_REQUEST_REJECTED_MESSAGE
          : CAMPUS_DRIVE_REQUEST_REJECTED_MESSAGE
      )
    } else {
      toast.success(CAMPUS_DRIVE_REQUEST_SENT_MESSAGE)
    }
    return { ok: true, status }
  } catch (error: unknown) {
    const message = getApplyErrorMessage(error) || 'Failed to send request. Please try again.'
    toast.error(message)
    return { ok: false, message }
  }
}

export function shouldOpenCampusDriveInterestFromApplyError(error: unknown): boolean {
  const message = getApplyErrorMessage(error)
  return isJobInterestGateMessage(message)
}

export {
  CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
  PREMIUM_JOB_INTEREST_MESSAGE,
  PREMIUM_JOB_INTEREST_TITLE,
  isJobInterestGateMessage,
  isPremiumJobInterestMessage,
}
