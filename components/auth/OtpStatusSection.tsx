'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  isResendDisabled,
  resendButtonLabel,
  onResend,
  isResending = false,
}: OtpStatusSectionProps) {
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
        <Button
          type="button"
          variant="outline"
          onClick={onResend}
          loading={isResending}
          disabled={isResendDisabled}
          className="w-full h-10 sm:h-11 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {resendButtonLabel}
        </Button>
      )}
    </div>
  )
}
