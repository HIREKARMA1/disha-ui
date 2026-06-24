export type OtpRateLimitPurpose = 'signup' | 'password_reset' | 'phone'

export interface OtpRateLimitStatus {
  otp_request_count: number
  max_attempts: number
  cooldown_seconds: number
  lockout_seconds: number
  last_otp_sent_at: string | null
  cooldown_until: string | null
  lockout_until: string | null
  remaining_cooldown_seconds: number
  remaining_lockout_seconds: number
  is_locked_out: boolean
  can_request: boolean
}

export interface OtpSendResponse {
  message: string
  rate_limit?: OtpRateLimitStatus
}

export function formatOtpCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function remainingSecondsUntil(isoTimestamp: string | null | undefined): number {
  if (!isoTimestamp) return 0
  const target = new Date(isoTimestamp).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, Math.ceil((target - Date.now()) / 1000))
}

export function getOtpRateLimitStorageKey(
  purpose: OtpRateLimitPurpose,
  identifier: string,
  userType?: string
): string {
  const id = purpose === 'password_reset' && userType
    ? `${identifier.toLowerCase()}:${userType}`
    : identifier.toLowerCase()
  return `otp_rate_limit_${purpose}_${id}`
}

export function saveOtpRateLimitToStorage(
  purpose: OtpRateLimitPurpose,
  identifier: string,
  status: OtpRateLimitStatus,
  userType?: string
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      getOtpRateLimitStorageKey(purpose, identifier, userType),
      JSON.stringify(status)
    )
  } catch {
    // ignore storage errors
  }
}

export function loadOtpRateLimitFromStorage(
  purpose: OtpRateLimitPurpose,
  identifier: string,
  userType?: string
): OtpRateLimitStatus | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getOtpRateLimitStorageKey(purpose, identifier, userType))
    if (!raw) return null
    return JSON.parse(raw) as OtpRateLimitStatus
  } catch {
    return null
  }
}

export function deriveCountdownFromStatus(status: OtpRateLimitStatus): {
  countdown: number
  isLockedOut: boolean
} {
  const lockoutRemaining = status.is_locked_out
    ? Math.max(status.remaining_lockout_seconds, remainingSecondsUntil(status.lockout_until))
    : 0

  let cooldownRemaining = status.is_locked_out
    ? 0
    : Math.max(status.remaining_cooldown_seconds, remainingSecondsUntil(status.cooldown_until))

  if (
    cooldownRemaining === 0 &&
    !status.is_locked_out &&
    status.last_otp_sent_at &&
    status.otp_request_count > 0
  ) {
    const sentAt = new Date(status.last_otp_sent_at).getTime()
    if (!Number.isNaN(sentAt)) {
      const cooldownEnd = sentAt + status.cooldown_seconds * 1000
      cooldownRemaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000))
    }
  }

  if (lockoutRemaining > 0) {
    return { countdown: lockoutRemaining, isLockedOut: true }
  }
  return { countdown: cooldownRemaining, isLockedOut: false }
}

export function getRemainingAttempts(
  status: OtpRateLimitStatus | null,
  defaultMax = 3
): { remaining: number; max: number } {
  const max = status?.max_attempts ?? defaultMax
  if (!status) {
    return { remaining: max, max }
  }
  return {
    remaining: Math.max(0, max - status.otp_request_count),
    max,
  }
}

export const OTP_LOCKOUT_MESSAGE =
  'You have reached the maximum OTP attempts. Please try again after 10 minutes.'

export function getOtpStatusMessage(
  countdown: number,
  isLockedOut: boolean
): string | null {
  if (countdown <= 0) return null
  if (isLockedOut) {
    return OTP_LOCKOUT_MESSAGE
  }
  return `You can request a new OTP in ${formatOtpCountdown(countdown)}`
}

export function getOtpButtonLabel(
  countdown: number,
  isLockedOut: boolean,
  actionLabel: string = 'Resend OTP'
): string {
  if (countdown <= 0) return actionLabel
  if (isLockedOut) {
    return `Locked (${formatOtpCountdown(countdown)})`
  }
  return `Resend in ${formatOtpCountdown(countdown)}`
}
