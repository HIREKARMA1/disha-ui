import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'

let browserClient: SupabaseClient | null = null

/**
 * Browser Supabase client for student Google OAuth (PKCE + cookies via @supabase/ssr).
 * Does not replace DISHA JWT auth — use only for identity (OAuth), then exchange for DISHA tokens.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  const { url, publishableKey } = config.supabase
  if (!url || !publishableKey) {
    throw new Error(
      'Missing Supabase config. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_*).'
    )
  }

  // Cookie storage so the App Router /auth/callback Route Handler can complete PKCE.
  browserClient = createBrowserClient(url, publishableKey)

  return browserClient
}

/** Only allow same-origin relative paths (blocks open redirects). */
export function isSafeAuthRedirectPath(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.includes('\\')) return false
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false
  return true
}

/** OAuth redirect target after Google sign-in (must match Supabase redirect allow-list). */
export function getSupabaseAuthCallbackUrl(redirectPath?: string | null): string {
  const base = config.app.url.replace(/\/$/, '')
  const params = new URLSearchParams({ type: 'student' })
  if (isSafeAuthRedirectPath(redirectPath)) {
    params.set('redirect', redirectPath)
  }
  return `${base}/auth/callback?${params.toString()}`
}
