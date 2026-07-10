"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ContestEventListItem } from '@/types/contestEvent'

interface PostponeEventDialogProps {
  isOpen: boolean
  event: ContestEventListItem | null
  onClose: () => void
  onConfirm: (data: {
    event_start_date: string
    event_end_date?: string
    registration_end_date?: string
    reason: string
  }) => Promise<void>
}

function toLocalInput(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function PostponeEventDialog({ isOpen, event, onClose, onConfirm }: PostponeEventDialogProps) {
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [regEnd, setRegEnd] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && event) {
      setEventStart(toLocalInput(event.event_start_date))
      setEventEnd(toLocalInput(event.event_end_date))
      setRegEnd(toLocalInput(event.registration_end_date))
      setReason('')
    }
  }, [isOpen, event])

  if (!isOpen || !event) return null

  const handleConfirm = async () => {
    if (!eventStart || reason.trim().length < 3) return
    setLoading(true)
    try {
      await onConfirm({
        event_start_date: new Date(eventStart).toISOString(),
        event_end_date: eventEnd ? new Date(eventEnd).toISOString() : undefined,
        registration_end_date: regEnd ? new Date(regEnd).toISOString() : undefined,
        reason: reason.trim(),
      })
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Postpone Event</h3>
          <p className="mt-1 text-sm text-gray-500">Update dates for &quot;{event.title}&quot;</p>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="event-start">New Event Date *</Label>
              <Input id="event-start" type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="event-end">New Event End Date</Label>
              <Input id="event-end" type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="reg-end">Registration End Date</Label>
              <Input id="reg-end" type="datetime-local" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="postpone-reason">Reason for Postponement *</Label>
              <Textarea
                id="postpone-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this event is being postponed..."
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Back</Button>
            <Button onClick={handleConfirm} disabled={loading || !eventStart || reason.trim().length < 3}>
              {loading ? 'Saving...' : 'Postpone Event'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
