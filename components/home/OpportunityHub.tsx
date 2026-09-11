'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Sparkles,
  User,
  Users,
  ArrowRight,
  Brain,
  Code2,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Footer } from '@/components/ui/footer'
import {
  HubCardSkeleton,
  HubEventCard,
  HubFeaturedCarousel,
  HubJobCard,
  HubPlacedStudents,
  HubSectionHeader,
  HubTrustedLogos,
} from '@/components/home/HubOpportunityCards'
import { HubSidebarDesktop, HubSidebarDrawer } from '@/components/home/HubSidebar'
import placedStudentsData from '@/data/placed-students.json'
import { CategoryIcon } from '@/components/home/CategoryIcons'
import { HubWhyDisha } from '@/components/home/HubWhyDisha'
import { getFeaturedBlogs } from '@/data/blogs'
import { contestEventService } from '@/services/contestEventService'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { toApiDatePosted, type DatePostedFilter } from '@/components/jobs/JobsFilterFields'
import type { ContestEventListItem } from '@/types/contestEvent'
import { cn } from '@/lib/utils'
import companyData from '@/data/company.json'

export type OpportunityTab = 'all' | 'jobs' | 'events'

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
  /** scroll = home-page section; filter kept for search Explore panel only */
  kind?: 'filter' | 'scroll'
  /** DOM id on Opportunity Hub for smooth scroll */
  sectionId?: string
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
    iconWrap: 'bg-slate-50 shadow-none ring-1 ring-slate-100 dark:bg-[rgba(148,163,184,0.14)] dark:text-[#C5D0E6] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  jobs: {
    idle: 'border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/25',
    active: 'border-blue-300 bg-blue-50/40 shadow-sm ring-1 ring-blue-200/60',
    iconWrap: 'bg-blue-50/60 shadow-none ring-1 ring-blue-100/80 dark:bg-[rgba(37,99,235,0.18)] dark:text-[#60A5FA] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  events: {
    idle: 'border-slate-200/80 bg-white hover:border-orange-200 hover:bg-orange-50/25',
    active: 'border-orange-300 bg-orange-50/40 shadow-sm ring-1 ring-orange-200/60',
    iconWrap: 'bg-orange-50/60 shadow-none ring-1 ring-orange-100/80 dark:bg-[rgba(245,128,32,0.18)] dark:text-[#FB923C] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  blogs: {
    idle: 'border-slate-200/80 bg-white hover:border-sky-200 hover:bg-sky-50/25',
    active: 'border-sky-300 bg-sky-50/40 shadow-sm ring-1 ring-sky-200/60',
    iconWrap: 'bg-sky-50/60 shadow-none ring-1 ring-sky-100/80 dark:bg-[rgba(139,92,246,0.18)] dark:text-[#A78BFA] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  faq: {
    idle: 'border-slate-200/80 bg-white hover:border-violet-200 hover:bg-violet-50/25',
    active: 'border-violet-300 bg-violet-50/40 shadow-sm ring-1 ring-violet-200/60',
    iconWrap: 'bg-violet-50/60 shadow-none ring-1 ring-violet-100/80 dark:bg-[rgba(217,70,239,0.16)] dark:text-[#E879F9] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  placed_students: {
    idle: 'border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50/25',
    active: 'border-emerald-300 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-200/60',
    iconWrap: 'bg-emerald-50/50 shadow-none ring-1 ring-emerald-100/80 dark:bg-[rgba(9,136,85,0.16)] dark:text-[#3FD996] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  mock_tests: {
    idle: 'border-slate-200/80 bg-white hover:border-violet-200 hover:bg-violet-50/25',
    active: 'border-violet-300 bg-violet-50/40 shadow-sm ring-1 ring-violet-200/60',
    iconWrap: 'bg-violet-50/50 shadow-none ring-1 ring-violet-100/80 dark:bg-[rgba(254,196,13,0.16)] dark:text-[#FEC40D] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  trusted_partners: {
    idle: 'border-slate-200/80 bg-white hover:border-cyan-200 hover:bg-cyan-50/25',
    active: 'border-cyan-300 bg-cyan-50/40 shadow-sm ring-1 ring-cyan-200/60',
    iconWrap: 'bg-cyan-50/50 shadow-none ring-1 ring-cyan-100/80 dark:bg-[rgba(13,148,136,0.18)] dark:text-[#2DD4BF] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  about: {
    idle: 'border-slate-200/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/25',
    active: 'border-indigo-300 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-200/60',
    iconWrap: 'bg-indigo-50/50 shadow-none ring-1 ring-indigo-100/80 dark:bg-[rgba(99,102,241,0.18)] dark:text-[#818CF8] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
  contact: {
    idle: 'border-slate-200/80 bg-white hover:border-rose-200 hover:bg-rose-50/25',
    active: 'border-rose-300 bg-rose-50/40 shadow-sm ring-1 ring-rose-200/60',
    iconWrap: 'bg-rose-50/50 shadow-none ring-1 ring-rose-100/80 dark:bg-[rgba(214,66,70,0.16)] dark:text-[#E8767A] dark:ring-0',
    glow: 'group-hover:shadow-sm',
  },
}

