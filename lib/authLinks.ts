import type { UserType } from '@/types/auth'

export const AUTH_USER_TYPES = ['student', 'corporate', 'university', 'admin'] as const
export const REGISTER_USER_TYPES = ['student', 'corporate', 'university'] as const

export type AuthPage = '/auth/login' | '/auth/register' | '/auth/forgot-password'

const LOGIN_TYPES = new Set<string>(AUTH_USER_TYPES)
const REGISTER_TYPES = new Set<string>(REGISTER_USER_TYPES)

export function parseAuthUserType(value: string | null | undefined): UserType | null {
  if (value && LOGIN_TYPES.has(value)) return value as UserType
  return null
}

export function parseRegisterUserType(value: string | null | undefined): UserType | null {
  if (value && REGISTER_TYPES.has(value)) return value as UserType
  return null
}

function resolveType(path: AuthPage, type?: UserType | null): UserType {
  if (path === '/auth/login') {
    return parseAuthUserType(type) ?? 'student'
  }
  return parseRegisterUserType(type) ?? 'student'
}

export function buildAuthPath(
  path: AuthPage,
  options?: {
    type?: UserType | null
    redirect?: string | null
    extra?: Record<string, string | undefined>
  }
): string {
  const params = new URLSearchParams()
  if (options?.type) {
    params.set('type', resolveType(path, options.type))
  }
  if (options?.redirect) params.set('redirect', options.redirect)
  if (options?.extra) {
    for (const [key, value] of Object.entries(options.extra)) {
      if (value) params.set(key, value)
    }
  }
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

/** Update or remove `type` on the current URL without a full navigation. */
export function replaceTypeInCurrentUrl(type: UserType | null) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (type) url.searchParams.set('type', type)
  else url.searchParams.delete('type')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(window.history.state, '', next)
}
