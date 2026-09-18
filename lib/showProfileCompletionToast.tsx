'use client'

import { showProfileCompletionDialog } from '@/lib/profileCompletionDialogStore'

/**
 * Opens the profile-completion dialog (no timeout).
 * Kept as `showProfileCompletionToast` so existing apply call sites keep working.
 */
export function showProfileCompletionToast() {
  showProfileCompletionDialog()
}

export { showProfileCompletionDialog }
