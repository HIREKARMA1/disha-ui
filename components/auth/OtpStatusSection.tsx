'use client'

import { cn } from '@/lib/utils'

interface OtpStatusSectionProps {
  formattedTimeRemaining: string
  remainingAttempts: number
  maxAttempts: number
  isLockedOut: boolean
  lockoutMessage?: string | null
  canShowResendButton: boolean
  isResendDisabled: boolean
  resendButtonLabel: string
  onResend: () => void
  isResending?: boolean
}

export function OtpStatusSection({
  formattedTimeRemaining,
  remainingAttempts,
  maxAttempts,
  isLockedOut,
  lockoutMessage,
  canShowResendButton,
  onResend,
  isResending = false,
}: OtpStatusSectionProps) {
  const isTimerExpired = formattedTimeRemaining === '00:00'
  const isResendActive =
    isTimerExpired && !isLockedOut && remainingAttempts > 0 && !isResending

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 sm:p-4 space-y-3">
      <div className="space-y-1.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
          <span className="font-mono font-semibold text-gray-900 dark:text-white tabular-nums">
            {formattedTimeRemaining}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Remaining Attempts:</span>
          <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
            {remainingAttempts}/{maxAttempts}
          </span>
        </div>
      </div>

      {isLockedOut && lockoutMessage && (
        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          {lockoutMessage}
        </p>
      )}

      {canShowResendButton && (
        <button
          type="button"
          onClick={onResend}
          disabled={!isResendActive}
          className={cn(
            'inline-flex w-full h-10 sm:h-11 items-center justify-center rounded-md text-sm font-medium transition-colors',
            isResendActive
              ? 'cursor-pointer border border-transparent text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
              : 'cursor-not-allowed border border-gray-300 bg-transparent text-gray-900 opacity-50 dark:border-gray-600 dark:text-gray-50'
          )}
        >
          {isResending ? 'Resend OTP...' : 'Resend OTP'}
        </button>
      )}
    </div>
  )
}
