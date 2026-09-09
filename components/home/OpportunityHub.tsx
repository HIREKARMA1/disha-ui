'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  Code2,
  GraduationCap,
  LogOut,
  Menu,
  Newspaper,
  PlusCircle,
  Search,
  Sparkles,
  Trophy,
  User,
  Users,
  Wrench,
  X,
  ArrowRight,
  Brain,
  ClipboardList,
  FileText,
  Library,
  Target,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Footer } from '@/components/ui/footer'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import {
  HubCardSkeleton,
  HubEventCard,
  HubFeaturedCarousel,
  HubJobCard,
  HubSectionHeader,
  HubTrustedLogos,
} from '@/components/home/HubOpportunityCards'
import { HubSidebarDesktop, HubSidebarDrawer } from '@/components/home/HubSidebar'
import { CategoryIcon } from '@/components/home/CategoryIcons'
import { contestEventService } from '@/services/contestEventService'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import {
  DATE_POSTED_OPTIONS,
  JOB_TYPE_OPTIONS,
  toApiDatePosted,
  type DatePostedFilter,
} from '@/components/jobs/JobsFilterFields'
import { PORTAL_CATEGORY_CHIPS } from '@/lib/eventsPortalConfig'
import type { ContestEventListItem } from '@/types/contestEvent'
import { cn } from '@/lib/utils'
import companyData from '@/data/company.json'

export type OpportunityTab = 'all' | 'jobs' | 'events'

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

type HubIcon = LucideIcon

type QuickPill = {
  id: string
  label: string
  tab: OpportunityTab
  patch?: Partial<HubFilters>
  icon: HubIcon
}

const CATEGORY_TILE_TONES: Record<
  string,
  { idle: string; active: string; iconWrap: string; glow: string }
> = {
  all: {
    idle: 'border-slate-200/80 bg-white hover:border-primary-200 hover:bg-primary-50/30',
    active:
      'border-primary-300 bg-primary-50/40 shadow-sm ring-1 ring-primary-200/60',
    iconWrap: 'bg-slate-50 shadow-none ring-1 ring-slate-100',
    glow: 'group-hover:shadow-sm',
  },
  jobs: {
    idle: 'border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/25',
    active: 'border-blue-300 bg-blue-50/40 shadow-sm ring-1 ring-blue-200/60',
    iconWrap: 'bg-blue-50/60 shadow-none ring-1 ring-blue-100/80',
    glow: 'group-hover:shadow-sm',
  },
  internship: {
    idle: 'border-slate-200/80 bg-white hover:border-violet-200 hover:bg-violet-50/25',
    active: 'border-violet-300 bg-violet-50/40 shadow-sm ring-1 ring-violet-200/60',
    iconWrap: 'bg-violet-50/60 shadow-none ring-1 ring-violet-100/80',
    glow: 'group-hover:shadow-sm',
  },
  full_time: {
    idle: 'border-slate-200/80 bg-white hover:border-sky-200 hover:bg-sky-50/25',
    active: 'border-sky-300 bg-sky-50/40 shadow-sm ring-1 ring-sky-200/60',
    iconWrap: 'bg-sky-50/60 shadow-none ring-1 ring-sky-100/80',
    glow: 'group-hover:shadow-sm',
  },
  events: {
    idle: 'border-slate-200/80 bg-white hover:border-orange-200 hover:bg-orange-50/25',
    active: 'border-orange-300 bg-orange-50/40 shadow-sm ring-1 ring-orange-200/60',
    iconWrap: 'bg-orange-50/60 shadow-none ring-1 ring-orange-100/80',
    glow: 'group-hover:shadow-sm',
  },
  hackathon: {
    idle: 'border-slate-200/80 bg-white hover:border-cyan-200 hover:bg-cyan-50/25',
    active: 'border-cyan-300 bg-cyan-50/40 shadow-sm ring-1 ring-cyan-200/60',
    iconWrap: 'bg-cyan-50/50 shadow-none ring-1 ring-cyan-100/80',
    glow: 'group-hover:shadow-sm',
  },
  workshop: {
    idle: 'border-slate-200/80 bg-white hover:border-amber-200 hover:bg-amber-50/25',
    active: 'border-amber-300 bg-amber-50/40 shadow-sm ring-1 ring-amber-200/60',
    iconWrap: 'bg-amber-50/50 shadow-none ring-1 ring-amber-100/80',
    glow: 'group-hover:shadow-sm',
  },
  placement: {
    idle: 'border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/25',
    active: 'border-emerald-300 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-200/60',
    iconWrap: 'bg-emerald-50/50 shadow-none ring-1 ring-emerald-100/80',
    glow: 'group-hover:shadow-sm',
  },
  competition: {
    idle: 'border-slate-200/80 bg-white hover:border-primary-200 hover:bg-primary-50/25',
    active: 'border-primary-300 bg-primary-50/40 shadow-sm ring-1 ring-primary-200/60',
    iconWrap: 'bg-primary-50/50 shadow-none ring-1 ring-primary-100/80',
    glow: 'group-hover:shadow-sm',
  },
  coding: {
    idle: 'border-slate-200/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/25',
    active: 'border-indigo-300 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-200/60',
    iconWrap: 'bg-indigo-50/50 shadow-none ring-1 ring-indigo-100/80',
    glow: 'group-hover:shadow-sm',
  },
}

