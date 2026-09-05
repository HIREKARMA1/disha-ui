"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Calendar,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Search,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Footer } from '@/components/ui/footer'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { JobCard } from '@/components/dashboard/JobCard'
import { ContestCard } from '@/components/events/EventCard'
import { contestEventService } from '@/services/contestEventService'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { redirectGuestToLoginForApply } from '@/lib/pendingJobApplication'
import {
  DATE_POSTED_OPTIONS,
  JOB_TYPE_OPTIONS,
  toApiDatePosted,
  type DatePostedFilter,
} from '@/components/jobs/JobsFilterFields'
import { PORTAL_CATEGORY_CHIPS } from '@/lib/eventsPortalConfig'
import type { ContestEventListItem } from '@/types/contestEvent'
import { cn } from '@/lib/utils'

const CANDIDATE_PORTAL_URL = 'https://disha.hirekarma.in'

export type OpportunityTab = 'all' | 'jobs' | 'events'

const TABS: { id: OpportunityTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'events', label: 'Events', icon: Calendar },
]

const EVENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'registration_open', label: 'Registration open' },
] as const

const HUB_JOB_TYPES = JOB_TYPE_OPTIONS.filter((o) =>
  ['', 'full_time', 'internship', 'part_time', 'contract'].includes(o.value)
)

const HUB_DATE_OPTIONS = DATE_POSTED_OPTIONS.filter((o) =>
  ['all', '7d', '30d'].includes(o.value)
)

type HubFilters = {
  jobType: string
  remoteWork: string
  datePosted: DatePostedFilter
  eventStatus: string
  eventCategory: string
}

const DEFAULT_FILTERS: HubFilters = {
  jobType: '',
  remoteWork: '',
  datePosted: 'all',
  eventStatus: 'all',
  eventCategory: 'all',
}

/** Minimal job shape for JobCard — mirrors public jobs list fields. */
type HubJob = {
  id: string
  title: string
  description: string
  job_type: string
  status: string
  location: string | string[]
  remote_work: boolean
  travel_required: boolean
  salary_currency: string
  max_applications: number
  current_applications: number
  views_count: number
  applications_count: number
  created_at: string
  is_active: boolean
  can_apply: boolean
  company_name?: string
  corporate_name?: string
  company_logo?: string
  slug?: string | null
  salary_min?: number
  salary_max?: number
  experience_min?: number
  experience_max?: number
  [key: string]: unknown
}

function getDashboardPath(userType?: string) {
  if (!userType) return '/dashboard'
  return `/dashboard/${userType}`
}

function countActiveFilters(filters: HubFilters, tab: OpportunityTab): number {
  let n = 0
  const jobsRelevant = tab === 'all' || tab === 'jobs'
  const eventsRelevant = tab === 'all' || tab === 'events'
  if (jobsRelevant) {
    if (filters.jobType) n += 1
    if (filters.remoteWork) n += 1
    if (filters.datePosted !== 'all') n += 1
  }
  if (eventsRelevant) {
    if (filters.eventStatus !== 'all') n += 1
    if (filters.eventCategory !== 'all') n += 1
  }
  return n
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      )}
    >
      {children}
    </button>
  )
}

function FilterRadioGroup({
  title,
  name,
  options,
  value,
  onChange,
}: {
  title: string
  name: string
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label
            key={opt.value || 'all'}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors',
              value === opt.value
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'border-gray-200 text-gray-700 dark:border-white/10 dark:text-gray-300'
            )}
          >
            <input
              type="radio"
              name={name}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-primary-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

function OpportunityHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md',
        'dark:border-gray-800/80 dark:bg-gray-950/95'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" priority />

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-primary-600 dark:text-primary-400"
          >
            Opportunities
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Jobs
          </Link>
          <Link
            href="/events"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            Events
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          ) : isAuthenticated && user ? (
            <>
              <Link href={getDashboardPath(user.user_type)} className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                >
                  <User className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 md:inline-flex"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Sign in
                </Button>
              </Link>
              <a href={CANDIDATE_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:from-secondary-600 hover:to-primary-600"
                >
                  <span className="hidden sm:inline">Candidate Login</span>
                  <span className="sm:hidden">Login</span>
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5 opacity-80" />
                </Button>
              </a>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function CardSkeleton({ variant }: { variant: 'job' | 'event' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/80 dark:bg-gray-900/90">
      <div
        className={cn(
          'w-full animate-pulse bg-gray-100 dark:bg-gray-800',
          variant === 'event' ? 'aspect-[16/9]' : 'h-2'
        )}
      />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

export default function OpportunityHub() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [tab, setTab] = useState<OpportunityTab>('all')
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<HubFilters>(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState<HubFilters>(DEFAULT_FILTERS)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [jobs, setJobs] = useState<HubJob[]>([])
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, tab),
    [filters, tab]
  )

  const fetchOpportunities = useCallback(
    async (search: string, active: HubFilters) => {
      setLoading(true)
      setError(null)
      try {
        const jobsParams = new URLSearchParams({
          page: '1',
          limit: '12',
          sort_by: 'created_at',
          sort_order: 'desc',
        })
        if (search) jobsParams.set('title', search)
        if (active.jobType) jobsParams.set('job_type', active.jobType)
        if (active.remoteWork) jobsParams.set('remote_work', active.remoteWork)
        const apiDate = toApiDatePosted(active.datePosted)
        if (apiDate) jobsParams.set('date_posted', apiDate)

        const [jobsRes, eventsRes] = await Promise.all([
          apiClient.client.get(`/public/jobs/?${jobsParams.toString()}`),
          contestEventService.listPublicEvents({
            page: 1,
            limit: 12,
            search: search || undefined,
            status: active.eventStatus !== 'all' ? active.eventStatus : undefined,
            category:
              active.eventCategory !== 'all' ? active.eventCategory : undefined,
          }),
        ])

        setJobs((jobsRes.data?.jobs || []) as HubJob[])
        setEvents(eventsRes.events || [])
      } catch {
        setError('Could not load opportunities. Try again or open Jobs / Events.')
        setJobs([])
        setEvents([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    void fetchOpportunities(query, filters)
  }, [fetchOpportunities, query, filters])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    setQuery(searchInput.trim())
  }

  const applyFilters = (next: HubFilters) => {
    setFilters(next)
    setDraftFilters(next)
  }

  const clearFilters = () => {
    applyFilters(DEFAULT_FILTERS)
    setFilterSheetOpen(false)
  }

  const openFilterSheet = () => {
    setDraftFilters(filters)
    setFilterSheetOpen(true)
  }

  const handleJobApply = (job: HubJob) => {
    const path = getJobDetailPath(job)
    if (!isAuthenticated || user?.user_type !== 'student') {
      redirectGuestToLoginForApply(router, job.id, path)
      return
    }
    router.push(path)
  }

  const showJobs = tab === 'all' || tab === 'jobs'
  const showEvents = tab === 'all' || tab === 'events'
  const jobsToShow = tab === 'all' ? jobs.slice(0, 6) : jobs
  const eventsToShow = tab === 'all' ? events.slice(0, 6) : events

  const jobsViewAllHref = useMemo(() => {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (filters.jobType) params.set('job_type', filters.jobType)
    if (filters.remoteWork) params.set('remote_work', filters.remoteWork)
    if (filters.datePosted !== 'all') params.set('date_posted', filters.datePosted)
    const qs = params.toString()
    return qs ? `/jobs?${qs}` : '/jobs'
  }, [query, filters])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <OpportunityHeader />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            HireKarma Disha
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Explore jobs & campus events
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Discover open roles and contests in one place — then apply or register in a few clicks.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jobs, events, companies…"
                className="h-11 rounded-xl border-gray-200 bg-white pl-10 dark:border-gray-700 dark:bg-gray-900"
                aria-label="Search opportunities"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="h-11 flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 hover:from-primary-600 hover:to-secondary-600 sm:flex-none"
              >
                Search
              </Button>
              <div className="lg:hidden">
                <MobileFilterBottomSheet
                  open={filterSheetOpen}
                  onOpenChange={(open) => {
                    if (open) openFilterSheet()
                    else setFilterSheetOpen(false)
                  }}
                  title="Filter opportunities"
                  activeCount={activeFilterCount}
                  onClear={clearFilters}
                  onApply={() => {
                    applyFilters(draftFilters)
                    setFilterSheetOpen(false)
                  }}
                  triggerClassName="h-11 rounded-xl px-3"
                >
                  <div className="space-y-6">
                    {(tab === 'all' || tab === 'jobs') && (
                      <>
                        <FilterRadioGroup
                          title="Job type"
                          name="hub_job_type"
                          options={HUB_JOB_TYPES}
                          value={draftFilters.jobType}
                          onChange={(jobType) =>
                            setDraftFilters((f) => ({ ...f, jobType }))
                          }
                        />
                        <FilterRadioGroup
                          title="Work mode"
                          name="hub_remote"
                          options={[
                            { value: '', label: 'Any' },
                            { value: 'true', label: 'Remote' },
                            { value: 'false', label: 'On-site' },
                          ]}
                          value={draftFilters.remoteWork}
                          onChange={(remoteWork) =>
                            setDraftFilters((f) => ({ ...f, remoteWork }))
                          }
                        />
                        <FilterRadioGroup
                          title="Date posted"
                          name="hub_date"
                          options={HUB_DATE_OPTIONS}
                          value={draftFilters.datePosted}
                          onChange={(datePosted) =>
                            setDraftFilters((f) => ({
                              ...f,
                              datePosted: datePosted as DatePostedFilter,
                            }))
                          }
                        />
                      </>
                    )}
                    {(tab === 'all' || tab === 'events') && (
                      <>
                        <FilterRadioGroup
                          title="Event status"
                          name="hub_event_status"
                          options={EVENT_STATUS_OPTIONS}
                          value={draftFilters.eventStatus}
                          onChange={(eventStatus) =>
                            setDraftFilters((f) => ({ ...f, eventStatus }))
                          }
                        />
                        <FilterRadioGroup
                          title="Event category"
                          name="hub_event_category"
                          options={[
                            { value: 'all', label: 'All categories' },
                            ...PORTAL_CATEGORY_CHIPS.map((c) => ({
                              value: c.value,
                              label: c.label,
                            })),
                          ]}
                          value={draftFilters.eventCategory}
                          onChange={(eventCategory) =>
                            setDraftFilters((f) => ({ ...f, eventCategory }))
                          }
                        />
                      </>
                    )}
                  </div>
                </MobileFilterBottomSheet>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky tabs + desktop quick chips */}
        <div
          className={cn(
            'sticky top-16 z-40 -mx-4 mb-6 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md',
            'dark:border-gray-700 dark:bg-gray-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      'relative flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors',
                      active
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
                    )}
                  </button>
                )
              })}
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="hidden shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 lg:inline-flex"
              >
                <X className="h-3.5 w-3.5" />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Desktop filter chips */}
          <div className="hidden gap-2 overflow-x-auto pb-3 pt-1 lg:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {showJobs && (
              <>
                {HUB_JOB_TYPES.map((opt) => (
                  <Chip
                    key={`jt-${opt.value || 'all'}`}
                    active={filters.jobType === opt.value}
                    onClick={() =>
                      applyFilters({ ...filters, jobType: opt.value })
                    }
                  >
                    {opt.label}
                  </Chip>
                ))}
                <Chip
                  active={filters.remoteWork === 'true'}
                  onClick={() =>
                    applyFilters({
                      ...filters,
                      remoteWork: filters.remoteWork === 'true' ? '' : 'true',
                    })
                  }
                >
                  Remote
                </Chip>
                {HUB_DATE_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                  <Chip
                    key={`dp-${opt.value}`}
                    active={filters.datePosted === opt.value}
                    onClick={() =>
                      applyFilters({
                        ...filters,
                        datePosted:
                          filters.datePosted === opt.value
                            ? 'all'
                            : (opt.value as DatePostedFilter),
                      })
                    }
                  >
                    {opt.label}
                  </Chip>
                ))}
              </>
            )}
            {showEvents && (
              <>
                {EVENT_STATUS_OPTIONS.filter((o) => o.value !== 'all').map((opt) => (
                  <Chip
                    key={`es-${opt.value}`}
                    active={filters.eventStatus === opt.value}
                    onClick={() =>
                      applyFilters({
                        ...filters,
                        eventStatus:
                          filters.eventStatus === opt.value ? 'all' : opt.value,
                      })
                    }
                  >
                    {opt.label}
                  </Chip>
                ))}
                {PORTAL_CATEGORY_CHIPS.slice(0, 5).map((opt) => (
                  <Chip
                    key={`ec-${opt.value}`}
                    active={filters.eventCategory === opt.value}
                    onClick={() =>
                      applyFilters({
                        ...filters,
                        eventCategory:
                          filters.eventCategory === opt.value ? 'all' : opt.value,
                      })
                    }
                  >
                    {opt.label}
                  </Chip>
                ))}
              </>
            )}
          </div>

          {/* Mobile: active filter summary */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between gap-2 pb-2 lg:hidden">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            {showJobs && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={`j-${i}`} variant="job" />
                ))}
              </div>
            )}
            {showEvents && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={`e-${i}`} variant="event" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {showJobs && (
              <section aria-labelledby="hub-jobs-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    id="hub-jobs-heading"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Jobs
                    <span className="ml-2 font-normal text-gray-500">
                      ({jobsToShow.length}
                      {tab === 'all' && jobs.length > jobsToShow.length ? '+' : ''})
                    </span>
                  </h2>
                  <Link
                    href={jobsViewAllHref}
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    View all
                  </Link>
                </div>
                {jobsToShow.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No jobs match your filters.{' '}
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      Clear filters
                    </button>
                    {' · '}
                    <Link href="/jobs" className="font-medium text-primary-600 hover:underline">
                      Browse all jobs
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {jobsToShow.map((job, index) => (
                      <JobCard
                        key={job.id}
                        job={job as Parameters<typeof JobCard>[0]['job']}
                        cardIndex={index}
                        onViewDescription={() => router.push(getJobDetailPath(job))}
                        onApply={() => handleJobApply(job)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {showEvents && (
              <section aria-labelledby="hub-events-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    id="hub-events-heading"
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Events
                    <span className="ml-2 font-normal text-gray-500">
                      ({eventsToShow.length}
                      {tab === 'all' && events.length > eventsToShow.length
                        ? '+'
                        : ''}
                      )
                    </span>
                  </h2>
                  <Link
                    href="/events"
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    View all
                  </Link>
                </div>
                {eventsToShow.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No events match your filters.{' '}
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      Clear filters
                    </button>
                    {' · '}
                    <Link href="/events" className="font-medium text-primary-600 hover:underline">
                      Browse all events
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {eventsToShow.map((event) => (
                      <ContestCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {!error && jobs.length === 0 && events.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="text-gray-600 dark:text-gray-400">No opportunities found.</p>
                <div className="flex gap-2">
                  <Link href="/jobs">
                    <Button variant="outline" className="rounded-xl">
                      Jobs
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button variant="outline" className="rounded-xl">
                      Events
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
