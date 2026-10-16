"use client"

import { useState, useEffect, useCallback, useMemo, useRef, useId } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Loader2, Calendar, Activity, Megaphone, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contestEventService } from '@/services/contestEventService'
import type { ContestEventListItem } from '@/types/contestEvent'
import { EVENT_CATEGORIES } from '@/types/contestEvent'
import { CancelEventDialog } from '@/components/admin/CancelEventDialog'
import { DeleteEventDialog } from '@/components/admin/DeleteEventDialog'
import { PostponeEventDialog } from '@/components/admin/PostponeEventDialog'
import { AdminEventCard } from '@/components/admin/AdminEventCard'
import { EventManagementHero, EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const PAGE_LIMIT = 20
const MAX_LIMIT = 100

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [opensUp, setOpensUp] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  const toggleOpen = () => {
    if (open) {
      setOpen(false)
      return
    }
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const menuHeight = Math.min(256, options.length * 36 + 8)
      const spaceBelow = window.innerHeight - rect.bottom
      setOpensUp(spaceBelow < menuHeight && rect.top > spaceBelow)
    }
    setOpen(true)
  }

  const focusOption = (index: number) => {
    const normalizedIndex = (index + options.length) % options.length
    optionRefs.current[normalizedIndex]?.focus({ preventScroll: true })
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggleOpen}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!open) toggleOpen()
            requestAnimationFrame(() => {
              const selectedIndex = options.findIndex((option) => option.value === value)
              focusOption(selectedIndex >= 0 ? selectedIndex : 0)
            })
          } else if (event.key === 'Escape' && open) {
            event.preventDefault()
            setOpen(false)
          }
        }}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <span className="truncate">{options.find((option) => option.value === value)?.label}</span>
        <ChevronDown aria-hidden="true" className={`ml-2 h-4 w-4 shrink-0 text-gray-500 transition-transform duration-150 ease-out ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={listId}
        role="listbox"
        aria-label={label}
        aria-hidden={!open}
        className={`absolute left-0 z-50 max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg transition-[opacity,transform] duration-150 ease-out dark:border-gray-700 dark:bg-gray-800 ${opensUp ? 'bottom-full origin-bottom mb-1' : 'top-full origin-top mt-1'} ${open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-[0.98] opacity-0'}`}
        style={{ maxHeight: 'min(16rem, 40vh)' }}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            ref={(node) => { optionRefs.current[index] = node }}
            role="option"
            aria-selected={value === option.value}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onChange(option.value)
              setOpen(false)
              triggerRef.current?.focus({ preventScroll: true })
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                focusOption(index + 1)
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                focusOption(index - 1)
              } else if (event.key === 'Home') {
                event.preventDefault()
                focusOption(0)
              } else if (event.key === 'End') {
                event.preventDefault()
                focusOption(options.length - 1)
              } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onChange(option.value)
                setOpen(false)
                triggerRef.current?.focus({ preventScroll: true })
              } else if (event.key === 'Escape') {
                event.preventDefault()
                setOpen(false)
                triggerRef.current?.focus({ preventScroll: true })
              }
            }}
            className={`flex min-h-9 cursor-pointer items-center rounded-sm px-3 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 hover:bg-gray-100 dark:focus:bg-gray-700 dark:hover:bg-gray-700 ${value === option.value ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'}`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}

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
  const [hasLoadedEvents, setHasLoadedEvents] = useState(false)
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
  const [deleteTarget, setDeleteTarget] = useState<ContestEventListItem | null>(null)
  const [postponeTarget, setPostponeTarget] = useState<ContestEventListItem | null>(null)
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const countFor = (status?: string, publication_status?: string) =>
        contestEventService.listAdminEvents({
          page: 1,
          limit: 1,
          ...(status ? { status } : {}),
          ...(publication_status ? { publication_status } : {}),
        })

      const [totalRes, upcomingRes, liveRes, closedRes, archivedRes, cancelledRes] = await Promise.all([
        countFor(),
        countFor('upcoming', 'published'),
        countFor('live', 'published'),
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
      setHasLoadedEvents(true)
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
        case 'open-registration':
          await contestEventService.openRegistration(eventId)
          toast.success('Registration opened')
          break
        case 'close-registration':
          await contestEventService.closeRegistration(eventId)
          toast.success('Registration closed')
          break
        case 'delete': {
          const event = events.find((e) => e.id === eventId)
          if (event) setDeleteTarget(event)
          return
        }
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
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Action failed')
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
          <div className="relative sm:col-span-2 2xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <FilterSelect
            label="Filter by publication status"
            value={filters.publication_status}
            onChange={(value) => setFilters((f) => ({ ...f, publication_status: value }))}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'closed', label: 'Closed' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
          <FilterSelect
            label="Filter by event type"
            value={filters.status}
            onChange={(value) => setFilters((f) => ({ ...f, status: value }))}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'open', label: 'Open' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'live', label: 'Live' },
              { value: 'postponed', label: 'Postponed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <FilterSelect
            label="Filter by category"
            value={filters.category}
            onChange={(value) => setFilters((f) => ({ ...f, category: value }))}
            options={[
              { value: 'all', label: 'All Categories' },
              ...EVENT_CATEGORIES.map((category) => ({ value: category.value, label: category.label })),
            ]}
          />
          <FilterSelect
            label="Filter by registration status"
            value={filters.registration}
            onChange={(value) => setFilters((f) => ({ ...f, registration: value }))}
            options={[
              { value: 'all', label: 'All Registration' },
              { value: 'open', label: 'Registration Open' },
              { value: 'closed', label: 'Registration Closed' },
            ]}
          />
          <FilterSelect
            label="Sort events"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'created_at', label: 'Created Date' },
              { value: 'event_start_date', label: 'Event Date' },
              { value: 'title', label: 'Title' },
            ]}
          />
        </div>
      </div>

      {/* Event cards */}
      <AnimatePresence mode="wait" initial={false}>
        {loading && !hasLoadedEvents ? (
          <motion.div key="initial-event-load" className="flex justify-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </motion.div>
        ) : events.length > 0 ? (
          <motion.div
            key="event-results"
            className="relative"
            animate={{ opacity: loading ? 0.68 : 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-busy={loading}
          >
            {loading && (
              <div className="absolute -top-3 right-2 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs text-gray-500 shadow-sm dark:bg-gray-800/95 dark:text-gray-300" role="status">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                Updating events
              </div>
            )}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.22, delay: Math.min(index * 0.025, 0.2), ease: 'easeOut' } }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' } }}
                  >
                    <AdminEventCard
                      event={event}
                      actionLoading={actionLoading}
                      onAction={handleAction}
                      onCancel={setCancelTarget}
                      onPostpone={setPostponeTarget}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : loading ? (
          <motion.div key="empty-event-load" className="flex justify-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </motion.div>
        ) : (
          <motion.div key="empty-event-results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <EmptyState />
          </motion.div>
        )}
      </AnimatePresence>

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

      <DeleteEventDialog
        isOpen={!!deleteTarget}
        eventTitle={deleteTarget?.title || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          await contestEventService.deleteEvent(deleteTarget.id)
          toast.success('Event deleted')
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