const DEFAULT_TILE_TONE = CATEGORY_TILE_TONES.all

/** Category tiles — all major Disha opportunity types. */
const CATEGORY_TILES: QuickPill[] = [
  { id: 'all', label: 'All', tab: 'all', icon: Sparkles },
  { id: 'jobs', label: 'Jobs', tab: 'jobs', icon: Briefcase },
  { id: 'internship', label: 'Internships', tab: 'jobs', patch: { jobType: 'internship' }, icon: GraduationCap },
  { id: 'full_time', label: 'Full time', tab: 'jobs', patch: { jobType: 'full_time' }, icon: Briefcase },
  { id: 'events', label: 'Events', tab: 'events', icon: Calendar },
  { id: 'hackathon', label: 'Hackathons', tab: 'events', patch: { eventCategory: 'hackathon' }, icon: Code2 },
  { id: 'workshop', label: 'Workshops', tab: 'events', patch: { eventCategory: 'workshop' }, icon: Wrench },
  {
    id: 'placement',
    label: 'Placement',
    tab: 'events',
    patch: { eventCategory: 'placement_drive' },
    icon: Users,
  },
  {
    id: 'competition',
    label: 'Competitions',
    tab: 'events',
    patch: { eventCategory: 'competition' },
    icon: Trophy,
  },
  {
    id: 'coding',
    label: 'Coding',
    tab: 'events',
    patch: { eventCategory: 'coding_contest' },
    icon: Code2,
  },
]

/** Unstop-style Explore panel under search (Disha features only). */
type ExploreItem =
  | { id: string; label: string; kind: 'filter'; pill: QuickPill }
  | {
      id: string
      label: string
      kind: 'link'
      href: string
      icon: HubIcon
      auth?: boolean
    }

const EXPLORE_ITEMS: ExploreItem[] = [
  { id: 'jobs', label: 'Jobs', kind: 'filter', pill: CATEGORY_TILES.find((t) => t.id === 'jobs')! },
  {
    id: 'internship',
    label: 'Internships',
    kind: 'filter',
    pill: CATEGORY_TILES.find((t) => t.id === 'internship')!,
  },
  {
    id: 'competition',
    label: 'Competitions',
    kind: 'filter',
    pill: CATEGORY_TILES.find((t) => t.id === 'competition')!,
  },
  {
    id: 'hackathon',
    label: 'Hackathons',
    kind: 'filter',
    pill: CATEGORY_TILES.find((t) => t.id === 'hackathon')!,
  },
  { id: 'events', label: 'Events', kind: 'filter', pill: CATEGORY_TILES.find((t) => t.id === 'events')! },
  {
    id: 'workshop',
    label: 'Workshops',
    kind: 'filter',
    pill: CATEGORY_TILES.find((t) => t.id === 'workshop')!,
  },
  {
    id: 'placement',
    label: 'Placement',
    kind: 'filter',
    pill: CATEGORY_TILES.find((t) => t.id === 'placement')!,
  },
  { id: 'coding', label: 'Coding', kind: 'filter', pill: CATEGORY_TILES.find((t) => t.id === 'coding')! },
  {
    id: 'full_time',
    label: 'Full time',
    kind: 'filter',
    pill: CATEGORY_TILES.find((t) => t.id === 'full_time')!,
  },
  {
    id: 'create',
    label: 'Create Event',
    kind: 'link',
    href: '/events#create-event-request',
    icon: PlusCircle,
  },
  { id: 'blogs', label: 'Blogs', kind: 'link', href: '/blogs', icon: Newspaper },
  {
    id: 'practice',
    label: 'Practice',
    kind: 'link',
    href: '/dashboard/student/practice',
    icon: Brain,
    auth: true,
  },
]

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

