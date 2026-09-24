import type { UserType } from '@/types/auth'

export interface AuthUser {
  id: string
  email: string
  user_type: UserType
  name?: string
}

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const USER_DATA_KEY = 'user_data'
export const TEMP_USER_DATA_KEY = 'temp_user_data'
export const TEMP_USER_TYPE_KEY = 'temp_user_type'

export const TEMP_ACCESS_TOKEN = 'temp-access-token'
export const TEMP_REFRESH_TOKEN = 'temp-refresh-token'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (!canUseStorage()) return
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function getUserData(): AuthUser | null {
  if (!canUseStorage()) return null
  try {
    const raw = localStorage.getItem(USER_DATA_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setUserData(user: AuthUser): void {
  if (!canUseStorage()) return
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
}

export function getTempUserData(): AuthUser | null {
  if (!canUseStorage()) return null
  try {
    const raw = localStorage.getItem(TEMP_USER_DATA_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isTemporaryAuth(): boolean {
  return getAccessToken() === TEMP_ACCESS_TOKEN && getRefreshToken() === TEMP_REFRESH_TOKEN
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized
  return atob(padded)
}

export function decodeAccessToken(accessToken: string): Record<string, unknown> | null {
  try {
    const payload = accessToken.split('.')[1]
    if (!payload) return null
    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>
  } catch {
    return null
  }
}

export function isAccessTokenValid(accessToken: string): boolean {
  if (accessToken === TEMP_ACCESS_TOKEN) return true
  const payload = decodeAccessToken(accessToken)
  if (!payload) return false
  const exp = payload.exp
  // Missing/invalid exp must not be treated as a valid session
  if (typeof exp !== 'number') return false
  return exp > Date.now() / 1000
}

/** True when stored access token exists and is still within JWT exp. */
export function hasValidAccessSession(): boolean {
  if (isTemporaryAuth()) return !!getTempUserData()
  const accessToken = getAccessToken()
  if (!accessToken) return false
  return isAccessTokenValid(accessToken)
}

export function userFromAccessToken(accessToken: string): AuthUser | null {
  const payload = decodeAccessToken(accessToken)
  if (!payload) return null
  const userType = payload.user_type
  return {
    id: String(payload.sub || 'temp-id'),
    email: typeof payload.email === 'string' ? payload.email : '',
    user_type:
      userType === 'corporate' || userType === 'university' || userType === 'admin'
        ? userType
        : 'student',
    name: typeof payload.name === 'string' ? payload.name : '',
  }
}

export function readLocalSessionUser(): AuthUser | null {
  if (isTemporaryAuth()) {
    return getTempUserData()
  }

  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  if (!accessToken || !refreshToken) return null
  if (!isAccessTokenValid(accessToken)) return null

  const stored = getUserData()
  if (stored) return stored

  const fromToken = userFromAccessToken(accessToken)
  if (fromToken) {
    setUserData(fromToken)
  }
  return fromToken
}

export function persistLoginSession(
  user: AuthUser,
  accessToken: string,
  refreshToken: string
): void {
  setAuthTokens(accessToken, refreshToken)
  setUserData(user)
}

export function clearAuthStorage(): void {
  if (!canUseStorage()) return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_DATA_KEY)
  localStorage.removeItem(TEMP_USER_DATA_KEY)
  localStorage.removeItem(TEMP_USER_TYPE_KEY)
}

export function isAuthRetryExcludedUrl(url?: string): boolean {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/supabase/google')
  )
}
