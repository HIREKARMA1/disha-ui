"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Eye, Edit, Trash2, BarChart3, Download,
  Globe, Archive, Lock, Loader2, Users, Copy, Pause, XCircle, Megaphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { CONTEST_STATUS_LABELS, CATEGORY_LABELS, EVENT_CATEGORIES } from '@/types/contestEvent'
import { CancelEventDialog } from '@/components/admin/CancelEventDialog'
import { PostponeEventDialog } from '@/components/admin/PostponeEventDialog'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const statusBadge: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

function formatDate(iso?: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function EventList() {
  const router = useRouter()
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    publication_status: 'all',
    status: 'all',
    category: 'all',
    visibility: 'all',
  })
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total_count: 0, has_next: false, has_prev: false })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ContestEventListItem | null>(null)
  const [postponeTarget, setPostponeTarget] = useState<ContestEventListItem | null>(null)

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const result = await contestEventService.listAdminEvents({
        page,
        limit: 10,
        search: search || undefined,
        publication_status: filters.publication_status !== 'all' ? filters.publication_status : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        visibility: filters.visibility !== 'all' ? filters.visibility : undefined,
      })
      setEvents(result.events)
      setPagination({
        page: result.page,
        total_pages: result.total_pages,
        total_count: result.total_count,
        has_next: result.has_next,
        has_prev: result.has_prev,
      })
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [search, filters])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleAction = async (eventId: string, action: string) => {
    setActionLoading(`${eventId}-${action}`)
    try {
      switch (action) {
        case 'publish': await contestEventService.publishEvent(eventId); toast.success('Event published'); break
        case 'unpublish': await contestEventService.unpublishEvent(eventId); toast.success('Event unpublished'); break
        case 'close': await contestEventService.closeEvent(eventId); toast.success('Event closed'); break
        case 'archive': await contestEventService.archiveEvent(eventId); toast.success('Event archived'); break
        case 'open_reg': await contestEventService.openRegistration(eventId); toast.success('Registration opened'); break
        case 'close_reg': await contestEventService.closeRegistration(eventId); toast.success('Registration closed'); break
        case 'duplicate':
          await contestEventService.duplicateEvent(eventId)
          toast.success('Event duplicated as draft')
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this event? Registrations will be preserved.')) {
            await contestEventService.deleteEvent(eventId)
            toast.success('Event deleted')
          }
          break
        case 'export':
          const blob = await contestEventService.exportRegistrations(eventId)
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `registrations-${eventId}.csv`
          a.click()
          break
      }
      fetchEvents(pagination.page)
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pagination.total_count} events total</p>
        </div>
        <Link href="/dashboard/admin/events/create">
          <Button><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filters.publication_status} onValueChange={(v) => setFilters(f => ({ ...f, publication_status: v }))}>
            <SelectTrigger><SelectValue placeholder="Publication" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Publication</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue placeholder="Event Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No events found. Create your first event!</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Banner</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Event Name</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Organizer</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Registration</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Participants</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Reg. Deadline</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Event Date</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Visibility</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Created By</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Updated</th>
                  <th className="text-right px-3 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-3 py-3">
                      {event.banner_url ? (
                        <img src={event.banner_url} alt="" className="w-12 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-8 rounded bg-gray-200 dark:bg-gray-700" />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[180px]">{event.title}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{event.category ? CATEGORY_LABELS[event.category] : '-'}</td>
                    <td className="px-3 py-3 text-gray-600 max-w-[120px] truncate">{event.organizer_name || '-'}</td>
                    <td className="px-3 py-3 capitalize text-gray-600">{event.mode || '-'}</td>
                    <td className="px-3 py-3">
                      <Badge className={cn('text-xs', event.registration_is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                        {event.registration_is_open ? 'Open' : 'Closed'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge className={cn('text-xs w-fit', statusBadge[event.publication_status || 'draft'])}>
                          {event.publication_status}
                        </Badge>
                        <Badge className="text-xs w-fit bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-gray-600"><Users className="w-3.5 h-3.5" /> {event.participant_count}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(event.registration_end_date)}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(event.event_start_date)}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{(event.visibility_labels || []).join(', ') || '-'}</td>
                    <td className="px-3 py-3 capitalize text-gray-600">{event.created_by_user_type || 'admin'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(event.updated_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-0.5 flex-wrap max-w-[220px]">
                        {event.slug && (
                          <Button variant="ghost" size="sm" asChild title="View">
                            <Link href={`/events/${event.slug}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Edit" onClick={() => router.push(`/dashboard/admin/events/${event.id}/edit`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {event.publication_status !== 'published' ? (
                          <Button variant="ghost" size="sm" title="Publish" disabled={actionLoading === `${event.id}-publish`}
                            onClick={() => handleAction(event.id, 'publish')}>
                            <Megaphone className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" title="Unpublish" disabled={actionLoading === `${event.id}-unpublish`}
                            onClick={() => handleAction(event.id, 'unpublish')}>
                            <Lock className="w-4 h-4" />
                          </Button>
                        )}
                        {!event.is_cancelled && (
                          <Button variant="ghost" size="sm" title="Postpone" onClick={() => setPostponeTarget(event)}>
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {!event.is_cancelled && (
                          <Button variant="ghost" size="sm" title="Cancel" onClick={() => setCancelTarget(event)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Archive" onClick={() => handleAction(event.id, 'archive')}>
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Duplicate" onClick={() => handleAction(event.id, 'duplicate')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Analytics" onClick={() => router.push(`/dashboard/admin/events/${event.id}/analytics`)}>
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Registrations" onClick={() => router.push(`/dashboard/admin/events/${event.id}/registrations`)}>
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Export CSV" onClick={() => handleAction(event.id, 'export')}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Delete" className="text-red-500" onClick={() => handleAction(event.id, 'delete')}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.total_pages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={() => fetchEvents(pagination.page - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => fetchEvents(pagination.page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <CancelEventDialog
        isOpen={!!cancelTarget}
        eventTitle={cancelTarget?.title || ''}
        onClose={() => setCancelTarget(null)}
        onConfirm={async (reason) => {
          if (!cancelTarget) return
          await contestEventService.cancelEvent(cancelTarget.id, reason)
          toast.success('Event cancelled')
          fetchEvents(pagination.page)
        }}
      />

      <PostponeEventDialog
        isOpen={!!postponeTarget}
        event={postponeTarget}
        onClose={() => setPostponeTarget(null)}
        onConfirm={async (data) => {
          if (!postponeTarget) return
          await contestEventService.postponeEvent(postponeTarget.id, data)
          toast.success('Event postponed')
          fetchEvents(pagination.page)
        }}
      />
    </div>
  )
}
