'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { getSupabaseBrowserClient, isSafeAuthRedirectPath } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { markQuickAccountSetupPending } from '@/lib/quickAccountSetupStorage'
import { profileService } from '@/services/profileService'
import type { TokenResponse } from '@/types/auth'

const EXCHANGE_TIMEOUT_MS = 30_000

/** Deduplicate Strict Mode double-mount so we only hit the backend once. */
let dishaExchangePromise: Promise<TokenResponse> | null = null

function exchangeSupabaseForDisha(supabaseAccessToken: string): Promise<TokenResponse> {
  if (!dishaExchangePromise) {
    dishaExchangePromise = apiClient
      .loginWithSupabaseGoogle(supabaseAccessToken)
      .catch((error) => {
        dishaExchangePromise = null
        throw error
      })
  }
  return dishaExchangePromise
}

function withTimeout<T>(promise: Promise<T>, ms: number, reason: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(Object.assign(new Error(reason), { timeoutReason: reason }))
    }, ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      }
    )
  })
}

/**
 * Completes student Google Sign-In:
 * Supabase session (cookies) → POST /auth/supabase/google → DISHA localStorage JWT.
 */
function GoogleCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const runIdRef = useRef(0)

  useEffect(() => {
    const runId = ++runIdRef.current
    const isActive = () => runIdRef.current === runId
    const redirectFromQuery = searchParams.get('redirect')

    console.info('[GoogleComplete] page mounted')

    const fail = (reason: string) => {
      if (!isActive()) return
      console.info('[GoogleComplete] failing with reason', reason)
      dishaExchangePromise = null
      router.replace(`/auth/error?reason=${encodeURIComponent(reason)}`)
    }

    const run = async () => {
      try {
        console.info('[GoogleComplete] getting Supabase session')
        const supabase = getSupabaseBrowserClient()

        // Brief retries: cookies from /auth/callback may not be readable on the first tick.
        let sessionResult = await withTimeout(
          supabase.auth.getSession(),
          EXCHANGE_TIMEOUT_MS,
          'google_auth_timeout'
        )
        for (
          let attempt = 0;
          attempt < 3 &&
          !sessionResult.error &&
          !sessionResult.data?.session?.access_token;
          attempt += 1
        ) {
          await new Promise((resolve) => window.setTimeout(resolve, 300))
          if (!isActive()) return
          sessionResult = await withTimeout(
            supabase.auth.getSession(),
            EXCHANGE_TIMEOUT_MS,
            'google_auth_timeout'
          )
        }

        const { data, error: sessionError } = sessionResult

        console.info('[GoogleComplete] session result', {
          hasError: Boolean(sessionError),
          hasSession: Boolean(data?.session),
          hasAccessToken: Boolean(data?.session?.access_token),
          userId: data?.session?.user?.id ?? null,
          email: data?.session?.user?.email ?? null,
        })

        if (sessionError) {
          fail('supabase_session_error')
          return
        }

        if (!data?.session) {
          fail('supabase_session_missing')
          return
        }

        if (!data.session.access_token) {
          fail('supabase_token_missing')
          return
        }

        const supabaseAccessToken = data.session.access_token
        const supabaseEmail =
          typeof data.session.user?.email === 'string' ? data.session.user.email : ''
        const meta = data.session.user?.user_metadata
        const supabaseName =
          (typeof meta?.full_name === 'string' && meta.full_name) ||
          (typeof meta?.name === 'string' && meta.name) ||
          supabaseEmail

        if (!isActive()) return

        console.info('[GoogleComplete] calling DISHA exchange')
        const response = await withTimeout(
          exchangeSupabaseForDisha(supabaseAccessToken),
          EXCHANGE_TIMEOUT_MS,
          'google_auth_timeout'
        )

        console.info('[GoogleComplete] DISHA exchange response', {
          hasAccessToken: Boolean(response?.access_token),
          hasRefreshToken: Boolean(response?.refresh_token),
          userType: response?.user_type ?? null,
          hasUserId: Boolean(response?.user_id),
        })

        if (
          !response?.access_token ||
          !response?.refresh_token ||
          response.user_type !== 'student'
        ) {
          fail('google_auth_failed')
          return
        }

        if (!isActive()) return

        console.info('[GoogleComplete] storing DISHA session')
        // Store DISHA tokens only — never write supabaseAccessToken into access_token.
        apiClient.setAuthTokens(response.access_token, response.refresh_token)

        // Mirror student registration: sessionStorage pending flag → StudentDashboardLayout
        // mounts existing QuickAccountSetupModal. Gate on profile-completion (not provider).
        let needsQuickAccountSetup = false
        try {
          const completion = await profileService.getProfileCompletion()
          const missing = [
            ...(completion.core_missing_fields || []),
            ...(completion.missing_fields || []),
          ].map((f) => String(f).toLowerCase())
          const contactIncomplete = ['phone', 'dob', 'gender', 'city', 'state', 'country'].some(
            (field) => missing.includes(field)
          )
          needsQuickAccountSetup =
            completion.can_apply_for_jobs === false || contactIncomplete
          console.info('[GoogleComplete] profile completion check', {
            canApply: completion.can_apply_for_jobs ?? null,
            percentage: completion.completion_percentage ?? null,
            needsQuickAccountSetup,
          })
        } catch {
          // Do not invent incompleteness — complete linked students must not get a false popup.
          console.info('[GoogleComplete] profile completion unavailable; skipping quick setup flag')
        }

        if (needsQuickAccountSetup) {
          markQuickAccountSetupPending()
        }

        login(
          {
            id: response.user_id || 'temp-id',
            email: supabaseEmail,
            user_type: 'student',
            name: supabaseName || supabaseEmail,
          },
          response.access_token,
          response.refresh_token,
          needsQuickAccountSetup ? { skipEventPopup: true } : undefined
        )

        // Incomplete Google students: same as register — land on dashboard so the
        // existing modal mounts (layout only shows it on the main student dashboard).
        if (needsQuickAccountSetup) {
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('redirect_after_login')
            } catch {
              /* ignore */
            }
          }
          if (!isActive()) return
          console.info('[GoogleComplete] redirecting to dashboard for Quick Account Setup')
          router.replace('/dashboard/student')
          return
        }

        let next =
          redirectFromQuery ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('redirect_after_login')
            : null)

        if (next) {
          try {
            next = decodeURIComponent(next)
          } catch {
            next = null
          }
        }

        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('redirect_after_login')
          } catch {
            /* ignore */
          }
        }

        if (!isActive()) return

        const destination = isSafeAuthRedirectPath(next) ? next : '/dashboard/student'
        console.info('[GoogleComplete] redirecting to dashboard', { destination })
        router.replace(destination)
      } catch (error: unknown) {
        const timeoutReason = (error as { timeoutReason?: string })?.timeoutReason
        if (timeoutReason === 'google_auth_timeout') {
          fail('google_auth_timeout')
          return
        }

        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401) {
          fail('google_auth_unauthorized')
          return
        }
        if (status === 403) {
          fail('google_auth_forbidden')
          return
        }
        if (status === 409) {
          fail('google_auth_conflict')
          return
        }

        console.info('[GoogleComplete] unexpected error', {
          name: error instanceof Error ? error.name : 'unknown',
          message: error instanceof Error ? error.message : 'unknown',
          status: status ?? null,
        })
        fail('google_auth_failed')
      }
    }

    void run()

    return () => {
      // Invalidate this run so a cancelled Strict Mode pass cannot redirect/fail.
      // A new effect invocation increments runIdRef and proceeds.
      if (runIdRef.current === runId) {
        runIdRef.current += 1
      }
    }
    // Mount-once: Strict Mode remount is handled via runId; avoid re-running on dep identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      <p className="text-sm text-gray-600 dark:text-gray-300">Completing Google sign-in…</p>
    </div>
  )
}

export default function GoogleCompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-4 dark:bg-gray-950">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
        }
      >
        <GoogleCompleteContent />
      </Suspense>
    </div>
  )
}
