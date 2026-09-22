'use client'

/** Session flag: show Quick Account Setup after student registration (not on normal login). */

export const QUICK_ACCOUNT_SETUP_PENDING_KEY = 'disha_quick_account_setup_pending'

/** Call only after successful student register + auto-login. */
export function markQuickAccountSetupPending() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(QUICK_ACCOUNT_SETUP_PENDING_KEY, '1')
  } catch {
    // Ignore private mode / storage failures
  }
}

export function clearQuickAccountSetupPending() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(QUICK_ACCOUNT_SETUP_PENDING_KEY)
  } catch {
    // ignore
  }
}

export function isQuickAccountSetupPending(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(QUICK_ACCOUNT_SETUP_PENDING_KEY) === '1'
  } catch {
    return false
  }
}
