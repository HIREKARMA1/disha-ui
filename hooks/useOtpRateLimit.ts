'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '@/lib/api'
import {
  deriveCountdownFromStatus,
  formatOtpCountdown,
  getRemainingAttempts,
  loadOtpRateLimitFromStorage,
  OtpRateLimitPurpose,
  OtpRateLimitStatus,
  OTP_LOCKOUT_MESSAGE,
  saveOtpRateLimitToStorage,
} from '@/lib/otp-rate-limit'
import { extractOtpRateLimitFromError } from '@/lib/error-handler'

interface UseOtpRateLimitOptions {
  purpose: OtpRateLimitPurpose
  identifier: string | null
  userType?: string
  enabled?: boolean
}

function shouldPreferStatus(
  current: OtpRateLimitStatus | null,
  incoming: OtpRateLimitStatus
): boolean {
  if (!current) return true

  const currentDerived = deriveCountdownFromStatus(current)
  const incomingDerived = deriveCountdownFromStatus(incoming)

  if (incomingDerived.countdown > currentDerived.countdown) return true
  if (incoming.otp_request_count > current.otp_request_count) return true
  if (incoming.is_locked_out && !current.is_locked_out) return true
  if (currentDerived.countdown === 0) return true

  return false
}

export function useOtpRateLimit({
  purpose,
  identifier,
  userType,
  enabled = true,
}: UseOtpRateLimitOptions) {
  const [countdown, setCountdown] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<OtpRateLimitStatus | null>(null)
  const sendInFlightRef = useRef(false)
  const statusRef = useRef<OtpRateLimitStatus | null>(null)
  const skipNextRefreshRef = useRef(false)

  const applyStatus = useCallback(
    (nextStatus: OtpRateLimitStatus, storageIdentifier?: string | null) => {
      const derived = deriveCountdownFromStatus(nextStatus)
      statusRef.current = nextStatus
      setStatus(nextStatus)
      setCountdown(derived.countdown)
      setIsLockedOut(derived.isLockedOut)

      const id = storageIdentifier ?? identifier
      if (id) {
        saveOtpRateLimitToStorage(purpose, id, nextStatus, userType)
      }
    },
    [identifier, purpose, userType]
  )

  const mergeStatus = useCallback(
    (incoming: OtpRateLimitStatus, storageIdentifier?: string | null) => {
      if (shouldPreferStatus(statusRef.current, incoming)) {
        applyStatus(incoming, storageIdentifier)
      }
    },
    [applyStatus]
  )

  const refreshStatus = useCallback(async () => {
    if (!identifier || !enabled) return
    if (skipNextRefreshRef.current) {
      skipNextRefreshRef.current = false
      return
    }

    const cached = loadOtpRateLimitFromStorage(purpose, identifier, userType)
    if (cached) {
      mergeStatus(cached)
    }

    try {
      const params = new URLSearchParams({
        identifier,
        purpose,
      })
      if (purpose === 'password_reset' && userType) {
        params.set('user_type', userType)
      }
      const response = await apiClient.client.get<OtpRateLimitStatus>(
        `/auth/otp-rate-limit/status?${params.toString()}`
      )
      mergeStatus(response.data)
    } catch {
      // Keep the best known local status if the API request fails.
    }
  }, [enabled, identifier, mergeStatus, purpose, userType])

  useEffect(() => {
    if (!enabled || !identifier) return
    void refreshStatus()
  }, [enabled, identifier, refreshStatus])

  useEffect(() => {
    if (!status) return

    const tick = () => {
      const derived = deriveCountdownFromStatus(status)
      setCountdown(derived.countdown)
      setIsLockedOut(derived.isLockedOut)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [status])

  useEffect(() => {
    if (countdown === 0 && isLockedOut) {
      setIsLockedOut(false)
      void refreshStatus()
    }
  }, [countdown, isLockedOut, refreshStatus])

  const handleSendSuccess = useCallback(
    (rateLimit?: OtpRateLimitStatus, storageIdentifier?: string | null) => {
      if (rateLimit) {
        skipNextRefreshRef.current = true
        applyStatus(rateLimit, storageIdentifier)
        return
      }
      if (storageIdentifier ?? identifier) {
        void refreshStatus()
      }
    },
    [applyStatus, identifier, refreshStatus]
  )

  const handleSendError = useCallback(
    (error: unknown) => {
      const rateLimit = extractOtpRateLimitFromError(error)
      if (rateLimit) {
        applyStatus(rateLimit)
      }
    },
    [applyStatus]
  )

  const beginSend = useCallback(() => {
    if (sendInFlightRef.current || isSending || isLockedOut) {
      return false
    }

    const derived = status ? deriveCountdownFromStatus(status) : { countdown, isLockedOut }
    if (derived.countdown > 0) {
      return false
    }

    const { remaining } = getRemainingAttempts(status)
    if (remaining <= 0 || status?.can_request === false) {
      return false
    }

    sendInFlightRef.current = true
    setIsSending(true)
    return true
  }, [countdown, isLockedOut, isSending, status])

  const endSend = useCallback(() => {
    sendInFlightRef.current = false
    setIsSending(false)
  }, [])

  const { remaining: remainingAttempts, max: maxAttempts } = getRemainingAttempts(status)
  const formattedTimeRemaining = formatOtpCountdown(countdown)
  const isCooldownActive = countdown > 0 && !isLockedOut
  const hasOtpActivity = status !== null && status.otp_request_count > 0
  const canShowResendButton = hasOtpActivity && (remainingAttempts > 0 || isLockedOut)
  const isResendDisabled =
    isLockedOut || isCooldownActive || isSending || remainingAttempts <= 0

  return {
    countdown,
    isLockedOut,
    isSending,
    isCooldownActive,
    status,
    remainingAttempts,
    maxAttempts,
    formattedTimeRemaining,
    canShowResendButton,
    isResendDisabled,
    resendButtonLabel:
      isLockedOut
        ? 'Resend OTP'
        : isCooldownActive && countdown > 0
          ? `Resend OTP (${formatOtpCountdown(countdown)})`
          : 'Resend OTP',
    lockoutMessage: isLockedOut ? OTP_LOCKOUT_MESSAGE : null,
    applyStatus,
    refreshStatus,
    handleSendSuccess,
    handleSendError,
    beginSend,
    endSend,
  }
}
