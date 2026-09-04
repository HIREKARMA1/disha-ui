"use client"

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { CalendarPlus, CheckCircle2, Send, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { eventRequestService } from '@/services/eventRequestService'
import type { EventRequestStatus } from '@/types/eventRequest'
import { cn } from '@/lib/utils'

const ORG_KINDS = ['Corporate', 'University', 'Organization', 'Other'] as const

const EVENT_TYPES = [
  'Workshop',
  'Webinar',
  'Seminar',
  'Conference',
  'Networking Event',
  'Hackathon',
  'Career / Hiring Event',
  'Other',
] as const

const REQUEST_ID_KEY = 'disha_event_request_id'
const REQUEST_STATUS_KEY = 'disha_event_request_status'

function readSavedRequest(): { id: string; status: EventRequestStatus } | null {
  if (typeof window === 'undefined') return null
  const id = window.localStorage.getItem(REQUEST_ID_KEY)
  if (!id) return null
  const savedStatus = window.localStorage.getItem(REQUEST_STATUS_KEY)
  const status: EventRequestStatus =
    savedStatus === 'approved' ||
    savedStatus === 'rejected' ||
    savedStatus === 'converted' ||
    savedStatus === 'pending'
      ? savedStatus
      : 'pending'
  return { id, status }
}

function writeSavedRequest(id: string, status: EventRequestStatus) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REQUEST_ID_KEY, id)
  window.localStorage.setItem(REQUEST_STATUS_KEY, status)
}

type FormState = {
  name: string
  orgKind: string
  customOrgKind: string
  organizationName: string
  eventType: string
  customEventType: string
  phone: string
  email: string
  concept: string
}

const EMPTY_FORM: FormState = {
  name: '',
  orgKind: '',
  customOrgKind: '',
  organizationName: '',
  eventType: '',
  customEventType: '',
  phone: '',
  email: '',
  concept: '',
}

interface EventsCreateEventPanelProps {
  className?: string
  /** Stretch to fill parent (desktop right column). Off on mobile to avoid huge empty gaps. */
  fillHeight?: boolean
}

const labelClass = 'text-xs font-medium text-gray-700 dark:text-gray-300'
const fieldClass =
  'h-9 rounded-xl border-gray-200 bg-gray-50/80 text-sm dark:border-gray-700 dark:bg-gray-800/80'

function RequiredMark() {
  return (
    <span className="ml-0.5 text-red-500" aria-hidden="true">
      *
    </span>
  )
}

function StatusBanner({ status }: { status: EventRequestStatus }) {
  if (status === 'rejected') {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-snug text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
      >
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
        <p>
          Your event request was not approved this time. You’re welcome to refine your idea and
          submit again — we’re happy to help.
        </p>
      </div>
    )
  }

  if (status === 'approved' || status === 'converted') {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-snug text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p>Your event request is approved. We’ll contact you with next steps.</p>
      </div>
    )
  }

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-snug text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <p>Request submitted. Our team will review and contact you with next steps.</p>
    </div>
  )
}

function footerHint(status: EventRequestStatus | null) {
  if (status === 'approved' || status === 'converted') {
    return 'You’re all set — our team will follow up with next steps.'
  }
  if (status === 'rejected') {
    return 'You can update your details and submit a new request anytime.'
  }
  return 'We’ll review your request and contact you with next steps.'
}

