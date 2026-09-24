import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'

type CookieToSet = { name: string; value: string; options: CookieOptions }

/**
 * Minimal server Supabase client for the OAuth PKCE callback Route Handler.
 * Uses the public publishable key only — never a service-role / secret key.
 */
export function createSupabaseRouteClient(handlers: {
  getAll: () => { name: string; value: string }[]
  setAll: (cookiesToSet: CookieToSet[]) => void
}): SupabaseClient {
  const { url, publishableKey } = config.supabase
  if (!url || !publishableKey) {
    throw new Error(
      'Missing Supabase config. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_*).'
    )
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: handlers.getAll,
      setAll: handlers.setAll,
    },
  })
}
