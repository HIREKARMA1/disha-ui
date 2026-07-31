/**
 * Persist intended event registration across login redirects.
 * Cleared after a successful attempt (or when consumed as expired).
 */

const STORAGE_KEY = 'pending_event_registration'
const MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

export interface PendingEventRegistration {
  slug: string
  eventId?: string
  action: 'register'
  createdAt: number
}

export function storePendingEventRegistration(slug: string, eventId?: string): void {
  if (typeof window === 'undefined') return
  const payload: PendingEventRegistration = {
    slug,
    eventId,
    action: 'register',
    createdAt: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function peekPendingEventRegistration(): PendingEventRegistration | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingEventRegistration
    if (!parsed?.slug || parsed.action !== 'register') {
      clearPendingEventRegistration()
      return null
    }
    if (Date.now() - (parsed.createdAt || 0) > MAX_AGE_MS) {
      clearPendingEventRegistration()
      return null
    }
    return parsed
  } catch {
    clearPendingEventRegistration()
    return null
  }
}

export function clearPendingEventRegistration(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function buildEventRegisterRedirect(slug: string, eventId?: string): string {
  const params = new URLSearchParams()
  params.set('register', '1')
  params.set('action', 'register')
  if (eventId) params.set('eventId', eventId)
  return `/events/${slug}?${params.toString()}`
}