const DEFAULT_TILE_TONE = CATEGORY_TILE_TONES.all

/** Explore categories — scroll to matching sections on this home page. */
const CATEGORY_TILES: QuickPill[] = [
  { id: 'all', label: 'All', kind: 'scroll', sectionId: 'hub-top', tab: 'all', icon: Sparkles },
  { id: 'jobs', label: 'Jobs', kind: 'scroll', sectionId: 'hub-jobs', tab: 'all', icon: Briefcase },
  { id: 'events', label: 'Events', kind: 'scroll', sectionId: 'hub-events', tab: 'all', icon: Calendar },
  { id: 'mock_tests', label: 'Mock Test', kind: 'scroll', tab: 'all', icon: Brain },
  { id: 'blogs', label: 'Blogs', kind: 'scroll', sectionId: 'hub-blogs', tab: 'all', icon: Newspaper },
  {
    id: 'placed_students',
    label: 'Placed Students',
    kind: 'scroll',
    sectionId: 'hub-placed-students',
    tab: 'all',
    icon: Users,
  },
  {
    id: 'trusted_partners',
    label: 'Trusted Partner',
    kind: 'scroll',
    sectionId: 'hub-trusted-partners',
    tab: 'all',
    icon: Users,
  },
  { id: 'about', label: 'Why Disha?', kind: 'scroll', sectionId: 'hub-about', tab: 'all', icon: User },
  { id: 'faq', label: 'FAQ', kind: 'scroll', sectionId: 'hub-faq', tab: 'all', icon: Sparkles },
  { id: 'contact', label: 'Contact Us', kind: 'scroll', sectionId: 'hub-contact', tab: 'all', icon: Newspaper },
]

/** Filters still used by search Explore panel. */
const EXPLORE_FILTER_PILLS: Record<string, QuickPill> = {
  internship: {
    id: 'internship',
    label: 'Internships',
    kind: 'filter',
    tab: 'jobs',
    patch: { jobType: 'internship' },
    icon: GraduationCap,
  },
}

/** Search Explore — Disha student intents only (sidebar keeps Jobs / Events). */
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
  {
    id: 'internship',
    label: 'Internships',
    kind: 'filter',
    pill: EXPLORE_FILTER_PILLS.internship,
  },
  {
    id: 'campus_drive',
    label: 'Campus Drive',
    kind: 'link',
    href: '/dashboard/student/jobs',
    icon: Search,
    auth: true,
  },
  {
    id: 'hackathon',
    label: 'Hackathons',
    kind: 'link',
    href: '/hackathons',
    icon: Code2,
    auth: true,
  },
  {
    id: 'mock_tests',
    label: 'Mock Tests',
    kind: 'link',
    href: '/dashboard/student/mock-tests',
    icon: ClipboardList,
  },
  {
    id: 'practice',
    label: 'Practice',
    kind: 'link',
    href: '/dashboard/student/practice',
    icon: Brain,
    auth: true,
  },
  {
    id: 'resume',
    label: 'Resume Builder',
    kind: 'link',
    href: '/dashboard/student/resume-builder',
    icon: FileText,
    auth: true,
  },
]

