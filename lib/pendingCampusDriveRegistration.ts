/**
 * Persist intended campus drive registration across login redirects.
 */

import { resolveSafeAuthRedirect } from '@/lib/supabaseClient'

const STORAGE_KEY = 'pending_campus_drive_registration'
const MAX_AGE_MS = 30 * 60 * 1000

export interface PendingCampusDriveRegistration {
  slug: string
  driveId?: string
  action: 'register'
  createdAt: number
}

export function storePendingCampusDriveRegistration(slug: string, driveId?: string): void {
  if (typeof window === 'undefined') return
  const payload: PendingCampusDriveRegistration = {
    slug,
    driveId,
    action: 'register',
    createdAt: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export function peekPendingCampusDriveRegistration(): PendingCampusDriveRegistration | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingCampusDriveRegistration
    if (!parsed?.slug || parsed.action !== 'register') {
      clearPendingCampusDriveRegistration()
      return null
    }
    if (Date.now() - (parsed.createdAt || 0) > MAX_AGE_MS) {
      clearPendingCampusDriveRegistration()
      return null
    }
    return parsed
  } catch {
    clearPendingCampusDriveRegistration()
    return null
  }
}

export function clearPendingCampusDriveRegistration(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function buildCampusDriveRegisterRedirect(slug: string, driveId?: string): string {
  const params = new URLSearchParams()
  params.set('register', '1')
  params.set('action', 'register')
  if (driveId) params.set('driveId', driveId)
  return `/campus-drives/${encodeURIComponent(slug)}?${params.toString()}`
}

/** Login return path that resumes registration for one drive. */
export function buildSafeCampusDriveRegisterRedirect(
  slug: string | null | undefined,
  driveId?: string | null
): string | null {
  if (!buildCampusDriveDetailPath(slug)) return null
  const id = (driveId || '').trim()
  if (id && !/^[A-Za-z0-9_-]+$/.test(id)) return null
  return resolveSafeAuthRedirect(buildCampusDriveRegisterRedirect(slug!.trim(), id || undefined))
}

/** Detail page for one published drive. Rejects slugs that could change the path. */
export function buildCampusDriveDetailPath(slug: string | null | undefined): string | null {
  const value = (slug || '').trim()
  if (!value || value.includes('..') || /[\\/?#]/.test(value)) return null
  return resolveSafeAuthRedirect(`/campus-drives/${encodeURIComponent(value)}`)
}
