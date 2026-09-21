'use client'

import { useEffect, useState } from 'react'
import { ProfileCompletionModal } from '@/components/ui/ProfileCompletionModal'
import {
  hideProfileCompletionDialog,
  subscribeProfileCompletionDialog,
} from '@/lib/profileCompletionDialogStore'

/** Root-level host so imperative `showProfileCompletionDialog()` works anywhere. */
export function ProfileCompletionModalHost() {
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeProfileCompletionDialog(setOpen), [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideProfileCompletionDialog()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <ProfileCompletionModal isOpen={open} onClose={hideProfileCompletionDialog} />
  )
}
