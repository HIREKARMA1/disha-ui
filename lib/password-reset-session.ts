import { UserType } from '@/types/auth'

const SESSION_KEY = 'disha_password_reset_session'

export type PasswordResetStep = 'email' | 'otp' | 'password'

export interface PasswordResetSession {
  email: string
  userType: UserType
  step: PasswordResetStep
}

export function savePasswordResetSession(session: PasswordResetSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore storage errors
  }
}

export function loadPasswordResetSession(): PasswordResetSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PasswordResetSession
    if (!parsed.email || !parsed.userType || !parsed.step) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPasswordResetSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore storage errors
  }
}
