"use client"

import { useState, useEffect, useCallback, useMemo, useRef, useId } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Loader2, Calendar, Activity, Megaphone, CheckCircle2, AlertCircle, ChevronDown,
  ChevronLeft, ChevronRight, CalendarDays,
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

function EventFilterSelect({
  value,
  options,
  onChange,
  label,
  className = 'h-10',
  containerClassName = '',
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  label: string
  className?: string
  containerClassName?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const [open, setOpen] = useState(false)
  const [opensUpward, setOpensUpward] = useState(false)
  const [activeIndex, setActiveIndex] = useState(selectedIndex)

  useEffect(() => {
    if (!open) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const openMenu = () => {
    const rect = rootRef.current?.getBoundingClientRect()
    const menuHeight = Math.min(options.length * 40, 256)
    const spaceBelow = rect ? window.innerHeight - rect.bottom : window.innerHeight
    const spaceAbove = rect?.top ?? 0
    setOpensUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow)
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  const selectOption = (index: number) => {
    const option = options[index]
    if (option) onChange(option.value)
    setActiveIndex(index)
    setOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) openMenu()
      else setActiveIndex((index) => (index + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) openMenu()
      else setActiveIndex((index) => (index - 1 + options.length) % options.length)
    } else if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      selectOption(activeIndex)
    } else if ((event.key === 'Enter' || event.key === ' ') && !open) {
      event.preventDefault()
      openMenu()
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${containerClassName}`}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-left text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
      >
        <span className="truncate">{options[selectedIndex]?.label}</span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-150 dark:text-gray-400 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={listboxId}
        role="listbox"
        aria-label={label}
        className={`absolute z-[60] w-full overflow-y-auto overscroll-contain rounded-md border border-gray-200 bg-white p-1 shadow-lg transition-[opacity,transform,max-height,visibility] duration-200 ease-out dark:border-gray-700 dark:bg-gray-800 ${opensUpward ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'} ${open ? 'visible max-h-64 translate-y-0 scale-100 opacity-100' : `invisible max-h-0 ${opensUpward ? 'translate-y-1' : '-translate-y-1'} scale-[0.98] opacity-0`}`}
      >
        {options.map((option, index) => (
          <button
            id={`${listboxId}-option-${index}`}
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === value}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => selectOption(index)}
            style={{ transitionDelay: open ? `${Math.min(index * 18, 120)}ms` : '0ms' }}
            className={`flex min-h-9 w-full items-center rounded px-2 text-left text-sm transition-[opacity,transform,background-color,color] duration-150 ease-out ${open ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'} ${index === activeIndex ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200' : 'text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'}`}
          >
            <span className="truncate">{option.label}</span>
          </button>
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
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(14rem,2fr)_repeat(5,minmax(0,1fr))]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <EventFilterSelect
            label="Publication status"
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
          <EventFilterSelect
            label="Event status"
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
          <EventFilterSelect
            label="Event category"
            value={filters.category}
            onChange={(value) => setFilters((f) => ({ ...f, category: value }))}
            options={[
              { value: 'all', label: 'All Categories' },
              ...EVENT_CATEGORIES.map((category) => ({ value: category.value, label: category.label })),
            ]}
          />
          <EventFilterSelect
            label="Registration status"
            value={filters.registration}
            onChange={(value) => setFilters((f) => ({ ...f, registration: value }))}
            options={[
              { value: 'all', label: 'All Registration' },
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <EventFilterSelect
            label="Sort events"
            value={sortBy}
            onChange={setSortBy}
            className="h-10"
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
        {loading ? (
          <motion.div
            key="event-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="flex justify-center py-16"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </motion.div>
        ) : events.length === 0 ? (
          <motion.div
            key="event-empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key="event-results"
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut', layout: { duration: 0.24 } }}
            className="space-y-4"
          >
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.18), ease: 'easeOut' }}
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
