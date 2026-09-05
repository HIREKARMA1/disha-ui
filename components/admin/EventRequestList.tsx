"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Inbox,
  Loader2,
  Plus,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'
import { eventRequestService } from '@/services/eventRequestService'
import type { EventRequest, EventRequestStatus } from '@/types/eventRequest'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { value: 'all' | EventRequestStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
]

function statusStyles(status: EventRequestStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
    case 'approved':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    case 'converted':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function EventRequestList() {
  const [requests, setRequests] = useState<EventRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | EventRequestStatus>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const result = await eventRequestService.listAdmin({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      })
      setRequests(result.event_requests)
      setTotal(result.total_count)
    } catch (err: unknown) {
      const status =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { status?: number } }).response?.status === 'number'
          ? (err as { response: { status: number } }).response.status
          : undefined
      if (status === 401 || status === 403) {
        toast.error('Admin login required to view event requests')
      } else {
        toast.error('Failed to load event requests')
      }
      setRequests([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const setNote = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }))
  }

  const handleApprove = async (item: EventRequest) => {
    setBusyId(item.id)
    try {
      const updated = await eventRequestService.approve(item.id, notes[item.id])
      setRequests((prev) => prev.map((r) => (r.id === item.id ? updated : r)))
      toast.success('Request approved')
      if (statusFilter === 'pending') {
        setRequests((prev) => prev.filter((r) => r.id !== item.id))
        setTotal((t) => Math.max(0, t - 1))
      }
    } catch {
      toast.error('Failed to approve request')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (item: EventRequest) => {
    setBusyId(item.id)
    try {
      const updated = await eventRequestService.reject(item.id, notes[item.id])
      setRequests((prev) => prev.map((r) => (r.id === item.id ? updated : r)))
      toast.success('Request rejected')
      if (statusFilter === 'pending') {
        setRequests((prev) => prev.filter((r) => r.id !== item.id))
        setTotal((t) => Math.max(0, t - 1))
      }
    } catch {
      toast.error('Failed to reject request')
    } finally {
      setBusyId(null)
    }
  }

  const createHref = (item: EventRequest) => {
    const params = new URLSearchParams({
      from_request: item.id,
      title: `${item.event_type} — ${item.organization}`,
      organizer_name: item.organization,
      organizer_email: item.email,
      organizer_phone: item.phone,
      short_description: item.concept.slice(0, 280),
    })
    return `/dashboard/admin/events/create?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <EventManagementSubNav />

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Inbox className="h-5 w-5 text-primary-500" />
              Event Requests
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review Create-an-Event submissions from the public Events portal.
              {loading ? '' : ` Showing ${requests.length} of ${total}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  statusFilter === opt.value
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading requests…
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-14 text-center dark:border-gray-700">
              <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-medium text-gray-700 dark:text-gray-200">No requests here</p>
              <p className="mt-1 text-sm text-gray-500">
                New submissions from /events will appear under Pending.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((item) => {
                const busy = busyId === item.id
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.organization}
                          </h3>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                              statusStyles(item.status)
                            )}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {item.event_type} · {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Requester
                        </dt>
                        <dd className="mt-0.5 text-gray-800 dark:text-gray-200">{item.requester_name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Contact
                        </dt>
                        <dd className="mt-0.5 text-gray-800 dark:text-gray-200">
                          <a className="text-primary-600 hover:underline" href={`mailto:${item.email}`}>
                            {item.email}
                          </a>
                          <span className="text-gray-400"> · </span>
                          <a className="text-primary-600 hover:underline" href={`tel:${item.phone}`}>
                            {item.phone}
                          </a>
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Concept
                        </dt>
                        <dd className="mt-0.5 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {item.concept}
                        </dd>
                      </div>
                      {item.admin_note ? (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Admin note
                          </dt>
                          <dd className="mt-0.5 text-gray-700 dark:text-gray-300">{item.admin_note}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {(item.status === 'pending' || item.status === 'approved') && (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                        {item.status === 'pending' && (
                          <Textarea
                            value={notes[item.id] || ''}
                            onChange={(e) => setNote(item.id, e.target.value)}
                            placeholder="Optional note for approve / reject…"
                            rows={2}
                            className="rounded-xl text-sm"
                            disabled={busy}
                          />
                        )}
                        <div className="flex flex-wrap gap-2">
                          {item.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => handleApprove(item)}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                              >
                                {busy ? (
                                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => handleReject(item)}
                                className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300"
                              >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Link href={createHref(item)}>
                            <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500">
                              <Plus className="mr-1.5 h-4 w-4" />
                              Create Event
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