function OpportunityHeader({
  onMenuOpen,
  searchSlot,
}: {
  onMenuOpen: () => void
  searchSlot: ReactNode
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white',
        'dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuOpen}
          className="shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="shrink-0 lg:hidden">
          <BrandLogo href="/" priority />
        </div>

        <div className="min-w-0 flex-1">{searchSlot}</div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          ) : isAuthenticated && user ? (
            <>
              <Link href={getDashboardPath(user.user_type)} className="hidden md:block">
                <Button size="sm" variant="outline" className="h-8 rounded-full shadow-none">
                  <User className="mr-1.5 h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden h-8 text-gray-600 dark:text-gray-400 md:inline-flex"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-full bg-primary-600 px-4 text-white shadow-none hover:bg-primary-700"
              onClick={() => openLoginModal()}
            >
              Login
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default function OpportunityHub() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const [tab, setTab] = useState<OpportunityTab>('all')
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<HubFilters>(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState<HubFilters>(DEFAULT_FILTERS)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [jobs, setJobs] = useState<HubJob[]>([])
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const resultsAnchorRef = useRef<HTMLDivElement>(null)
  const exploreCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** True while pointer is over search + Explore (survives layout-shift scroll events). */
  const exploreHoveringRef = useRef(false)

  const showExplore = exploreOpen && !searchInput.trim()

  const clearExploreCloseTimer = useCallback(() => {
    if (exploreCloseTimerRef.current) {
      clearTimeout(exploreCloseTimerRef.current)
      exploreCloseTimerRef.current = null
    }
  }, [])

  const closeExplorePanel = useCallback(() => {
    clearExploreCloseTimer()
    setExploreOpen(false)
    setSearchFocused(false)
  }, [clearExploreCloseTimer])

  const openExplorePanel = useCallback(() => {
    clearExploreCloseTimer()
    if (!searchInput.trim()) setExploreOpen(true)
  }, [clearExploreCloseTimer, searchInput])

  const scheduleCloseExplorePanel = useCallback(() => {
    clearExploreCloseTimer()
    exploreCloseTimerRef.current = setTimeout(() => {
      // Only close if pointer actually left (not a gap flicker)
      if (exploreHoveringRef.current) return
      setExploreOpen(false)
      setSearchFocused(false)
      exploreCloseTimerRef.current = null
    }, 200)
  }, [clearExploreCloseTimer])

  useEffect(() => () => clearExploreCloseTimer(), [clearExploreCloseTimer])

  useEffect(() => {
    if (!exploreOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExplorePanel()
    }
    // Real user scroll intent — always close Explore
    const onUserScrollIntent = () => closeExplorePanel()
    // Layout shift can fire scroll while still hovering; ignore those
    const onScroll = () => {
      if (exploreHoveringRef.current) return
      closeExplorePanel()
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onUserScrollIntent, { passive: true, capture: true })
    window.addEventListener('touchmove', onUserScrollIntent, { passive: true, capture: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onUserScrollIntent, true)
      window.removeEventListener('touchmove', onUserScrollIntent, true)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [exploreOpen, closeExplorePanel])

  const companies = useMemo(
    () => ((companyData as { conpanies?: { id: number; name: string; logo: string }[] }).conpanies || []).slice(0, 24),
    []
  )

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, tab),
    [filters, tab]
  )

  const isBrowseHome =
    tab === 'all' &&
    !query &&
    filters.jobType === '' &&
    filters.remoteWork === '' &&
    filters.datePosted === 'all' &&
    filters.eventStatus === 'all' &&
    filters.eventCategory === 'all'

  const fetchOpportunities = useCallback(
    async (search: string, active: HubFilters) => {
      setLoading(true)
      setError(null)
      try {
        const jobsParams = new URLSearchParams({
          page: '1',
          limit: '16',
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
            limit: 16,
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
    setExploreOpen(false)
    setQuery(searchInput.trim())
  }

  const applyFilters = (next: HubFilters) => {
    setFilters(next)
    setDraftFilters(next)
  }

  const clearFilters = () => {
    setTab('all')
    applyFilters(DEFAULT_FILTERS)
    setQuery('')
    setSearchInput('')
    setFilterSheetOpen(false)
    setExploreOpen(false)
  }

  const openFilterSheet = () => {
    setDraftFilters(filters)
    setFilterSheetOpen(true)
  }

  const applyQuickPill = (pill: QuickPill) => {
    setTab(pill.tab)
    applyFilters({ ...DEFAULT_FILTERS, ...pill.patch })
    setExploreOpen(false)
    setSearchFocused(false)
    window.requestAnimationFrame(() => {
      resultsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const requireStudentLogin = (path: string) => {
    openLoginModal({
      redirect: path,
      preferredType: 'student',
    })
  }

  const handleExploreSelect = (item: ExploreItem) => {
    if (item.kind === 'filter') {
      applyQuickPill(item.pill)
      return
    }
    setExploreOpen(false)
    if (item.auth && !(isAuthenticated && user?.user_type === 'student')) {
      requireStudentLogin(item.href)
      return
    }
    if (
      item.id === 'practice' &&
      isAuthenticated &&
      user?.user_type === 'student'
    ) {
      router.push('/dashboard/student/practice')
      return
    }
    router.push(item.href)
  }

  const activeQuickPillId = useMemo(() => {
    for (const pill of [...CATEGORY_TILES].reverse()) {
      if (pill.tab !== tab) continue
      if (!pill.patch) {
        if (
          filters.jobType === '' &&
          filters.remoteWork === '' &&
          filters.datePosted === 'all' &&
          filters.eventStatus === 'all' &&
          filters.eventCategory === 'all'
        ) {
          return pill.id
        }
        continue
      }
      const matches = Object.entries(pill.patch).every(
        ([key, value]) => filters[key as keyof HubFilters] === value
      )
      if (matches) return pill.id
    }
    return null
  }, [tab, filters])

  const filterSheet = (
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
      triggerClassName="h-9 rounded-lg px-3"
    >
      <div className="space-y-6">
        {(tab === 'all' || tab === 'jobs') && (
          <>
            <FilterRadioGroup
              title="Job type"
              name="hub_job_type"
              options={HUB_JOB_TYPES}
              value={draftFilters.jobType}
              onChange={(jobType) => setDraftFilters((f) => ({ ...f, jobType }))}
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
  )

  const handleJobApply = (job: HubJob) => {
    const path = getJobDetailPath(job)
    if (!isAuthenticated || user?.user_type !== 'student') {
      const redirect = prepareGuestApplyForLogin(job.id, path)
      openLoginModal({
        redirect,
        preferredType: 'student',
      })
      return
    }
    router.push(path)
  }

  const jobsToShow = tab === 'all' ? jobs.slice(0, 12) : jobs
  const eventsToShow = tab === 'all' ? events.slice(0, 12) : events

  const mixedFeed = useMemo(() => {
    const items: Array<
      | { kind: 'job'; job: HubJob }
      | { kind: 'event'; event: ContestEventListItem }
    > = []
    const maxLen = Math.max(jobsToShow.length, eventsToShow.length)
    for (let i = 0; i < maxLen; i += 1) {
      if (jobsToShow[i]) items.push({ kind: 'job', job: jobsToShow[i] })
      if (eventsToShow[i]) items.push({ kind: 'event', event: eventsToShow[i] })
    }
    return items
  }, [jobsToShow, eventsToShow])

  const jobsViewAllHref = useMemo(() => {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (filters.jobType) params.set('job_type', filters.jobType)
    if (filters.remoteWork) params.set('remote_work', filters.remoteWork)
    if (filters.datePosted !== 'all') params.set('date_posted', filters.datePosted)
    const qs = params.toString()
    return qs ? `/jobs?${qs}` : '/jobs'
  }, [query, filters])

  const searchSlot = (
    <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl lg:mx-auto">
      <div
        ref={searchWrapRef}
        className="relative"
        onMouseEnter={() => {
          exploreHoveringRef.current = true
          openExplorePanel()
        }}
        onMouseLeave={() => {
          exploreHoveringRef.current = false
          scheduleCloseExplorePanel()
        }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className={cn(
              'relative min-w-0 flex-1 rounded-full transition-shadow duration-200',
              (searchFocused || showExplore) && 'ring-2 ring-primary-500/40 shadow-sm'
            )}
          >
            <Search
              className={cn(
                'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
                searchFocused || showExplore ? 'text-primary-500' : 'text-gray-400'
              )}
            />
            <Input
              value={searchInput}
              onChange={(e) => {
                const v = e.target.value
                setSearchInput(v)
                if (v.trim()) {
                  clearExploreCloseTimer()
                  setExploreOpen(false)
                } else {
                  openExplorePanel()
                }
              }}
              onFocus={() => {
                setSearchFocused(true)
                openExplorePanel()
              }}
              onBlur={(e) => {
                const next = e.relatedTarget as Node | null
                if (searchWrapRef.current?.contains(next)) return
                scheduleCloseExplorePanel()
              }}
              placeholder="Search…"
              className={cn(
                'h-10 rounded-full border-primary-300 bg-white pl-10 shadow-none',
                'transition-colors focus-visible:border-primary-500 focus-visible:ring-0',
                'dark:border-primary-700 dark:bg-gray-900'
              )}
              aria-label="Search opportunities"
              aria-expanded={showExplore}
              aria-controls="hub-explore-panel"
              autoComplete="off"
            />
          </motion.div>
          <div className="hidden shrink-0 sm:block">{filterSheet}</div>
        </div>

        <AnimatePresence>
          {showExplore && (
            <motion.div
              id="hub-explore-panel"
              role="listbox"
              aria-label="Explore categories"
              initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              // top-full + pt-2 bridges the gap so hover never "falls through"
              className="absolute left-0 right-0 top-full z-40 pt-2"
              onMouseEnter={() => {
                exploreHoveringRef.current = true
                openExplorePanel()
              }}
              onMouseDown={(e) => {
                // Keep search focused; avoid blur-triggered close while using Explore
                e.preventDefault()
              }}
            >
              <div
                className={cn(
                  'rounded-2xl border border-gray-200 bg-white p-4 shadow-xl',
                  'dark:border-gray-700 dark:bg-gray-900 sm:p-5'
                )}
              >
              <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Explore
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {EXPLORE_ITEMS.map((item) => {
                  const Icon = item.kind === 'filter' ? item.pill.icon : item.icon
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      role="option"
                      whileHover={reduceMotion ? undefined : { y: -1, scale: 1.02 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      onClick={() => handleExploreSelect(item)}
                      className="group flex flex-col items-center gap-2 rounded-xl px-2 py-2.5 text-center transition-colors duration-200 hover:bg-primary-50/60 dark:hover:bg-primary-950/25"
                    >
                      <span
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-full',
                          'bg-slate-50/90 text-slate-500 ring-1 ring-slate-200/60',
                          'transition-all duration-200 ease-out',
                          'group-hover:scale-105 group-hover:bg-primary-100 group-hover:text-primary-700 group-hover:ring-primary-200',
                          'dark:bg-slate-800/50 dark:text-slate-400 dark:ring-slate-700/50',
                          'dark:group-hover:bg-primary-900/50 dark:group-hover:text-primary-200 dark:group-hover:ring-primary-700/50'
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-slate-500 transition-colors duration-200 group-hover:text-primary-700 dark:text-slate-400 dark:group-hover:text-primary-300">
                        {item.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  )

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <HubSidebarDesktop />
      <HubSidebarDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <OpportunityHeader
          onMenuOpen={() => setMenuOpen(true)}
          searchSlot={searchSlot}
        />

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div ref={resultsAnchorRef} className="scroll-mt-20" />

          {/* Hub hero headline */}
          <div className="mb-7">
            <h1 className="text-[1.65rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-gray-900 dark:text-white sm:text-4xl sm:tracking-[0.06em]">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Potential
              </span>
            </h1>
            <div
              className="mt-3 h-1 w-16 rounded-full bg-primary-500 sm:w-20"
              aria-hidden
            />
          </div>

          {/* Category tiles — same filters, Unstop icon-row layout */}
          <motion.section
            className="mb-8"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
                <span className="h-6 w-1 shrink-0 rounded-sm bg-primary-500" aria-hidden />
                Explore categories
              </h2>
              <div className="flex items-center gap-2">
                <div className="sm:hidden">{filterSheet}</div>
                {activeFilterCount > 0 && (
                  <motion.button
                    type="button"
                    onClick={clearFilters}
                    initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset · {activeFilterCount}
                  </motion.button>
                )}
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-5 lg:grid-cols-10 md:gap-3.5 md:overflow-visible">
              {CATEGORY_TILES.map((tile, i) => {
                const active = activeQuickPillId === tile.id
                const tone = CATEGORY_TILE_TONES[tile.id] ?? DEFAULT_TILE_TONE
                return (
                  <motion.button
                    key={tile.id}
                    type="button"
                    onClick={() => applyQuickPill(tile)}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    whileHover={reduceMotion ? undefined : { y: -6, scale: 1.05 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                    className={cn(
                      'group relative flex w-[108px] shrink-0 flex-col items-center gap-3 overflow-hidden rounded-2xl border px-2.5 py-4 text-center transition-all duration-200 md:w-auto',
                      'dark:bg-gray-900 dark:hover:border-opacity-80',
                      active ? tone.active : tone.idle,
                      !active && `hover:shadow-sm ${tone.glow}`
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35',
                        active ? 'opacity-30' : 'opacity-15'
                      )}
                      style={{
                        background:
                          tile.id === 'jobs' || tile.id === 'full_time'
                            ? '#3B82F6'
                            : tile.id === 'internship' || tile.id === 'coding'
                              ? '#8B5CF6'
                              : tile.id === 'events' || tile.id === 'workshop'
                                ? '#F97316'
                                : tile.id === 'hackathon'
                                  ? '#06B6D4'
                                  : tile.id === 'placement'
                                    ? '#10B981'
                                    : tile.id === 'all' || tile.id === 'competition'
                                      ? '#2563EB'
                                      : '#F59E0B',
                      }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105',
                        tone.iconWrap,
                        active && 'scale-105'
                      )}
                    >
                      <CategoryIcon id={tile.id} active={active} className="h-9 w-9" />
                    </span>
                    <span
                      className={cn(
                        'relative text-xs font-bold leading-tight tracking-tight sm:text-[13px]',
                        active
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-200'
                      )}
                    >
                      {tile.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.section>

          {isBrowseHome && <HubFeaturedCarousel />}

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <HubCardSkeleton key={`s-${i}`} withImage={i % 2 === 1} />
                ))}
              </div>
            ) : isBrowseHome ? (
              <div className="space-y-8">
                <section>
                  <HubSectionHeader
                    title="Jobs & internships"
                    count={jobs.length}
                    viewAllHref={jobsViewAllHref}
                    viewAllLabel="View all"
                    subtitle="Fresh roles from hiring partners on Disha."
                  />
                  {jobs.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                      No jobs yet.{' '}
                      <Link href="/jobs" className="font-medium text-primary-600 hover:underline">
                        Browse jobs
                      </Link>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {jobs.slice(0, 4).map((job, i) => (
                        <HubJobCard
                          key={job.id}
                          job={job}
                          index={i}
                          onView={() => router.push(getJobDetailPath(job))}
                          onApply={() => handleJobApply(job)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <HubSectionHeader
                    title="Events & contests"
                    count={events.length}
                    viewAllHref="/events"
                    viewAllLabel="View all"
                    subtitle="Hackathons, workshops, and campus competitions."
                  />
                  {events.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                      No events yet.{' '}
                      <Link href="/events" className="font-medium text-primary-600 hover:underline">
                        Browse events
                      </Link>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {events.slice(0, 4).map((event, i) => (
                        <HubEventCard key={event.id} event={event} index={i} />
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-5">
                    <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground sm:text-[22px]">
                      <span className="h-6 w-1 shrink-0 rounded-sm bg-primary-500" aria-hidden />
                      More on Disha
                    </h2>
                    <p className="mt-1.5 pl-3.5 text-xs text-muted-foreground sm:text-sm">
                      Every student tool in one place — login to unlock your workspace.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {(
                      [
                        {
                          label: 'Practice',
                          subtitle: 'Tests, mocks & guided practice',
                          path: '/dashboard/student/practice',
                          auth: true,
                          icon: Brain,
                          tone: 'bg-sky-50/70 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
                          hover: 'hover:border-sky-100 hover:bg-sky-50/40 dark:hover:border-sky-800 dark:hover:bg-sky-950/30',
                        },
                        {
                          label: 'Resume Builder',
                          subtitle: 'Campus-ready resumes',
                          path: '/dashboard/student/resume-builder',
                          auth: true,
                          icon: FileText,
                          tone: 'bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
                          hover: 'hover:border-emerald-100 hover:bg-emerald-50/40 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30',
                        },
                        {
                          label: 'Career Align',
                          subtitle: 'Roles that fit your goals',
                          path: '/dashboard/student/career-align',
                          auth: true,
                          icon: Target,
                          tone: 'bg-amber-50/70 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
                          hover: 'hover:border-amber-100 hover:bg-amber-50/40 dark:hover:border-amber-800 dark:hover:bg-amber-950/30',
                        },
                        {
                          label: 'Library',
                          subtitle: 'Curated learning resources',
                          path: '/dashboard/student/library',
                          auth: true,
                          icon: Library,
                          tone: 'bg-indigo-50/70 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
                          hover: 'hover:border-indigo-100 hover:bg-indigo-50/40 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30',
                        },
                        {
                          label: 'Video Search',
                          subtitle: 'Career videos & learning',
                          path: '/dashboard/student/video-search',
                          auth: true,
                          icon: Video,
                          tone: 'bg-rose-50/70 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
                          hover: 'hover:border-rose-100 hover:bg-rose-50/40 dark:hover:border-rose-800 dark:hover:bg-rose-950/30',
                        },
                        {
                          label: 'Applications',
                          subtitle: 'Track every application',
                          path: '/dashboard/student/applications',
                          auth: true,
                          icon: ClipboardList,
                          tone: 'bg-cyan-50/70 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
                          hover: 'hover:border-cyan-100 hover:bg-cyan-50/40 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30',
                        },
                        {
                          label: 'Create Event',
                          subtitle: 'Workshops, contests & campus events',
                          path: '/events#create-event-request',
                          auth: false,
                          icon: PlusCircle,
                          tone: 'bg-orange-50/70 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
                          hover: 'hover:border-orange-100 hover:bg-orange-50/40 dark:hover:border-orange-800 dark:hover:bg-orange-950/30',
                        },
                        {
                          label: 'Blogs',
                          subtitle: 'Tips, updates & stories',
                          path: '/blogs',
                          auth: false,
                          icon: Newspaper,
                          tone: 'bg-primary-50/70 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
                          hover: 'hover:border-primary-100 hover:bg-primary-50/40 dark:hover:border-primary-800 dark:hover:bg-primary-950/30',
                        },
                      ] as const
                    ).map((item, index) => {
                      const needsAuth =
                        item.auth && !(isAuthenticated && user?.user_type === 'student')
                      const href = needsAuth ? '#' : item.path
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={item.label}
                          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.28, delay: index * 0.04, ease: 'easeOut' }}
                        >
                          <Link
                            href={href}
                            aria-label={
                              needsAuth
                                ? `${item.label}: ${item.subtitle}. Login required`
                                : `${item.label}: ${item.subtitle}`
                            }
                            onClick={(e) => {
                              if (needsAuth) {
                                e.preventDefault()
                                requireStudentLogin(item.path)
                              }
                            }}
                            className={cn(
                              'group relative flex h-full items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3.5 outline-none',
                              'transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out',
                              'hover:-translate-y-0.5 hover:shadow-sm',
                              'active:translate-y-0 active:scale-[0.985]',
                              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                              'dark:border-slate-700 dark:bg-slate-900/60',
                              item.hover
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-100',
                                item.tone
                              )}
                              aria-hidden
                            >
                              <Icon className="h-5 w-5" strokeWidth={1.85} />
                            </span>
                            <span className="min-w-0 flex-1 pt-0.5">
                              <span className="flex items-center gap-1.5">
                                <span className="text-[14px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300">
                                  {item.label}
                                </span>
                                {needsAuth && (
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100">
                                    Login
                                  </span>
                                )}
                              </span>
                              <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/70">
                                {item.subtitle}
                              </span>
                            </span>
                            <span
                              className={cn(
                                'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                'bg-muted/60 text-muted-foreground',
                                'opacity-0 -translate-x-1 transition-all duration-200',
                                'group-hover:translate-x-0 group-hover:opacity-100',
                                'group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
                                'group-hover:bg-primary-600 group-hover:text-white'
                              )}
                              aria-hidden
                            >
                              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                            </span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </section>

                <HubTrustedLogos companies={companies} />
              </div>
            ) : (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {tab === 'jobs'
                      ? 'Jobs'
                      : tab === 'events'
                        ? 'Events'
                        : 'Opportunities'}
                    <span className="ml-2 font-normal text-gray-500">
                      (
                      {tab === 'all'
                        ? mixedFeed.length
                        : tab === 'jobs'
                          ? jobsToShow.length
                          : eventsToShow.length}
                      )
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(tab === 'all' || tab === 'jobs') && (
                      <Link
                        href={jobsViewAllHref}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300"
                      >
                        All jobs
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-white">
                          <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} />
                        </span>
                      </Link>
                    )}
                    {(tab === 'all' || tab === 'events') && (
                      <Link
                        href="/events"
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300"
                      >
                        All events
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-white">
                          <ArrowRight className="h-2.5 w-2.5" strokeWidth={2.5} />
                        </span>
                      </Link>
                    )}
                  </div>
                </div>

                {tab === 'all' && mixedFeed.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {mixedFeed.map((item, i) =>
                      item.kind === 'job' ? (
                        <HubJobCard
                          key={`job-${item.job.id}`}
                          job={item.job}
                          index={i}
                          onView={() => router.push(getJobDetailPath(item.job))}
                          onApply={() => handleJobApply(item.job)}
                        />
                      ) : (
                        <HubEventCard
                          key={`event-${item.event.id}`}
                          event={item.event}
                          index={i}
                        />
                      )
                    )}
                  </div>
                )}

                {tab === 'jobs' &&
                  (jobsToShow.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                      No jobs match.{' '}
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {jobsToShow.map((job, i) => (
                        <HubJobCard
                          key={job.id}
                          job={job}
                          index={i}
                          onView={() => router.push(getJobDetailPath(job))}
                          onApply={() => handleJobApply(job)}
                        />
                      ))}
                    </div>
                  ))}

                {tab === 'events' &&
                  (eventsToShow.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                      No events match.{' '}
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {eventsToShow.map((event, i) => (
                        <HubEventCard key={event.id} event={event} index={i} />
                      ))}
                    </div>
                  ))}

                {!error && tab === 'all' && mixedFeed.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-gray-600 dark:text-gray-400">No opportunities found.</p>
                    <div className="flex gap-2">
                      <Link href="/jobs">
                        <Button variant="outline" className="rounded-md shadow-none">
                          Jobs
                        </Button>
                      </Link>
                      <Link href="/events">
                        <Button variant="outline" className="rounded-md shadow-none">
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
    </div>
  )
}
