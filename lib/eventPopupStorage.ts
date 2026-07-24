'use client'

/** Shared storage keys / helpers for Event Announcement popup visibility. */

export const EVENT_POPUP_STORAGE_KEY = 'disha_event_popup_last_seen'
export const EVENT_POPUP_LOGIN_PENDING_KEY = 'disha_event_popup_login_pending'

export interface EventPopupStorage {
  /** Calendar day (local) when the popup was last dismissed, e.g. "2026-07-24" */
  date: string
  eventIds: string[]
}

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Call on successful login so the popup shows again for this session. */
export function markEventPopupLoginPending() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(EVENT_POPUP_LOGIN_PENDING_KEY, '1')
  } catch {
    // Ignore private mode / storage failures
  }
}

export function clearEventPopupLoginPending() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(EVENT_POPUP_LOGIN_PENDING_KEY)
  } catch {
    // ignore
  }
}

export function isEventPopupLoginPending(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(EVENT_POPUP_LOGIN_PENDING_KEY) === '1'
  } catch {
    return false
  }
}

/** Clear dismiss + pending state on logout. */
export function clearEventPopupState() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(EVENT_POPUP_LOGIN_PENDING_KEY)
    localStorage.removeItem(EVENT_POPUP_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function readEventPopupStorage(): EventPopupStorage | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(EVENT_POPUP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<EventPopupStorage> & { lastSeen?: number }

    // Migrate older timestamp-based payload if present
    if (typeof parsed.lastSeen === 'number' && !parsed.date) {
      return {
        date: getLocalDateKey(new Date(parsed.lastSeen)),
        eventIds: Array.isArray(parsed.eventIds) ? parsed.eventIds : [],
      }
    }

    if (typeof parsed.date !== 'string' || !Array.isArray(parsed.eventIds)) {
      return null
    }
    return { date: parsed.date, eventIds: parsed.eventIds }
  } catch {
    return null
  }
}

export function writeEventPopupDismissed(eventIds: string[]) {
  if (typeof window === 'undefined') return
  const payload: EventPopupStorage = {
    date: getLocalDateKey(),
    eventIds,
  }
  try {
    localStorage.setItem(EVENT_POPUP_STORAGE_KEY, JSON.stringify(payload))
    clearEventPopupLoginPending()
  } catch {
    // ignore
  }
}
