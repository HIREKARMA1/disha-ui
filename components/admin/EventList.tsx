"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Eye, Edit, Trash2, BarChart3, Download,
  Archive, Lock, Loader2, Users, Copy, Pause, XCircle, Megaphone,
  Calendar, CheckCircle2, AlertCircle, Activity
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

const pubBadge: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

function formatDate(iso?: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={cn('p-2.5 rounded-lg', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export function EventList() {
  const router = useRouter()
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [allEvents, setAllEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    publication_status: 'all',
    status: 'all',
    category: 'all',
    registration: 'all',
  })
  const [sortBy, setSortBy] = useState('created_at')
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total_count: 0, has_next: false, has_prev: false })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ContestEventListItem | null>(null)
  const [postponeTarget, setPostponeTarget] = useState<ContestEventListItem | null>(null)

  useEffect(() => {
    contestEventService.listAdminEvents({ limit: 500, page: 1 })
      .then((r) => setAllEvents(r.events))
      .catch(() => setAllEvents([]))
  }, [])

  const stats = useMemo(() => ({
    total: allEvents.length,
    upcoming: allEvents.filter(e => e.contest_status === 'upcoming').length,
    ongoing: allEvents.filter(e => e.contest_status === 'live').length,
    completed: allEvents.filter(e => ['closed', 'archived'].includes(e.contest_status)).length,
    cancelled: allEvents.filter(e => e.contest_status === 'cancelled' || e.is_cancelled).length,
  }), [allEvents])

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
        registration_open: filters.registration === 'open' ? true : filters.registration === 'closed' ? false : undefined,
        sort_by: sortBy,
        sort_order: 'desc',
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
  }, [search, filters, sortBy])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const refreshAll = () => {
    fetchEvents(pagination.page)
    contestEventService.listAdminEvents({ limit: 500, page: 1 }).then(r => setAllEvents(r.events)).catch(() => {})
  }

  const handleAction = async (eventId: string, action: string) => {
    setActionLoading(`${eventId}-${action}`)
    try {
      switch (action) {
        case 'publish': await contestEventService.publishEvent(eventId); toast.success('Event published'); break
        case 'unpublish': await contestEventService.unpublishEvent(eventId); toast.success('Event unpublished'); break
        case 'archive': await contestEventService.archiveEvent(eventId); toast.success('Event archived'); break
        case 'duplicate': await contestEventService.duplicateEvent(eventId); toast.success('Event duplicated'); break
        case 'delete':
          if (confirm('Delete this event? Registrations will be preserved.')) {
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
      refreshAll()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage contests, drives, and workshops</p>
        </div>
        <Link href="/dashboard/admin/events/create">
          <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Create Event</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Events" value={stats.total} icon={Calendar} color="bg-primary-500" />
        <StatCard label="Upcoming" value={stats.upcoming} icon={Activity} color="bg-blue-500" />
        <StatCard label="Ongoing" value={stats.ongoing} icon={Megaphone} color="bg-emerald-500" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-gray-500" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={AlertCircle} color="bg-red-500" />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={filters.publication_status} onValueChange={(v) => setFilters(f => ({ ...f, publication_status: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Event Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters(f => ({ ...f, category: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.registration} onValueChange={(v) => setFilters(f => ({ ...f, registration: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Registration" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Registration</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end mt-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="event_start_date">Event Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">No events found.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Banner</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Logo</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400 min-w-[160px]">Event Name</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Registration</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Event Date</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Organizer</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Participants</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Created By</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-3 py-2">
                      {event.banner_url ? (
                        <img src={event.banner_url} alt="" className="w-14 h-9 rounded-md object-cover ring-1 ring-gray-200 dark:ring-gray-700" />
                      ) : (
                        <div className="w-14 h-9 rounded-md bg-gradient-to-br from-primary-400 to-secondary-400" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {event.organizer_logo_url ? (
                        <img src={event.organizer_logo_url} alt="" className="w-8 h-8 rounded-md object-contain bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 p-0.5" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug max-w-[200px]">{event.title}</p>
                      {event.category && <p className="text-[10px] text-gray-500 mt-0.5">{CATEGORY_LABELS[event.category]}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <Badge className={cn('text-[10px] w-fit px-1.5 py-0', pubBadge[event.publication_status || 'draft'])}>
                          {event.publication_status}
                        </Badge>
                        <Badge className="text-[10px] w-fit px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {CONTEST_STATUS_LABELS[event.contest_status] || event.contest_status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={cn('text-[10px] px-1.5 py-0', event.registration_is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                        {event.registration_is_open ? 'Open' : 'Closed'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(event.event_start_date)}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[100px] truncate">{event.organizer_name || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.participant_count}</span>
                    </td>
                    <td className="px-3 py-2 capitalize text-gray-500">{event.created_by_user_type || 'admin'}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        {event.slug && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild title="View">
                            <Link href={`/events/${event.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /></Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit" onClick={() => router.push(`/dashboard/admin/events/${event.id}/edit`)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        {event.publication_status !== 'published' ? (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Publish" onClick={() => handleAction(event.id, 'publish')}>
                            <Megaphone className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Unpublish" onClick={() => handleAction(event.id, 'unpublish')}>
                            <Lock className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {!event.is_cancelled && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Postpone" onClick={() => setPostponeTarget(event)}>
                              <Pause className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Cancel" onClick={() => setCancelTarget(event)}>
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Analytics" onClick={() => router.push(`/dashboard/admin/events/${event.id}/analytics`)}>
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Delete" onClick={() => handleAction(event.id, 'delete')}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
              <span>{pagination.total_count} events · Page {pagination.page}/{pagination.total_pages}</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={!pagination.has_prev} onClick={() => fetchEvents(pagination.page - 1)}>Prev</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={!pagination.has_next} onClick={() => fetchEvents(pagination.page + 1)}>Next</Button>
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
          refreshAll()
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
          refreshAll()
        }}
      />
    </div>
  )
}
