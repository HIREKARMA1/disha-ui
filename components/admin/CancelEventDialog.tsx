"use client"

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CancelEventDialogProps {
  isOpen: boolean
  eventTitle: string
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

export function CancelEventDialog({ isOpen, eventTitle, onClose, onConfirm }: CancelEventDialogProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (reason.trim().length < 3) return
    setLoading(true)
    try {
      await onConfirm(reason.trim())
      setReason('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Event</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cancel &quot;{eventTitle}&quot;. This will close registration and notify visitors on the public page.
          </p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this event is being cancelled..."
              rows={4}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Back</Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading || reason.trim().length < 3}
            >
              {loading ? 'Cancelling...' : 'Cancel Event'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
