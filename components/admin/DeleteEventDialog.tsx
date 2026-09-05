"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteEventDialogProps {
  isOpen: boolean
  eventTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteEventDialog({ isOpen, eventTitle, onClose, onConfirm }: DeleteEventDialogProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={loading ? undefined : onClose} />
        <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Event</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Delete &quot;{eventTitle}&quot;? This cannot be undone. Registrations will be preserved.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Back
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Event'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