const HUB_HOME_FAQS = [
  {
    q: 'What industries will have the highest-paying jobs in 2026?',
    a: 'Technology, healthcare, finance, and renewable energy are expected to lead — driven by AI, digital transformation, and ongoing demand for skilled professionals.',
  },
  {
    q: 'What is the most in-demand job in India for 2026?',
    a: 'AI and Machine Learning roles currently top the list, followed closely by cybersecurity and data science, as nearly every industry invests in these areas.',
  },
  {
    q: 'Do I need a computer science degree to get into these roles?',
    a: 'Not always. Many companies hire based on demonstrated skills and project work rather than the degree alone — practical training and placement prep matter more than ever.',
  },
  {
    q: 'How is AI changing recruitment in 2026?',
    a: 'AI now handles resume screening, sourcing, interview scheduling, and early phone screens — so hiring moves faster. Final decisions and cultural fit still need human judgment.',
  },
  {
    q: 'How can job seekers prepare for AI-driven hiring?',
    a: 'Build an ATS-friendly resume with clear skills and measurable results, practice with AI interview simulations, and be ready to move quickly once shortlisted.',
  },
  {
    q: 'How does Disha / HireKarma help students get hired?',
    a: 'Disha connects campus opportunities, jobs, and events. HireKarma also supports skill development, SolviqAI practice, Pre-Placement Training, and Shortlisted matching — from learning to offer.',
  },
] as const

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

