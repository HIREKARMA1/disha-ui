'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Button } from '@/components/ui/button'
import { buildAuthPath } from '@/lib/authLinks'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const detail =
    reason === 'missing_code'
      ? 'The sign-in request was incomplete.'
      : reason === 'exchange_failed' || reason === 'callback_error'
        ? 'We could not verify your Google sign-in.'
        : reason === 'supabase_session_missing' || reason === 'missing_session'
          ? 'Your Google session expired. Please try again.'
          : reason === 'supabase_session_error'
            ? 'We could not read your Google session. Please try again.'
            : reason === 'supabase_token_missing'
              ? 'Your Google session was incomplete. Please try again.'
              : reason === 'google_auth_unauthorized' || reason === 'disha_unauthorized'
                ? 'Google sign-in could not be verified.'
                : reason === 'google_auth_forbidden' || reason === 'disha_forbidden'
                  ? 'This account cannot sign in with Google right now.'
                  : reason === 'google_auth_conflict' || reason === 'disha_conflict'
                    ? 'This Google account cannot be linked to your existing profile.'
                    : reason === 'google_auth_timeout'
                      ? 'Google sign-in took too long. Please try again.'
                      : reason === 'google_auth_failed' || reason === 'disha_exchange_failed'
                        ? 'We could not complete Google sign-in with DISHA.'
                        : 'Something went wrong during Google sign-in.'

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Sign-in failed
      </h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{detail}</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Please try again with Google, or use email and password.
      </p>
      <div className="mt-6">
        <Button asChild className="h-11 w-full rounded-xl bg-primary-600 font-semibold hover:bg-primary-700">
          <Link href={buildAuthPath('/auth/login', { type: 'student' })}>
            Back to student login
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="relative min-h-screen bg-[#f4f5f7] dark:bg-gray-950">
      <header className="relative z-20 flex items-center px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo priority imageClassName="h-8 sm:h-9" />
      </header>
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 pb-10">
        <Suspense
          fallback={
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
          }
        >
          <AuthErrorContent />
        </Suspense>
      </div>
    </div>
  )
}
