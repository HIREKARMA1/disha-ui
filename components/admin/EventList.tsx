"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Loader2, Calendar, Activity, Megaphone, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, CalendarDays,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { EVENT_CATEGORIES } from '@/types/contestEvent'
import { CancelEventDialog } from '@/components/admin/CancelEventDialog'
import { PostponeEventDialog } from '@/components/admin/PostponeEventDialog'
import { AdminEventCard } from '@/components/admin/AdminEventCard'
import { EventManagementHero, EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const PAGE_LIMIT = 20
const MAX_LIMIT = 100

interface EventStats {
  total: number
  upcoming: number
  live: number
  completed: number
  cancelled: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string
  value: number
  icon: React.ElementType
  gradient: string
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800"
    >
      <div className={cn('h-1 bg-gradient-to-r', gradient)} />
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={cn('rounded-xl bg-gradient-to-br p-2.5 shadow-sm', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-600 dark:bg-gray-800/50">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30">
        <CalendarDays className="h-10 w-10 text-primary-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">No events yet</h3>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        Create your first contest, hackathon, or placement drive to start engaging students and partners.
      </p>
      <Link href="/dashboard/admin/events/create" className="mt-6">
        <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </Link>
    </div>
  )
}

export function EventList() {
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [stats, setStats] = useState<EventStats>({ total: 0, upcoming: 0, live: 0, completed: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
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

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const countFor = (status?: string) =>
        contestEventService.listAdminEvents({
          page: 1,
          limit: 1,
          ...(status ? { status } : {}),
        })

      const [totalRes, upcomingRes, liveRes, closedRes, archivedRes, cancelledRes] = await Promise.all([
        countFor(),
        countFor('upcoming'),
        countFor('live'),
        countFor('closed'),
        countFor('archived'),
        countFor('cancelled'),
      ])

      setStats({
        total: totalRes.total_count,
        upcoming: upcomingRes.total_count,
        live: liveRes.total_count,
        completed: closedRes.total_count + archivedRes.total_count,
        cancelled: cancelledRes.total_count,
      })
    } catch {
      setStats({ total: 0, upcoming: 0, live: 0, completed: 0, cancelled: 0 })
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const result = await contestEventService.listAdminEvents({
        page,
        limit: Math.min(PAGE_LIMIT, MAX_LIMIT),
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
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string | unknown } } })?.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : 'Failed to load events'
      toast.error(msg)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [search, filters, sortBy])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchEvents(1) }, [fetchEvents])

  const refreshAll = () => {
    fetchEvents(pagination.page)
    fetchStats()
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
          } else {
            return
          }
          break
        case 'export': {
          const blob = await contestEventService.exportRegistrations(eventId)
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `registrations-${eventId}.csv`
          a.click()
          break
        }
      }
      refreshAll()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const statCards = useMemo(() => [
    { label: 'Total Events', value: stats.total, icon: Calendar, gradient: 'from-primary-500 to-secondary-500' },
    { label: 'Upcoming', value: stats.upcoming, icon: Activity, gradient: 'from-primary-400 to-primary-600' },
    { label: 'Live', value: stats.live, icon: Megaphone, gradient: 'from-secondary-400 to-secondary-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, gradient: 'from-gray-500 to-gray-600' },
    { label: 'Cancelled', value: stats.cancelled, icon: AlertCircle, gradient: 'from-accent-red-500 to-accent-red-600' },
  ], [stats])

  return (
    <div className="space-y-6">
      <EventManagementHero />
      <EventManagementSubNav />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {statCards.map((card) => (
          statsLoading ? (
            <div key={card.label} className="h-[88px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ) : (
            <StatCard key={card.label} {...card} />
          )
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Select value={filters.publication_status} onValueChange={(v) => setFilters((f) => ({ ...f, publication_status: v }))}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.registration} onValueChange={(v) => setFilters((f) => ({ ...f, registration: v }))}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Registration" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Registration</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-44 text-sm"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="event_start_date">Event Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Event cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <AdminEventCard
              key={event.id}
              event={event}
              actionLoading={actionLoading}
              onAction={handleAction}
              onCancel={setCancelTarget}
              onPostpone={setPostponeTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row dark:border-gray-700 dark:bg-gray-800">
          <span className="text-sm text-gray-500">
            {pagination.total_count} events · Page {pagination.page} of {pagination.total_pages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={() => fetchEvents(pagination.page - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => fetchEvents(pagination.page + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
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