function OpportunityHeader({
  onMenuOpen,
  searchSlot,
}: {
  onMenuOpen: () => void
  searchSlot: ReactNode
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  const authActions = (
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
          className="h-8 rounded-full bg-primary-600 px-3.5 text-sm text-white shadow-none hover:bg-primary-700 sm:px-4 dark:border dark:border-[#232C42] dark:bg-[#141A29] dark:text-[#F4F6FA] dark:hover:bg-[#1B2334]"
          onClick={() => openLoginModal()}
        >
          Login
        </Button>
      )}
      <ThemeToggle />
    </div>
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white',
        'dark:border-[#1A2233] dark:bg-[rgba(10,13,20,0.85)] dark:backdrop-blur-[10px]'
      )}
    >
      {/*
        Mobile (Unstop-like): row1 = menu · logo · Login; row2 = full search
        Desktop (lg+): single row = search · Login (sidebar has brand)
      */}
      <div className="flex flex-col lg:h-14 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex h-12 items-center gap-2 px-3 sm:px-4 lg:order-2 lg:h-auto lg:shrink-0 lg:px-0">
          <button
            type="button"
            onClick={onMenuOpen}
            className="shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 shrink-0 lg:hidden">
            <BrandLogo href="/" priority compact />
          </div>
          <div className="ml-auto lg:ml-0">{authActions}</div>
        </div>

        <div className="min-w-0 flex-1 border-t border-gray-100 px-3 pb-2.5 pt-2 dark:border-[#1A2233] sm:px-4 lg:order-1 lg:border-0 lg:px-0 lg:pb-0 lg:pt-0">
          {searchSlot}
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState('all')
  const [jobs, setJobs] = useState<HubJob[]>([])
  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const resultsAnchorRef = useRef<HTMLDivElement>(null)
  const hubTopRef = useRef<HTMLDivElement>(null)
  const categoryScrollerRef = useRef<HTMLDivElement>(null)
  const categoryTileRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const exploreCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** True while pointer is over search + Explore (survives layout-shift scroll events). */
  const exploreHoveringRef = useRef(false)

  const featuredBlogs = useMemo(() => getFeaturedBlogs(3), [])

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
  }

  const clearFilters = () => {
    setTab('all')
    applyFilters(DEFAULT_FILTERS)
    setQuery('')
    setSearchInput('')
    setExploreOpen(false)
  }

  const scrollCategoryTileIntoStrip = (tileId: string) => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(min-width: 768px)').matches) return

    const scroller = categoryScrollerRef.current
    const tile = categoryTileRefs.current[tileId]
    if (!scroller || !tile) return

    const padding = 12
    const nextLeft =
      scroller.scrollLeft +
      (tile.getBoundingClientRect().left - scroller.getBoundingClientRect().left) -
      padding
    scroller.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const applyQuickPill = (pill: QuickPill) => {
    setActiveSectionId(pill.id)
    scrollCategoryTileIntoStrip(pill.id)

    if (pill.id === 'jobs') {
      router.push('/jobs')
      return
    }
    if (pill.id === 'events') {
      router.push('/events')
      return
    }
    if (pill.id === 'mock_tests') {
      router.push('/dashboard/student/mock-tests')
      return
    }
    if (pill.id === 'blogs') {
      router.push('/blogs')
      return
    }

    setExploreOpen(false)
    setSearchFocused(false)

    // Stay on browse-home layout so section anchors remain mounted
    setTab('all')
    applyFilters(DEFAULT_FILTERS)
    setQuery('')
    setSearchInput('')

    const targetId = pill.sectionId || 'hub-top'
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const el =
          targetId === 'hub-top'
            ? hubTopRef.current || document.getElementById('hub-top')
            : document.getElementById(targetId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    })
  }

  const requireStudentLogin = (path: string) => {
    openLoginModal({
      redirect: path,
      preferredType: 'student',
    })
  }

  const getExploreHref = (item: ExploreItem): string => {
    if (item.kind === 'link') return item.href
    const pill = item.pill
    if (pill.tab === 'jobs') {
      const params = new URLSearchParams()
      if (pill.patch?.jobType) params.set('job_type', String(pill.patch.jobType))
      const qs = params.toString()
      return qs ? `/jobs?${qs}` : '/jobs'
    }
    if (pill.tab === 'events') {
      const params = new URLSearchParams()
      if (pill.patch?.eventCategory) params.set('category', String(pill.patch.eventCategory))
      const qs = params.toString()
      return qs ? `/events?${qs}` : '/events'
    }
    return '/events'
  }

  const handleExploreSelect = (item: ExploreItem) => {
    const href = getExploreHref(item)
    setExploreOpen(false)
    setSearchFocused(false)

    const needsAuth = item.kind === 'link' && Boolean(item.auth)
    if (!isAuthenticated && needsAuth) {
      openLoginModal({
        redirect: href,
        preferredType: 'student',
      })
      return
    }

    if (item.kind === 'filter') {
      router.push(href)
      return
    }

    if (item.auth && user?.user_type !== 'student') {
      requireStudentLogin(item.href)
      return
    }
    if (item.id === 'practice' && user?.user_type === 'student') {
      router.push('/dashboard/student/practice')
      return
    }
    router.push(item.href)
  }

  const activeQuickPillId = activeSectionId

  const handleJobView = (job: HubJob) => {
    router.push(getJobDetailPath(job))
  }

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
    <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl lg:mx-auto 2xl:max-w-3xl">
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
              placeholder="Search opportunities, events, resources…"
              className={cn(
                'h-9 rounded-full border-primary-300 bg-white pl-10 shadow-none sm:h-10',
                'transition-colors focus-visible:border-primary-500 focus-visible:ring-0',
                'dark:border-[#232C42] dark:bg-[#141A29] dark:text-[#F4F6FA] dark:placeholder:text-[#5B6684] dark:focus-visible:border-[#33405E]'
              )}
              aria-label="Search opportunities"
              aria-expanded={showExplore}
              aria-controls="hub-explore-panel"
              autoComplete="off"
            />
          </motion.div>
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
                  'max-h-[min(70dvh,28rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-xl',
                  'dark:border-[#232C42] dark:bg-[#141A29] sm:p-5'
                )}
              >
              <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                Explore
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
    <div className="relative flex min-h-screen bg-white dark:bg-[#0A0D14]">
      <div
        aria-hidden
        className="pointer-events-none fixed left-[35%] top-[-200px] z-0 hidden h-[600px] w-[900px] dark:block"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,162,229,0.09) 0%, rgba(27,82,164,0.04) 45%, transparent 70%)',
        }}
      />
      <HubSidebarDesktop />
      <HubSidebarDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
        <OpportunityHeader
          onMenuOpen={() => setMenuOpen(true)}
          searchSlot={searchSlot}
        />

        <main className="w-full flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-10 2xl:px-14 2xl:py-8">
          <div ref={resultsAnchorRef} className="scroll-mt-28" />

          {/* Hub hero headline — tighter on mobile like Unstop */}
          <div id="hub-top" ref={hubTopRef} className="mb-5 scroll-mt-28 sm:mb-7">
            <h1 className="text-xl font-extrabold uppercase leading-snug tracking-[0.02em] text-gray-900 dark:text-[1.65rem] dark:normal-case dark:tracking-[-0.02em] dark:text-[#F4F6FA] sm:text-3xl sm:leading-tight sm:tracking-[0.06em] dark:sm:text-4xl lg:text-4xl dark:lg:text-[42px] 2xl:text-[2.6rem]">
              Discover your{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent dark:from-[#24B4F0] dark:to-[#7FD4F5]">
                potential
              </span>
            </h1>
            <div
              className="mt-2.5 h-1 w-12 rounded-full bg-primary-500 dark:mt-4 dark:h-[3px] dark:w-[54px] dark:bg-[#00A2E5] sm:mt-3 sm:w-20"
              aria-hidden
            />
          </div>

          {/* Category tiles — same filters, Unstop icon-row layout */}
          <motion.section
            className="mb-6 sm:mb-8"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-3 sm:mb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-[#F4F6FA] sm:gap-3 sm:text-[22px]">
                <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 dark:bg-[#00A2E5] sm:h-6" aria-hidden />
                Explore categories
              </h2>
            </div>
            <div
              ref={categoryScrollerRef}
              className="-mx-3 flex gap-2.5 overflow-x-auto overscroll-x-contain px-3 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-3 sm:px-0 md:grid md:grid-cols-5 lg:grid-cols-10 md:gap-3.5 md:overflow-visible 2xl:gap-4"
            >
              {CATEGORY_TILES.map((tile, i) => {
                const active = activeQuickPillId === tile.id
                const tone = CATEGORY_TILE_TONES[tile.id] ?? DEFAULT_TILE_TONE
                return (
                  <motion.button
                    key={tile.id}
                    type="button"
                    ref={(el) => {
                      categoryTileRefs.current[tile.id] = el
                    }}
                    onClick={() => applyQuickPill(tile)}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    whileHover={reduceMotion ? undefined : { y: -6, scale: 1.05 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                    className={cn(
                      'group relative flex w-[104px] shrink-0 flex-col items-center gap-2 overflow-hidden rounded-2xl border px-2 py-3 text-center transition-all duration-200 sm:w-[120px] sm:gap-3 sm:px-2.5 sm:py-4 md:w-auto 2xl:py-5',
                      'dark:border-[#1A2233] dark:bg-[#141A29] dark:hover:border-[#33405E] dark:hover:bg-[#1B2334]',
                      active && 'dark:!border-[rgba(0,162,229,0.35)] dark:!bg-[rgba(0,162,229,0.12)] dark:shadow-[0_4px_18px_rgba(0,162,229,0.15)]',
                      active ? tone.active : tone.idle,
                      !active && `hover:shadow-sm ${tone.glow}`
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35 dark:hidden',
                        active ? 'opacity-30' : 'opacity-15'
                      )}
                      style={{
                        background:
                          tile.id === 'jobs'
                            ? '#3B82F6'
                            : tile.id === 'events'
                              ? '#F97316'
                              : tile.id === 'blogs'
                                ? '#0EA5E9'
                                : tile.id === 'faq'
                                  ? '#8B5CF6'
                                  : tile.id === 'placed_students'
                                    ? '#10B981'
                                    : tile.id === 'mock_tests'
                                      ? '#8B5CF6'
                                      : tile.id === 'trusted_partners'
                                        ? '#06B6D4'
                                        : tile.id === 'about'
                                          ? '#6366F1'
                                          : tile.id === 'contact'
                                            ? '#F43F5E'
                                            : '#2563EB',
                      }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'relative flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-2xl 2xl:h-16 2xl:w-16',
                        'dark:h-9 dark:w-9 dark:rounded-xl sm:dark:h-11 sm:dark:w-11 sm:dark:rounded-xl 2xl:dark:h-12 2xl:dark:w-12',
                        tone.iconWrap,
                        active && 'scale-105'
                      )}
                    >
                      <CategoryIcon
                        id={tile.id}
                        active={active}
                        className="h-7 w-7 sm:h-9 sm:w-9 2xl:h-10 2xl:w-10 dark:h-5 dark:w-5 sm:dark:h-6 sm:dark:w-6 2xl:dark:h-7 2xl:dark:w-7"
                      />
                    </span>
                    <span
                      className={cn(
                        'relative line-clamp-2 min-h-[2.2em] text-[10px] font-bold leading-tight tracking-tight sm:text-[12px] 2xl:text-[13px]',
                        active
                          ? 'text-gray-900 dark:text-[#F4F6FA]'
                          : 'text-gray-700 group-hover:text-gray-900 dark:text-[#93A0BD] dark:group-hover:text-[#F4F6FA]'
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
                <section id="hub-jobs" className="scroll-mt-28">
                  <HubSectionHeader
                    title="Jobs"
                    count={jobs.length}
                    viewAllHref={jobsViewAllHref}
                    viewAllLabel="View all"
                    subtitle="Fresh roles from hiring partners on Disha."
                  />
                  {jobs.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-[#1A2233] dark:bg-[#141A29]">
                      No jobs yet.{' '}
                      <Link href="/jobs" className="font-medium text-primary-600 hover:underline">
                        Browse jobs
                      </Link>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-4">
                      {jobs.slice(0, 4).map((job, i) => (
                        <HubJobCard
                          key={job.id}
                          job={job}
                          index={i}
                          onView={() => handleJobView(job)}
                          onApply={() => handleJobApply(job)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section id="hub-events" className="scroll-mt-28">
                  <HubSectionHeader
                    title="Events"
                    count={events.length}
                    viewAllHref="/events"
                    viewAllLabel="View all"
                    subtitle="Hackathons, workshops, and campus competitions."
                  />
                  {events.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-[#1A2233] dark:bg-[#141A29]">
                      No events yet.{' '}
                      <Link href="/events" className="font-medium text-primary-600 hover:underline">
                        Browse events
                      </Link>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-4">
                      {events.slice(0, 4).map((event, i) => (
                        <HubEventCard key={event.id} event={event} index={i} />
                      ))}
                    </div>
                  )}
                </section>

                <section id="hub-blogs" className="scroll-mt-28">
                  <HubSectionHeader
                    title="Blogs"
                    viewAllHref="/blogs"
                    viewAllLabel="View all"
                    subtitle="Career guides written for students — jobs, skills, placement & hiring trends."
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {featuredBlogs[0] && (
                      <Link
                        href={`/blogs/${featuredBlogs[0].slug}`}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/80 via-white to-sky-50/50 p-5 sm:p-6 lg:col-span-5 dark:border-primary-900/40 dark:from-primary-950/40 dark:via-gray-900 dark:to-sky-950/20"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Featured
                            </span>
                            <span className="text-[11px] font-medium text-primary-700/80 dark:text-primary-300">
                              {featuredBlogs[0].category}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight text-gray-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300 sm:text-xl">
                            {featuredBlogs[0].title}
                          </h3>
                          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            {featuredBlogs[0].metaDescription}
                          </p>
                        </div>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-gray-400">
                            {featuredBlogs[0].readTime}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600">
                            Read article
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    )}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1">
                      {featuredBlogs.slice(1, 3).map((post, i) => (
                        <Link
                          key={post.slug}
                          href={`/blogs/${post.slug}`}
                          className="group flex h-full gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-sm dark:border-[#1A2233] dark:bg-[#141A29] sm:p-5"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-primary-600 ring-1 ring-slate-100 dark:bg-gray-800 dark:ring-gray-700">
                            {String(i + 2).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                                {post.category}
                              </span>
                              <span className="text-[11px] text-gray-400">{post.readTime}</span>
                            </span>
                            <span className="mt-1.5 block text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                              {post.title}
                            </span>
                            <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                              {post.metaDescription}
                            </span>
                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                              Read more
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>

                <HubPlacedStudents
                  students={placedStudentsData.students}
                  subtitle={placedStudentsData.subtitle}
                />

                <div id="hub-trusted-partners" className="scroll-mt-28">
                  <HubTrustedLogos companies={companies} />
                </div>

                <HubWhyDisha />

                <section id="hub-faq" className="scroll-mt-28">
                  <div className="mb-5">
                    <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
                      <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
                      FAQ
                    </h2>
                    <p className="mt-1.5 pl-3.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                      Answers from Disha career guides — jobs, skills, AI hiring & campus prep.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {HUB_HOME_FAQS.map((item, index) => (
                      <details
                        key={item.q}
                        className="group rounded-2xl border border-gray-200 bg-white px-4 py-3.5 open:border-primary-200 open:shadow-sm dark:border-[#1A2233] dark:bg-[#141A29] dark:open:border-primary-800"
                      >
                        <summary className="cursor-pointer list-none marker:content-none">
                          <span className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                              {item.q}
                            </span>
                            <span className="mt-0.5 text-base leading-none text-gray-400 transition group-open:rotate-45">
                              +
                            </span>
                          </span>
                        </summary>
                        <p className="mt-2.5 pl-9 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
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
                          onView={() => handleJobView(item.job)}
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
                    <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-[#1A2233] dark:bg-[#141A29]">
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
                          onView={() => handleJobView(job)}
                          onApply={() => handleJobApply(job)}
                        />
                      ))}
                    </div>
                  ))}

                {tab === 'events' &&
                  (eventsToShow.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-[#1A2233] dark:bg-[#141A29]">
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
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center dark:border-[#1A2233] dark:bg-[#141A29]">
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
