import { getSupabaseAuthCallbackUrl, getSupabaseBrowserClient } from '@/lib/supabaseClient'

/**
 * Start Supabase Google OAuth for students only.
 * After callback (Step 9+), exchange for DISHA JWT — do not treat Supabase session as app auth.
 */
export async function startStudentGoogleAuth(options?: {
  redirectPath?: string | null
}): Promise<void> {
  const redirectPath =
    options?.redirectPath ||
    (typeof window !== 'undefined' ? localStorage.getItem('redirect_after_login') : null)

  if (redirectPath && typeof window !== 'undefined') {
    try {
      localStorage.setItem('redirect_after_login', redirectPath)
    } catch {
      /* ignore quota / private mode */
    }
  }

  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getSupabaseAuthCallbackUrl(redirectPath),
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    throw error
  }
}
