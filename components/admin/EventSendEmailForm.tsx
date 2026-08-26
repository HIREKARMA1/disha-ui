"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Plus, Send, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/dashboard/admin/bulk-email/RichTextEditor'
import { contestEventService } from '@/services/contestEventService'
import { getErrorMessage } from '@/lib/error-handler'
import type { ContestEventDetail, EventEmailRecipientType } from '@/types/contestEvent'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RECIPIENT_OPTIONS: { value: EventEmailRecipientType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'all', label: 'All' },
  { value: 'registered', label: 'Registered Candidates' },
  { value: 'students', label: 'Students' },
  { value: 'university', label: 'University' },
  { value: 'corporate', label: 'Corporate' },
]

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim())
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

interface EventSendEmailFormProps {
  eventId: string
}

export function EventSendEmailForm({ eventId }: EventSendEmailFormProps) {
  const router = useRouter()
  const [event, setEvent] = useState<ContestEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [recipientType, setRecipientType] = useState<EventEmailRecipientType>('none')
  const [groupCount, setGroupCount] = useState(0)
  const [loadingCount, setLoadingCount] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [manualEmails, setManualEmails] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const uniqueManuals = useMemo(() => {
    const seen = new Set<string>()
    return manualEmails.filter((email) => {
      const key = normalizeEmail(email)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [manualEmails])

  const recipientCount = groupCount + uniqueManuals.length

  useEffect(() => {
    contestEventService
      .getAdminEvent(eventId)
      .then(setEvent)
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false))
  }, [eventId])

  const fetchGroupCount = useCallback(
    async (type: EventEmailRecipientType) => {
      if (type === 'none') {
        setGroupCount(0)
        setLoadingCount(false)
        return
      }
      setLoadingCount(true)
      try {
        const result = await contestEventService.getEventEmailRecipients(eventId, type)
        setGroupCount(result.count)
      } catch (error) {
        toast.error(getErrorMessage(error))
        setGroupCount(0)
      } finally {
        setLoadingCount(false)
      }
    },
    [eventId]
  )

  useEffect(() => {
    void fetchGroupCount(recipientType)
  }, [recipientType, fetchGroupCount])

  const handleAddEmail = () => {
    const trimmed = manualEmail.trim()
    if (!trimmed) {
      toast.error('Please enter an email address')
      return
    }
    if (!isValidEmail(trimmed)) {
      toast.error('Please enter a valid email address')
      return
    }
    const normalized = normalizeEmail(trimmed)
    if (uniqueManuals.some((email) => normalizeEmail(email) === normalized)) {
      toast.error('This email is already in the recipient list')
      return
    }
    setManualEmails((current) => [...current, trimmed])
    setManualEmail('')
  }

  const handleRemoveEmail = (email: string) => {
    const normalized = normalizeEmail(email)
    setManualEmails((current) => current.filter((item) => normalizeEmail(item) !== normalized))
  }

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!stripHtml(body)) {
      toast.error('Email body is required')
      return
    }
    if (recipientCount === 0) {
      toast.error(
        recipientType === 'none'
          ? 'Please select recipients or add at least one email address.'
          : 'Please select at least one recipient.'
      )
      return
    }

    setSending(true)
    const toastId = toast.loading(
      `Sending email to ${recipientCount} recipient${recipientCount === 1 ? '' : 's'}...`
    )
    try {
      const result = await contestEventService.sendEventEmail(eventId, {
        recipient_type: recipientType,
        manual_emails: uniqueManuals,
        subject: subject.trim(),
        body,
      })
      if (!result.success) {
        toast.error(result.error || result.message || 'Failed to send email', { id: toastId })
        return
      }
      toast.success(result.message, { id: toastId })
      router.push('/dashboard/admin/events')
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Event</Label>
          <Input value={event?.title || ''} readOnly />
        </div>

        <div className="space-y-2">
          <Label>Recipients</Label>
          <Select
            value={recipientType}
            onValueChange={(value) => setRecipientType(value as EventEmailRecipientType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipients" />
            </SelectTrigger>
            <SelectContent>
              {RECIPIENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-manual-email">Manual Recipients</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="event-manual-email"
              type="email"
              placeholder="Enter email address"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddEmail()
                }
              }}
            />
            <Button type="button" onClick={handleAddEmail} className="shrink-0">
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {uniqueManuals.length > 0 && (
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {uniqueManuals.map((email) => (
                <div key={email} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="truncate">{email}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                    onClick={() => handleRemoveEmail(email)}
                    aria-label={`Remove ${email}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recipient Count: {loadingCount ? '…' : recipientCount}
        </p>

        <div className="space-y-2">
          <Label htmlFor="event-email-subject">Subject</Label>
          <Input
            id="event-email-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Write the email message…"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/events')}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
            Send Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