export function EventsCreateEventPanel({
  className,
  fillHeight = false,
}: EventsCreateEventPanelProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] = useState<EventRequestStatus | null>(null)

  const refreshStatus = useCallback(async (id: string) => {
    try {
      const result = await eventRequestService.getStatus(id)
      setRequestStatus(result.status)
      writeSavedRequest(id, result.status)
      return result.status
    } catch {
      // Keep whatever status we already have in state / localStorage
      return null
    }
  }, [])

  useEffect(() => {
    const saved = readSavedRequest()
    if (!saved) return
    setRequestId(saved.id)
    setRequestStatus(saved.status)
    void refreshStatus(saved.id)
  }, [refreshStatus])

  useEffect(() => {
    if (!requestId || requestStatus !== 'pending') return
    const timer = window.setInterval(() => {
      void refreshStatus(requestId)
    }, 15000)
    return () => window.clearInterval(timer)
  }, [requestId, requestStatus, refreshStatus])

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setForm(EMPTY_FORM)
  }

  const selectClass = (hasValue: boolean) =>
    cn(
      'flex h-9 w-full rounded-xl border bg-gray-50/80 px-3 text-sm text-gray-900',
      'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'dark:bg-gray-800/80 dark:text-gray-100 dark:ring-offset-gray-900',
      'disabled:cursor-not-allowed disabled:opacity-50',
      hasValue
        ? 'border-gray-200 dark:border-gray-700'
        : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400'
    )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const isOtherOrg = form.orgKind === 'Other'
    const isOtherEvent = form.eventType === 'Other'
    const resolvedOrgKind = isOtherOrg ? form.customOrgKind.trim() : form.orgKind
    const resolvedEventType = isOtherEvent ? form.customEventType.trim() : form.eventType
    const orgName = form.organizationName.trim()

    if (
      !form.name.trim() ||
      !form.orgKind ||
      !orgName ||
      !form.eventType ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.concept.trim()
    ) {
      toast.error('Please fill in all fields before submitting.')
      return
    }

    if (isOtherOrg && !resolvedOrgKind) {
      toast.error('Please specify your organization type.')
      return
    }

    if (isOtherEvent && !resolvedEventType) {
      toast.error('Please specify your event type.')
      return
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      toast.error('Contact number must be exactly 10 digits.')
      return
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    if (!emailOk) {
      toast.error('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const created = await eventRequestService.submit({
        name: form.name.trim(),
        organization: `${resolvedOrgKind} — ${orgName}`,
        event_type: resolvedEventType,
        phone: form.phone.trim(),
        email: form.email.trim(),
        concept: form.concept.trim(),
      })
      toast.success('Request submitted. Our team will review and get in touch.')
      setForm(EMPTY_FORM)
      const nextStatus: EventRequestStatus = created.status || 'pending'
      setRequestId(created.id)
      setRequestStatus(nextStatus)
      writeSavedRequest(created.id, nextStatus)
    } catch {
      toast.error('Could not submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-[20px]',
        'border border-gray-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
        'dark:border-gray-700/80 dark:bg-gray-900/95',
        fillHeight && 'h-full min-h-0',
        className
      )}
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-sm">
          <CalendarPlus className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-bold leading-snug tracking-tight text-gray-900 dark:text-white">
            Want to Create an Event?
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Tell us your idea — we’ll help get it live on Disha.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex flex-col',
          fillHeight ? 'min-h-0 flex-1 overflow-hidden' : 'overflow-visible'
        )}
      >
        <div
          className={cn(
            'space-y-3 px-5 py-4',
            fillHeight && 'min-h-0 flex-1 overflow-y-auto overscroll-y-contain'
          )}
        >
          {requestStatus ? <StatusBanner status={requestStatus} /> : null}

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            All fields marked <span className="font-semibold text-red-500">*</span> are mandatory.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="create-event-name" className={labelClass}>
                Your Name
                <RequiredMark />
              </Label>
              <Input
                id="create-event-name"
                value={form.name}
                onChange={(e) => {
                  const next = e.target.value
                    .replace(/[^A-Za-z\s]/g, '')
                    .slice(0, 40)
                  update('name', next)
                }}
                placeholder="Full name"
                className={fieldClass}
                autoComplete="name"
                maxLength={40}
                pattern="[A-Za-z\s]+"
                title="Letters and spaces only"
                disabled={submitting}
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-event-org-kind" className={labelClass}>
                Org Type
                <RequiredMark />
              </Label>
              <select
                id="create-event-org-kind"
                value={form.orgKind}
                onChange={(e) => {
                  const next = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    orgKind: next,
                    customOrgKind: next === 'Other' ? prev.customOrgKind : '',
                  }))
                }}
                disabled={submitting}
                className={selectClass(Boolean(form.orgKind))}
                required
                aria-required="true"
              >
                <option value="" disabled>
                  Select type
                </option>
                {ORG_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.orgKind === 'Other' ? (
            <div className="space-y-1">
              <Label htmlFor="create-event-org-kind-custom" className={labelClass}>
                Specify Org Type
                <RequiredMark />
              </Label>
              <Input
                id="create-event-org-kind-custom"
                value={form.customOrgKind}
                onChange={(e) => update('customOrgKind', e.target.value)}
                placeholder="Custom org type"
                className={fieldClass}
                disabled={submitting}
                maxLength={100}
                required
                aria-required="true"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="create-event-org-name" className={labelClass}>
                Organization Name
                <RequiredMark />
              </Label>
              <Input
                id="create-event-org-name"
                value={form.organizationName}
                onChange={(e) => update('organizationName', e.target.value)}
                placeholder="Org name"
                className={fieldClass}
                autoComplete="organization"
                disabled={submitting}
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-event-type" className={labelClass}>
                Event Type
                <RequiredMark />
              </Label>
              <select
                id="create-event-type"
                value={form.eventType}
                onChange={(e) => {
                  const next = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    eventType: next,
                    customEventType: next === 'Other' ? prev.customEventType : '',
                  }))
                }}
                disabled={submitting}
                className={selectClass(Boolean(form.eventType))}
                required
                aria-required="true"
              >
                <option value="" disabled>
                  Select type
                </option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.eventType === 'Other' ? (
            <div className="space-y-1">
              <Label htmlFor="create-event-type-custom" className={labelClass}>
                Specify Event Type
                <RequiredMark />
              </Label>
              <Input
                id="create-event-type-custom"
                value={form.customEventType}
                onChange={(e) => update('customEventType', e.target.value)}
                placeholder="Custom event type"
                className={fieldClass}
                disabled={submitting}
                maxLength={100}
                required
                aria-required="true"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="create-event-phone" className={labelClass}>
                Contact Number
                <RequiredMark />
              </Label>
              <Input
                id="create-event-phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="10-digit mobile"
                className={fieldClass}
                autoComplete="tel"
                disabled={submitting}
                maxLength={10}
                required
                aria-required="true"
                pattern="\d{10}"
                title="Enter a valid 10-digit mobile number"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="create-event-email" className={labelClass}>
                Email Address
                <RequiredMark />
              </Label>
              <Input
                id="create-event-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="Email"
                className={fieldClass}
                autoComplete="email"
                disabled={submitting}
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="space-y-1 pb-1">
            <Label htmlFor="create-event-concept" className={labelClass}>
              Short Event Concept
              <RequiredMark />
            </Label>
            <Textarea
              id="create-event-concept"
              value={form.concept}
              onChange={(e) => update('concept', e.target.value)}
              placeholder="Event idea and audience"
              rows={3}
              disabled={submitting}
              required
              aria-required="true"
              className="min-h-[88px] resize-none rounded-xl border-gray-200 bg-gray-50/80 text-sm dark:border-gray-700 dark:bg-gray-800/80"
            />
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900/95">
          <div className="flex min-w-0 flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={handleCancel}
              className="h-10 w-full min-w-0 rounded-xl border-primary-200 text-sm font-semibold text-primary-600 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-900/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="h-10 w-full min-w-0 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-sm font-semibold hover:from-primary-600 hover:to-secondary-600"
            >
              <Send className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {submitting
                  ? 'Submitting…'
                  : requestStatus === 'approved' ||
                      requestStatus === 'rejected' ||
                      requestStatus === 'converted'
                    ? 'Submit Another Request'
                    : 'Submit Event Request'}
              </span>
            </Button>
          </div>
          <p className="text-center text-[11px] leading-snug text-gray-500 dark:text-gray-400">
            {footerHint(requestStatus)}
          </p>
        </div>
      </form>
    </article>
  )
}
