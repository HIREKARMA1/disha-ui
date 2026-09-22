import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabaseRouteClient'
import { isSafeAuthRedirectPath } from '@/lib/supabaseClient'

/** Resolve public origin for local + reverse-proxied production. */
function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (forwardedHost) {
    const host = forwardedHost.split(',')[0]?.trim()
    const proto =
      forwardedProto?.split(',')[0]?.trim() ||
      (process.env.NODE_ENV === 'development' ? 'http' : 'https')
    if (host) return `${proto}://${host}`
  }

  return request.nextUrl.origin
}

/**
 * Supabase Google OAuth PKCE callback.
 * Establishes a temporary Supabase session only — does NOT write DISHA JWT tokens.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const origin = getRequestOrigin(request)

  // Match existing student post-login default; honor safe `redirect` from OAuth start.
  const redirectParam = url.searchParams.get('redirect')
  const successPath = isSafeAuthRedirectPath(redirectParam)
    ? redirectParam
    : '/dashboard/student'

  const errorUrl = `${origin}/auth/error`

  if (!code) {
    return NextResponse.redirect(`${errorUrl}?reason=missing_code`)
  }

  try {
    let response = NextResponse.redirect(`${origin}${successPath}`)

    const supabase = createSupabaseRouteClient({
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.redirect(`${origin}${successPath}`)
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${errorUrl}?reason=exchange_failed`)
    }

    return response
  } catch {
    return NextResponse.redirect(`${errorUrl}?reason=callback_error`)
  }
}
