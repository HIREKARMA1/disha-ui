'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { startStudentGoogleAuth } from '@/lib/studentGoogleAuth'
import { getErrorMessage } from '@/lib/error-handler'
import { cn } from '@/lib/utils'

type StudentGoogleAuthButtonProps = {
  /** Post-auth path preserved through OAuth callback */
  redirectPath?: string | null
  /** When true, user must accept terms before Google auth (login flows) */
  requireTerms?: boolean
  termsAccepted?: boolean
  label?: string
  className?: string
  disabled?: boolean
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

/**
 * Additional Google sign-in/up for students only.
 * Does not replace email/password auth.
 */
export function StudentGoogleAuthButton({
  redirectPath,
  requireTerms = false,
  termsAccepted = false,
  label = 'Continue with Google',
  className,
  disabled = false,
}: StudentGoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (requireTerms && !termsAccepted) {
      toast.error('Please accept Terms and Conditions to continue')
      return
    }

    setIsLoading(true)
    try {
      await startStudentGoogleAuth({ redirectPath })
      // Browser navigates away to Google; keep loading if redirect is delayed
    } catch (error) {
      setIsLoading(false)
      toast.error(getErrorMessage(error, 'Google sign-in failed. Please try again.'))
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      loading={isLoading}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(
        'h-11 w-full rounded-xl border-gray-300 bg-white text-base font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
        className
      )}
    >
      {!isLoading && <GoogleGlyph className="mr-2 h-5 w-5 shrink-0" />}
      {label}
    </Button>
  )
}

/** Divider used above the Google button on student auth screens. */
export function StudentGoogleAuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          or
        </span>
      </div>
    </div>
  )
}
