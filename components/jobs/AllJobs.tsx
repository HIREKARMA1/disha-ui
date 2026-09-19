"use client"

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Search, Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { StickyFilterPanel } from '@/components/ui/StickyFilterPanel'
import { JobCard } from '@/components/dashboard/JobCard'
import { QuickApplyModal } from '@/components/jobs/QuickApplyModal'
import { PostQuickApplySkillsNudgeDialog } from '@/components/jobs/PostQuickApplySkillsNudgeDialog'
import { JobsLinkedInRightRail } from '@/components/jobs/JobsLinkedInRightRail'
import {
  JobsFilterFields,
  EMPTY_JOB_FILTERS,
  toApiDatePosted,
  type JobsFilterValues,
  type DatePostedFilter,
} from '@/components/jobs/JobsFilterFields'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { profileService } from '@/services/profileService'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import {
  JOB_CLOSED_MESSAGE,
  PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE,
  getPassoutBatchApplyEligibility,
  clearAutoApplyQueryParams,
} from '@/lib/jobApplicationMessages'
import { getSavedJobIds, SAVED_JOBS_EVENT } from '@/lib/savedJobs'
import { peekPendingJobApplication } from '@/lib/pendingJobApplication'
import {
    canPersonalizeJobs,
    buildPreferencesSummary,
    rankJobsBySkills,
    type StudentMatchProfile,
} from '@/lib/jobSkillMatch'
import { shouldShowPostApplySkillsNudge } from '@/lib/profileCompletion'

export interface Job {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: string
    status: string
    location: string | string[]
    remote_work: boolean
    travel_required: boolean
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    education_level?: string | string[]
    skills_required?: string[]
    application_deadline?: string
    max_applications: number
    current_applications: number
    industry?: string
    selection_process?: string
    is_campus_drive?: boolean
    campus_drive_date?: string
    views_count: number
    applications_count: number
    created_at: string
    corporate_id?: string | null
    corporate_name?: string
    university_id?: string | null
    is_active: boolean
    can_apply: boolean
    application_status?: string
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    expiration_date?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    onsite_office?: boolean
    mode_of_work?: string
    education_degree?: string | string[]
    education_branch?: string | string[]
    passout_batches?: string | string[]
    company_name?: string
    company_logo?: string
    company_website?: string
    company_address?: string
    company_size?: string
    company_type?: string
    company_founded?: number
    company_description?: string
    contact_person?: string
    contact_designation?: string
    /** SEO slug from API: "{company}/{role}" */
    slug?: string | null
    is_public?: boolean | null
    public_access_level?: string | null
    assigned_university_ids?: string[] | null
}

interface JobSearchResponse {
    jobs: Job[]
    total_count: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

type CategoryChip = 'all' | 'open' | 'closed' | 'public' | 'campus_drive' | 'saved'
type JobStatusFilter = 'all' | 'open' | 'closed'

const CATEGORY_CHIPS: readonly { value: CategoryChip; label: string }[] = [
    { value: 'all', label: 'All Jobs' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'public', label: 'Public Jobs' },
    { value: 'campus_drive', label: 'Campus Drive' },
    { value: 'saved', label: 'Saved' },
]

const MAX_SEARCH_SUGGESTIONS = 8

const JOB_SEARCH_SUGGESTIONS: readonly string[] = [
    'Data Analyst',
    'Data Science',
    'Data Scientist',
    'Data Engineer',
    'Database Administrator',
    'Software Engineer',
    'Software Developer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Web Developer',
    'Mobile Developer',
    'Android Developer',
    'iOS Developer',
    'React Developer',
    'Python Developer',
    'Java Developer',
    'Machine Learning Engineer',
    'AI Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Business Analyst',
    'Product Manager',
    'Project Manager',
    'UI/UX Designer',
    'Graphic Designer',
    'QA Engineer',
    'Test Engineer',
    'Cyber Security Analyst',
    'Network Engineer',
    'System Administrator',
    'HR Executive',
    'Digital Marketing',
    'Content Writer',
    'Sales Executive',
    'Customer Support',
    'Internship',
    'Campus Drive',
    'Python',
    'JavaScript',
    'React',
    'SQL',
    'AWS',
    'Machine Learning',
]

function suggestionMatchesQuery(text: string, query: string): boolean {
    const t = text.toLowerCase()
    const q = query.toLowerCase()
    if (t.startsWith(q)) return true
    return t.split(/[\s/+\-_,.()]+/).some((word) => word.startsWith(q))
}

function collectJobSuggestionPool(jobs: Job[]): string[] {
    const seen = new Set<string>()
    const out: string[] = []
    const add = (raw?: string | null) => {
        const value = raw?.trim()
        if (!value) return
        const key = value.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        out.push(value)
    }

    for (const job of jobs) {
        add(job.title)
        add(job.company_name)
        add(job.corporate_name)
        add(job.industry)
        for (const skill of job.skills_required || []) add(skill)
    }

    return out
}

function filterJobSuggestions(query: string, fromJobs: string[]): string[] {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const seen = new Set<string>()
    const ranked: { value: string; score: number }[] = []

    const consider = (value: string, fromLiveJob: boolean) => {
        if (!suggestionMatchesQuery(value, q)) return
        const key = value.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        const lower = value.toLowerCase()
        let score = fromLiveJob ? 0 : 20
        if (lower.startsWith(q)) score -= 10
        score += Math.min(value.length, 40)
        ranked.push({ value, score })
    }

    fromJobs.forEach((value) => consider(value, true))
    JOB_SEARCH_SUGGESTIONS.forEach((value) => consider(value, false))

    ranked.sort((a, b) => a.score - b.score)
    return ranked.slice(0, MAX_SEARCH_SUGGESTIONS).map((item) => item.value)
}

function highlightSuggestion(text: string, query: string) {
    const q = query.trim()
    if (!q) return text
    const index = text.toLowerCase().indexOf(q.toLowerCase())
    if (index < 0) return text
    return (
        <>
            {text.slice(0, index)}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
                {text.slice(index, index + q.length)}
            </span>
            {text.slice(index + q.length)}
        </>
    )
}

function parseFiltersFromParams(params: URLSearchParams): {
    searchTerm: string
    filters: JobsFilterValues
    datePostedFilter: DatePostedFilter
    jobStatusFilter: JobStatusFilter
    categoryChip: CategoryChip
    page: number
} {
    const dateRaw = params.get('date') || 'all'
    const datePostedFilter: DatePostedFilter =
        dateRaw === '24h' || dateRaw === '7d' || dateRaw === '15d' || dateRaw === '30d'
            ? dateRaw
            : 'all'

    const statusRaw = params.get('status') || 'all'
    const jobStatusFilter: JobStatusFilter =
        statusRaw === 'open' || statusRaw === 'closed' ? statusRaw : 'all'

    const categoryRaw = params.get('category') || 'all'
    const categoryChip: CategoryChip =
        categoryRaw === 'all' ||
        categoryRaw === 'open' ||
        categoryRaw === 'closed' ||
        categoryRaw === 'public' ||
        categoryRaw === 'campus_drive' ||
        categoryRaw === 'saved'
            ? categoryRaw
            : 'all'

    const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)

    return {
        searchTerm: params.get('q') || '',
        filters: {
            location: params.get('location') || '',
            industry: params.get('industry') || '',
            job_type: params.get('job_type') || '',
            remote_work: params.get('remote_work') || '',
            experience_min: params.get('experience_min') || '',
            experience_max: params.get('experience_max') || '',
            salary_min: params.get('salary_min') || '',
            salary_max: params.get('salary_max') || '',
            skills: params.get('skills') || '',
        },
        datePostedFilter,
        jobStatusFilter,
        categoryChip,
        page,
    }
}

function buildJobsQueryString(opts: {
    searchTerm: string
    filters: JobsFilterValues
    datePostedFilter: DatePostedFilter
    jobStatusFilter: JobStatusFilter
    categoryChip: CategoryChip
    page: number
    jobId?: string | null
}): string {
    const params = new URLSearchParams()
    if (opts.searchTerm.trim()) params.set('q', opts.searchTerm.trim())
    Object.entries(opts.filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
    })
    if (opts.datePostedFilter !== 'all') params.set('date', opts.datePostedFilter)
    if (opts.jobStatusFilter !== 'all') params.set('status', opts.jobStatusFilter)
    if (opts.categoryChip !== 'all') params.set('category', opts.categoryChip)
    if (opts.page > 1) params.set('page', String(opts.page))
    if (opts.jobId) params.set('jobId', opts.jobId)
    return params.toString()
}

function isJobOpen(job: Job): boolean {
    if (!job.can_apply || !job.is_active) return false
    if (job.application_deadline) {
        return new Date(job.application_deadline) > new Date()
    }
    return true
}

function normalizePublicJob(job: Job): Job {
    return {
        ...job,
        title: String(job.title || ''),
        description: String(job.description || ''),
        job_type: String(job.job_type || ''),
        status: String(job.status || ''),
        location: String(job.location || ''),
        remote_work: Boolean(job.remote_work),
        travel_required: Boolean(job.travel_required),
        salary_currency: String(job.salary_currency || 'INR'),
        created_at: String(job.created_at || ''),
        is_active: Boolean(job.is_active),
        can_apply: Boolean(job.can_apply),
        salary_min: job.salary_min ? Number(job.salary_min) : undefined,
        salary_max: job.salary_max ? Number(job.salary_max) : undefined,
        experience_min: job.experience_min ? Number(job.experience_min) : undefined,
        experience_max: job.experience_max ? Number(job.experience_max) : undefined,
        skills_required: Array.isArray(job.skills_required)
            ? job.skills_required.map(String)
            : [],
        application_deadline: job.application_deadline
            ? String(job.application_deadline)
            : undefined,
        max_applications: Number(job.max_applications || 0),
        current_applications: Number(job.current_applications || 0),
        industry: job.industry ? String(job.industry) : undefined,
        corporate_name: job.corporate_name ? String(job.corporate_name) : undefined,
        company_name: job.company_name ? String(job.company_name) : undefined,
        is_public: job.is_public ?? undefined,
        public_access_level: job.public_access_level
            ? String(job.public_access_level)
            : undefined,
        assigned_university_ids: Array.isArray(job.assigned_university_ids)
            ? job.assigned_university_ids.map(String)
            : job.assigned_university_ids ?? undefined,
        is_campus_drive: Boolean(job.is_campus_drive),
        campus_drive_date: job.campus_drive_date ? String(job.campus_drive_date) : undefined,
    }
}

function applyClientJobFilters(
    jobs: Job[],
    activeStatus: JobStatusFilter,
    activeDate: DatePostedFilter
): Job[] {
    let validatedJobs = jobs

    if (activeStatus === 'open') {
        validatedJobs = validatedJobs.filter(isJobOpen)
    } else if (activeStatus === 'closed') {
        validatedJobs = validatedJobs.filter((job) => !isJobOpen(job))
    }

    if (activeDate !== 'all') {
        const now = Date.now()
        const filterHours: Record<string, number> = {
            '24h': 24,
            '7d': 24 * 7,
            '15d': 24 * 15,
            '30d': 24 * 30,
        }
        const hours = filterHours[activeDate] || 0
        validatedJobs = validatedJobs.filter((job) => {
            if (!job.created_at) return false
            const hoursDiff = (now - new Date(job.created_at).getTime()) / (1000 * 60 * 60)
            return hoursDiff <= hours
        })
    }

    validatedJobs.sort((a, b) => {
        // Open jobs first, closed last; preserve newest-first within each group.
        const aOpen = isJobOpen(a) ? 0 : 1
        const bOpen = isJobOpen(b) ? 0 : 1
        if (aOpen !== bOpen) return aOpen - bOpen
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
    })

    return validatedJobs
}

function deepCleanObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj
    if (typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(deepCleanObject)
    if ('type' in (obj as object) && 'loc' in (obj as object) && 'msg' in (obj as object)) return null
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
            cleaned[key] = null
        } else if (value && typeof value === 'object') {
            cleaned[key] = deepCleanObject(value)
        } else {
            cleaned[key] = value
        }
    }
    return cleaned
}

export function AllJobs() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { openLoginModal } = useAuthLoginModal()
    const initial = useMemo(() => parseFiltersFromParams(searchParams), []) // eslint-disable-line react-hooks/exhaustive-deps

    const [jobs, setJobs] = useState<Job[]>([])
    /** Full filtered job list — used to rank then client-paginate for 75%+ students */
    const [jobsPool, setJobsPool] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(initial.searchTerm)
    const [suggestionsOpen, setSuggestionsOpen] = useState(false)
    const [activeSuggestion, setActiveSuggestion] = useState(-1)
    const [pagination, setPagination] = useState({
        page: initial.page,
        limit: 12,
        total: 0,
        total_pages: 0,
    })

    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [showQuickApplyModal, setShowQuickApplyModal] = useState(false)
    const [showApplyFormInPanel, setShowApplyFormInPanel] = useState(false)
    const [desktopFilterOpen, setDesktopFilterOpen] = useState(false)
    const [showSkillsNudge, setShowSkillsNudge] = useState(false)
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
    const pendingApplyOpened = useRef(false)

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [studentProfile, setStudentProfile] = useState<{
        degree?: string
        branch?: string
        university_id?: string | null
        graduation_year?: number
        batch?: string
    } | null>(null)
    const [matchProfile, setMatchProfile] = useState<StudentMatchProfile | null>(null)
    const [suggestionReady, setSuggestionReady] = useState(false)

    const [filterSheetOpen, setFilterSheetOpen] = useState(false)
    const [jobStatusFilter, setJobStatusFilter] = useState<JobStatusFilter>(initial.jobStatusFilter)
    const [categoryChip, setCategoryChip] = useState<CategoryChip>(initial.categoryChip)
    const [datePostedFilter, setDatePostedFilter] = useState<DatePostedFilter>(initial.datePostedFilter)
    const [filters, setFilters] = useState<JobsFilterValues>(initial.filters)

    /** Draft filters inside the bottom sheet (applied on Apply). */
    const [draftFilters, setDraftFilters] = useState<JobsFilterValues>(initial.filters)
    const [draftDatePosted, setDraftDatePosted] = useState<DatePostedFilter>(initial.datePostedFilter)

    /** When true, next searchParams effect is from our own navigation — skip re-parse. */
    const ignoreUrlEffect = useRef(false)
    const fetchIdRef = useRef(0)
    const didMountFetch = useRef(false)
    const searchBoxRef = useRef<HTMLDivElement>(null)

    const jobSuggestionPool = useMemo(
        () => collectJobSuggestionPool(jobsPool.length > 0 ? jobsPool : jobs),
        [jobsPool, jobs]
    )
    const personalizeFeed = canPersonalizeJobs(matchProfile)
    /** 75%+ suggestion-ready: rank entire pool desc by match, then paginate (keep page controls). */
    const useRankedPagination = Boolean(
        suggestionReady && personalizeFeed && matchProfile
    )

    const rankedPool = useMemo(() => {
        const source = useRankedPagination
            ? jobsPool
            : jobs
        if (!personalizeFeed || !matchProfile) {
            return source.map((job) => ({
                ...job,
                match_score: 0,
                matched_skills: [] as string[],
            }))
        }
        return rankJobsBySkills(source, matchProfile)
    }, [jobs, jobsPool, matchProfile, personalizeFeed, useRankedPagination])

    const displayJobs = useMemo(() => {
        if (!useRankedPagination) return rankedPool
        const pageSize = pagination.limit || 12
        const page = Math.max(1, pagination.page || 1)
        const start = (page - 1) * pageSize
        return rankedPool.slice(start, start + pageSize)
    }, [rankedPool, useRankedPagination, pagination.page, pagination.limit])

    const preferencesSummary = useMemo(
        () => (matchProfile && personalizeFeed ? buildPreferencesSummary(matchProfile) : ''),
        [matchProfile, personalizeFeed]
    )
    const matchedCount = useMemo(
        () => rankedPool.filter((j) => j.match_score >= 1).length,
        [rankedPool]
    )
    const searchSuggestions = useMemo(
        () => filterJobSuggestions(searchTerm, jobSuggestionPool),
        [searchTerm, jobSuggestionPool]
    )
    const showSearchSuggestions =
        suggestionsOpen && searchTerm.trim().length >= 1 && searchSuggestions.length > 0

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            if (!searchBoxRef.current?.contains(event.target as Node)) {
                setSuggestionsOpen(false)
                setActiveSuggestion(-1)
            }
        }
        document.addEventListener('mousedown', onPointerDown)
        return () => document.removeEventListener('mousedown', onPointerDown)
    }, [])

    const activeFilterCount = useMemo(() => {
        let count = Object.values(filters).filter(Boolean).length
        if (datePostedFilter !== 'all') count += 1
        return count
    }, [filters, datePostedFilter])

    const syncUrl = useCallback(
        (opts: {
            searchTerm: string
            filters: JobsFilterValues
            datePostedFilter: DatePostedFilter
            jobStatusFilter: JobStatusFilter
            categoryChip: CategoryChip
            page: number
            replace?: boolean
        }) => {
            const jobId = searchParams?.get('jobId')
            const qs = buildJobsQueryString({ ...opts, jobId })
            const href = qs ? `${pathname}?${qs}` : pathname
            ignoreUrlEffect.current = true
            if (opts.replace) {
                router.replace(href, { scroll: false })
            } else {
                router.push(href, { scroll: false })
            }
        },
        [pathname, router, searchParams]
    )

    const handleFilterChange = useCallback((key: keyof JobsFilterValues, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }, [])

    const handleDraftFilterChange = useCallback((key: keyof JobsFilterValues, value: string) => {
        setDraftFilters((prev) => ({ ...prev, [key]: value }))
    }, [])

    const fetchJobs = useCallback(
        async (
            page = 1,
            override?: {
                searchTerm?: string
                filters?: JobsFilterValues
                datePostedFilter?: DatePostedFilter
                jobStatusFilter?: JobStatusFilter
                categoryChip?: CategoryChip
            }
        ) => {
            const activeSearch = override?.searchTerm ?? searchTerm
            const activeFilters = override?.filters ?? filters
            const activeDate = override?.datePostedFilter ?? datePostedFilter
            const activeStatus = override?.jobStatusFilter ?? jobStatusFilter
            const activeCategory = override?.categoryChip ?? categoryChip
            const pageSize = pagination.limit
            const requestId = ++fetchIdRef.current

            const buildParams = (pageNum: number, limit: number) => {
                const params = new URLSearchParams()
                params.set('page', String(pageNum))
                params.set('limit', String(limit))
                params.set('sort_by', 'created_at')
                params.set('sort_order', 'desc')

                if (activeSearch.trim()) params.set('title', activeSearch.trim())

                Object.entries(activeFilters).forEach(([key, value]) => {
                    if (!value) return
                    if (key === 'skills') {
                        value
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean)
                            .forEach((skill: string) => params.append('skills', skill))
                        return
                    }
                    if (key === 'remote_work') {
                        params.set(key, value)
                        return
                    }
                    params.set(key, value)
                })

                const apiDate = toApiDatePosted(activeDate)
                if (apiDate && activeDate !== '15d') {
                    params.set('date_posted', apiDate)
                } else if (activeDate === '15d') {
                    params.set('date_posted', '30_days')
                }

                if (activeCategory === 'campus_drive') {
                    params.set('is_campus_drive', 'true')
                }

                if (activeCategory === 'public') {
                    params.set('is_public', 'true')
                }

                return params
            }

            const fetchPage = async (pageNum: number, limit: number) => {
                const response = await apiClient.client.get(`/public/jobs/?${buildParams(pageNum, limit)}`)
                const data = deepCleanObject(response.data) as JobSearchResponse
                return {
                    jobs: (data.jobs || []).map(normalizePublicJob),
                    page: data.page || pageNum,
                    limit: data.limit || limit,
                    total: data.total_count || 0,
                    total_pages: data.total_pages || 1,
                    has_next: Boolean(data.has_next),
                }
            }

            try {
                setLoading(true)

                if (activeCategory === 'saved') {
                    const savedIds = getSavedJobIds()
                    if (savedIds.length === 0) {
                        if (requestId !== fetchIdRef.current) return
                        setJobs([])
                        setJobsPool([])
                        setPagination({
                            page: 1,
                            limit: pageSize,
                            total: 0,
                            total_pages: 0,
                        })
                        return
                    }

                    const savedSet = new Set(savedIds)
                    const collected: Job[] = []
                    let pageNum = 1
                    let hasNext = true
                    const maxPages = 10

                    while (hasNext && collected.length < savedSet.size && pageNum <= maxPages) {
                        const result = await fetchPage(pageNum, 100)
                        if (requestId !== fetchIdRef.current) return
                        for (const job of result.jobs) {
                            if (savedSet.has(job.id) && !collected.some((j) => j.id === job.id)) {
                                collected.push(job)
                            }
                        }
                        hasNext = result.has_next
                        pageNum += 1
                    }

                    const validatedJobs = applyClientJobFilters(collected, activeStatus, activeDate)
                    // Keep saved order as a secondary key, but open jobs still come first.
                    validatedJobs.sort((a, b) => {
                        const aOpen = isJobOpen(a) ? 0 : 1
                        const bOpen = isJobOpen(b) ? 0 : 1
                        if (aOpen !== bOpen) return aOpen - bOpen
                        return savedIds.indexOf(b.id) - savedIds.indexOf(a.id)
                    })
                    const totalPages = Math.max(1, Math.ceil(validatedJobs.length / pageSize) || 0)
                    const safePage = Math.min(Math.max(1, page), totalPages || 1)
                    const start = (safePage - 1) * pageSize

                    setJobs(validatedJobs.slice(start, start + pageSize))
                    setPagination({
                        page: validatedJobs.length === 0 ? 1 : safePage,
                        limit: pageSize,
                        total: validatedJobs.length,
                        total_pages: validatedJobs.length === 0 ? 0 : totalPages,
                    })
                    return
                }

                // 75%+ students: load full result set, rank by match desc, then client-paginate
                const rankAllPages =
                    suggestionReady && canPersonalizeJobs(matchProfile) && Boolean(matchProfile)

                if (rankAllPages) {
                    const collected: Job[] = []
                    let pageNum = 1
                    let hasNext = true
                    const maxPages = 30
                    const seen = new Set<string>()

                    while (hasNext && pageNum <= maxPages) {
                        const result = await fetchPage(pageNum, 50)
                        if (requestId !== fetchIdRef.current) return
                        for (const job of result.jobs) {
                            if (!seen.has(job.id)) {
                                seen.add(job.id)
                                collected.push(job)
                            }
                        }
                        hasNext = result.has_next
                        if (result.jobs.length === 0) break
                        pageNum += 1
                    }

                    const validatedJobs = applyClientJobFilters(
                        collected,
                        activeStatus,
                        activeDate
                    )
                    setJobsPool(validatedJobs)

                    const ranked = rankJobsBySkills(validatedJobs, matchProfile!)
                    const totalPages = Math.max(1, Math.ceil(ranked.length / pageSize) || 0)
                    const safePage = Math.min(Math.max(1, page), totalPages || 1)
                    const start = (safePage - 1) * pageSize

                    setJobs(ranked.slice(start, start + pageSize))
                    setPagination({
                        page: ranked.length === 0 ? 1 : safePage,
                        limit: pageSize,
                        total: ranked.length,
                        total_pages: ranked.length === 0 ? 0 : totalPages,
                    })
                    return
                }

                const result = await fetchPage(page, pageSize)
                if (requestId !== fetchIdRef.current) return

                const validatedJobs = applyClientJobFilters(result.jobs, activeStatus, activeDate)
                setJobsPool([])
                setJobs(validatedJobs)
                setPagination({
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    total_pages: result.total_pages,
                })
            } catch (error) {
                if (requestId !== fetchIdRef.current) return
                console.error('Error fetching jobs:', error)
                toast.error('Failed to load jobs')
                setJobs([])
                setJobsPool([])
            } finally {
                if (requestId === fetchIdRef.current) setLoading(false)
            }
        },
        [
            searchTerm,
            filters,
            datePostedFilter,
            jobStatusFilter,
            categoryChip,
            pagination.limit,
            suggestionReady,
            matchProfile,
        ]
    )

    const applyFiltersAndFetch = useCallback(
        (next: {
            searchTerm?: string
            filters?: JobsFilterValues
            datePostedFilter?: DatePostedFilter
            jobStatusFilter?: JobStatusFilter
            categoryChip?: CategoryChip
            page?: number
            replaceUrl?: boolean
        }) => {
            const resolved = {
                searchTerm: next.searchTerm ?? searchTerm,
                filters: next.filters ?? filters,
                datePostedFilter: next.datePostedFilter ?? datePostedFilter,
                jobStatusFilter: next.jobStatusFilter ?? jobStatusFilter,
                categoryChip: next.categoryChip ?? categoryChip,
                page: next.page ?? 1,
            }

            if (next.searchTerm !== undefined) setSearchTerm(resolved.searchTerm)
            if (next.filters !== undefined) setFilters(resolved.filters)
            if (next.datePostedFilter !== undefined) setDatePostedFilter(resolved.datePostedFilter)
            if (next.jobStatusFilter !== undefined) setJobStatusFilter(resolved.jobStatusFilter)
            if (next.categoryChip !== undefined) setCategoryChip(resolved.categoryChip)
            setPagination((prev) => ({ ...prev, page: resolved.page }))

            syncUrl({ ...resolved, replace: next.replaceUrl })
            void fetchJobs(resolved.page, {
                searchTerm: resolved.searchTerm,
                filters: resolved.filters,
                datePostedFilter: resolved.datePostedFilter,
                jobStatusFilter: resolved.jobStatusFilter,
                categoryChip: resolved.categoryChip,
            })
        },
        [
            searchTerm,
            filters,
            datePostedFilter,
            jobStatusFilter,
            categoryChip,
            syncUrl,
            fetchJobs,
        ]
    )

    const clearFilters = useCallback(() => {
        const cleared = { ...EMPTY_JOB_FILTERS }
        setDraftFilters(cleared)
        setDraftDatePosted('all')
        applyFiltersAndFetch({
            searchTerm: '',
            filters: cleared,
            datePostedFilter: 'all',
            jobStatusFilter: 'all',
            categoryChip: 'all',
            page: 1,
            replaceUrl: true,
        })
        setFilterSheetOpen(false)
    }, [applyFiltersAndFetch])

    const openFilterSheet = () => {
        setDraftFilters(filters)
        setDraftDatePosted(datePostedFilter)
        setFilterSheetOpen(true)
    }

    const applySheetFilters = () => {
        applyFiltersAndFetch({
            filters: draftFilters,
            datePostedFilter: draftDatePosted,
            page: 1,
        })
        setFilterSheetOpen(false)
    }

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = apiClient.getAccessToken()
            if (token) {
                setIsLoggedIn(true)
                try {
                    const [profile, completion] = await Promise.all([
                        profileService.getProfile(),
                        profileService.getProfileCompletion().catch(() => null),
                    ])
                    setStudentProfile({
                        degree: profile.degree,
                        branch: profile.branch,
                        university_id: profile.university_id || null,
                        graduation_year: profile.graduation_year,
                        batch: (profile as { batch?: string }).batch,
                    })
                    setMatchProfile({
                        technical_skills: profile.technical_skills,
                        soft_skills: profile.soft_skills,
                        preferred_industry: profile.preferred_industry,
                        job_roles_of_interest: profile.job_roles_of_interest,
                        location_preferences: profile.location_preferences,
                    })
                    setSuggestionReady(
                        Boolean(
                            completion?.suggestion_ready ||
                                ((completion?.completion_percentage ?? 0) >= 75 &&
                                    profile.technical_skills &&
                                    profile.soft_skills &&
                                    profile.preferred_industry)
                        )
                    )
                } catch {
                    // Silent fail
                }
            }
        }
        void checkLoginStatus()
    }, [])

    // Once profile is suggestion-ready (~75%), reload with full ranked pagination
    const rankedFetchDone = useRef(false)
    useEffect(() => {
        if (!suggestionReady || !canPersonalizeJobs(matchProfile)) return
        if (rankedFetchDone.current) return
        rankedFetchDone.current = true
        void fetchJobs(pagination.page || 1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestionReady, matchProfile])

    // Initial load + browser back/forward restore from query params
    useEffect(() => {
        if (ignoreUrlEffect.current) {
            ignoreUrlEffect.current = false
            return
        }

        const parsed = parseFiltersFromParams(searchParams)
        setSearchTerm(parsed.searchTerm)
        setFilters(parsed.filters)
        setDatePostedFilter(parsed.datePostedFilter)
        setJobStatusFilter(parsed.jobStatusFilter)
        setCategoryChip(parsed.categoryChip)
        setDraftFilters(parsed.filters)
        setDraftDatePosted(parsed.datePostedFilter)
        setPagination((prev) => ({ ...prev, page: parsed.page }))

        // Avoid duplicate fetch if applyFiltersAndFetch already ran for same navigation
        if (!didMountFetch.current) {
            didMountFetch.current = true
            void fetchJobs(parsed.page, {
                searchTerm: parsed.searchTerm,
                filters: parsed.filters,
                datePostedFilter: parsed.datePostedFilter,
                jobStatusFilter: parsed.jobStatusFilter,
                categoryChip: parsed.categoryChip,
            })
            return
        }

        void fetchJobs(parsed.page, {
            searchTerm: parsed.searchTerm,
            filters: parsed.filters,
            datePostedFilter: parsed.datePostedFilter,
            jobStatusFilter: parsed.jobStatusFilter,
            categoryChip: parsed.categoryChip,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    useEffect(() => {
        const onSavedJobsChanged = () => {
            if (categoryChip !== 'saved') return
            void fetchJobs(pagination.page, { categoryChip: 'saved' })
        }
        window.addEventListener(SAVED_JOBS_EVENT, onSavedJobsChanged)
        return () => window.removeEventListener(SAVED_JOBS_EVENT, onSavedJobsChanged)
    }, [categoryChip, fetchJobs, pagination.page])

    // Open dedicated job detail page from deep link (?jobId=)
    useEffect(() => {
        const jobId = searchParams?.get('jobId')
        if (!jobId || loading || jobs.length === 0) return
        const match = jobs.find((j) => j.id === jobId)
        if (match) {
            router.replace(getJobDetailPath(match))
        }
    }, [
        searchParams,
        jobs,
        loading,
        router,
        pathname,
        searchTerm,
        filters,
        datePostedFilter,
        jobStatusFilter,
        categoryChip,
        pagination.page,
    ])

    const pickSearchSuggestion = (value: string) => {
        setSearchTerm(value)
        setSuggestionsOpen(false)
        setActiveSuggestion(-1)
        applyFiltersAndFetch({ searchTerm: value, page: 1 })
    }

    const handleSearch = (e?: FormEvent) => {
        e?.preventDefault()
        setSuggestionsOpen(false)
        setActiveSuggestion(-1)
        applyFiltersAndFetch({ searchTerm, page: 1 })
    }

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showSearchSuggestions) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveSuggestion((prev) => (prev + 1) % searchSuggestions.length)
            return
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveSuggestion((prev) =>
                prev <= 0 ? searchSuggestions.length - 1 : prev - 1
            )
            return
        }
        if (e.key === 'Escape') {
            setSuggestionsOpen(false)
            setActiveSuggestion(-1)
            return
        }
        if (e.key === 'Enter' && activeSuggestion >= 0 && searchSuggestions[activeSuggestion]) {
            e.preventDefault()
            pickSearchSuggestion(searchSuggestions[activeSuggestion])
        }
    }

    const handleCategoryChange = (value: CategoryChip) => {
        const nextStatus: JobStatusFilter =
            value === 'open' || value === 'closed' ? value : 'all'
        applyFiltersAndFetch({
            categoryChip: value,
            jobStatusFilter: nextStatus,
            page: 1,
        })
    }

    const handleDesktopDateChange = (value: DatePostedFilter) => {
        applyFiltersAndFetch({ datePostedFilter: value, page: 1 })
    }

    const handleDesktopShowResults = () => {
        applyFiltersAndFetch({ filters, datePostedFilter, page: 1 })
    }

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }))
        syncUrl({
            searchTerm,
            filters,
            datePostedFilter,
            jobStatusFilter,
            categoryChip,
            page,
        })
        // Ranked mode: pool already loaded — only change page slice (no API refetch)
        if (useRankedPagination && jobsPool.length > 0) {
            return
        }
        void fetchJobs(page)
    }

    // After login/register from Quick Apply on /jobs: open right-rail form
    useEffect(() => {
        if (pendingApplyOpened.current || !isLoggedIn || loading || displayJobs.length === 0) return
        if (typeof window === 'undefined') return
        const params = new URLSearchParams(window.location.search)
        if (params.get('auto_apply') !== '1') return
        const pending = peekPendingJobApplication()
        if (!pending?.jobId) {
            clearAutoApplyQueryParams()
            return
        }
        const match = displayJobs.find((j) => j.id === pending.jobId)
        if (!match) return
        pendingApplyOpened.current = true
        clearAutoApplyQueryParams()
        setSelectedJob(match)
        setDesktopFilterOpen(false)
        setShowApplyFormInPanel(false)
        setShowQuickApplyModal(true)
    }, [isLoggedIn, loading, displayJobs])

    // Default right panel: first job in the (possibly ranked) list
    useEffect(() => {
        if (loading || displayJobs.length === 0) return
        setSelectedJob((prev) => {
            if (prev && displayJobs.some((j) => j.id === prev.id)) {
                return displayJobs.find((j) => j.id === prev.id) ?? prev
            }
            return displayJobs[0]
        })
    }, [loading, displayJobs])

    const selectJobForPanel = (job: Job) => {
        setSelectedJob(job)
        setDesktopFilterOpen(false)
        setShowApplyFormInPanel(false)
    }

    const handleApplyClick = (job: Job) => {
        const isDesktop =
            typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

        if (!isLoggedIn) {
            const returnPath = isDesktop ? '/jobs' : getJobDetailPath(job)
            if (isDesktop) {
                setSelectedJob(job)
                setDesktopFilterOpen(false)
            }
            openLoginModal({
                redirect: prepareGuestApplyForLogin(job.id, returnPath),
                preferredType: 'student',
            })
            return
        }

        if (!job.can_apply) {
            toast.error(JOB_CLOSED_MESSAGE)
            return
        }

        const batchEligibility = getPassoutBatchApplyEligibility({
            passoutBatches: job.passout_batches,
            isAuthenticatedStudent: isLoggedIn,
            studentGraduationYear: studentProfile?.graduation_year,
            studentBatch: studentProfile?.batch,
        })
        if (!batchEligibility.canApply) {
            toast.error(batchEligibility.reason || PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE)
            return
        }

        setSelectedJob(job)
        setDesktopFilterOpen(false)
        setShowApplyFormInPanel(false)
        setShowQuickApplyModal(true)
    }

    const handleQuickApplySuccess = () => {
        if (!selectedJob) return
        const jobId = selectedJob.id
        setShowQuickApplyModal(false)
        setShowApplyFormInPanel(false)
        setJobs((prevJobs) =>
            prevJobs.map((job) =>
                job.id === jobId
                    ? { ...job, application_status: 'applied', can_apply: false }
                    : job
            )
        )
        setJobsPool((prevJobs) =>
            prevJobs.map((job) =>
                job.id === jobId
                    ? { ...job, application_status: 'applied', can_apply: false }
                    : job
            )
        )
        setSelectedJob((prev) =>
            prev && prev.id === jobId
                ? { ...prev, application_status: 'applied', can_apply: false }
                : prev
        )
        setApplyingJobId(null)
        void (async () => {
            try {
                const completion = await profileService.getProfileCompletion()
                if (shouldShowPostApplySkillsNudge(completion)) {
                    setShowSkillsNudge(true)
                }
            } catch {
                // Skip nudge if we can't verify — avoid prompting complete profiles
            }
        })()
        void fetchJobs(pagination.page)
    }

    return (
        <div className="w-full overflow-x-hidden">
            <div className="mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {personalizeFeed ? 'Jobs based on your preferences' : 'Live Jobs'}
                </h1>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    {personalizeFeed
                        ? preferencesSummary
                        : 'Discover and apply to the best job opportunities.'}
                </p>
                {personalizeFeed && (
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 sm:text-xs">
                        {useRankedPagination
                            ? matchedCount > 0
                                ? `${matchedCount} match${matchedCount === 1 ? '' : 'es'} · sorted highest to lowest · page 1 starts at the best fit`
                                : 'Sorted by best fit to your profile'
                            : matchedCount > 0
                              ? `${matchedCount} match${matchedCount === 1 ? '' : 'es'} · ranked by your skills — reach ~75% profile for full ranked pages`
                              : 'Add skills to rank jobs by fit'}
                    </p>
                )}
            </div>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start lg:gap-4">
                <div className="min-w-0">
                    {/* Search + mobile filter */}
                    <div className="mb-3 rounded-xl border border-gray-200/70 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-[#151b2b]/90 sm:mb-4 sm:rounded-2xl sm:p-4">
                        <form
                            onSubmit={handleSearch}
                            className="flex gap-1.5 sm:gap-3"
                        >
                            <div ref={searchBoxRef} className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-4 sm:w-4" />
                                <Input
                                    type="text"
                                    role="combobox"
                                    aria-expanded={showSearchSuggestions}
                                    aria-controls="jobs-search-suggestions"
                                    aria-autocomplete="list"
                                    aria-activedescendant={
                                        activeSuggestion >= 0
                                            ? `jobs-search-option-${activeSuggestion}`
                                            : undefined
                                    }
                                    autoComplete="off"
                                    placeholder="Search for jobs, roles, skills or companies..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setSuggestionsOpen(true)
                                        setActiveSuggestion(-1)
                                    }}
                                    onFocus={() => {
                                        if (searchTerm.trim().length >= 1) setSuggestionsOpen(true)
                                    }}
                                    onKeyDown={handleSearchKeyDown}
                                    className="h-9 rounded-lg border-gray-200 bg-white pl-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 dark:border-white/10 dark:bg-[#0f1219] sm:h-10 sm:rounded-xl sm:pl-9"
                                />
                                {showSearchSuggestions && (
                                    <ul
                                        id="jobs-search-suggestions"
                                        role="listbox"
                                        className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#151b2b]"
                                    >
                                        {searchSuggestions.map((suggestion, index) => (
                                            <li
                                                key={suggestion}
                                                id={`jobs-search-option-${index}`}
                                                role="option"
                                                aria-selected={index === activeSuggestion}
                                                className={`cursor-pointer px-3 py-2 text-sm ${
                                                    index === activeSuggestion
                                                        ? 'bg-blue-50 text-gray-900 dark:bg-blue-500/15 dark:text-white'
                                                        : 'text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5'
                                                }`}
                                                onMouseDown={(event) => event.preventDefault()}
                                                onMouseEnter={() => setActiveSuggestion(index)}
                                                onClick={() => pickSearchSuggestion(suggestion)}
                                            >
                                                {highlightSuggestion(suggestion, searchTerm)}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <MobileFilterBottomSheet
                                open={filterSheetOpen}
                                onOpenChange={(open) => {
                                    if (open) openFilterSheet()
                                    else setFilterSheetOpen(false)
                                }}
                                activeCount={activeFilterCount}
                                onClear={clearFilters}
                                onApply={applySheetFilters}
                                clearLabel="Clear Filters"
                            >
                                <JobsFilterFields
                                    filters={draftFilters}
                                    datePosted={draftDatePosted}
                                    onFilterChange={handleDraftFilterChange}
                                    onDatePostedChange={setDraftDatePosted}
                                    dense
                                    namePrefix="jobs-sheet"
                                />
                            </MobileFilterBottomSheet>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDesktopFilterOpen((open) => !open)
                                    if (!desktopFilterOpen) setShowApplyFormInPanel(false)
                                }}
                                className={`hidden h-10 shrink-0 rounded-xl px-4 font-semibold lg:inline-flex ${
                                    desktopFilterOpen
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : ''
                                }`}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                                {activeFilterCount > 0 ? (
                                    <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                ) : null}
                            </Button>
                            <Button
                                type="submit"
                                className="hidden h-10 shrink-0 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-500 sm:inline-flex"
                            >
                                Search
                            </Button>
                        </form>

                        {/* Category tabs */}
                        <div className="mt-2 -mx-0.5 overflow-x-auto px-0.5 scrollbar-none sm:mt-3">
                            <div className="flex min-w-max gap-1 sm:gap-1.5">
                                {CATEGORY_CHIPS.map((tab) => {
                                    const isActive = categoryChip === tab.value
                                    return (
                                        <button
                                            key={tab.value}
                                            type="button"
                                            onClick={() => handleCategoryChange(tab.value)}
                                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all sm:px-3.5 sm:text-sm ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    )
                                })}
                                {/* Date chips — desktop only; mobile uses bottom sheet */}
                                <div className="ml-1 hidden items-center gap-1 border-l border-gray-200 pl-2 dark:border-white/10 lg:flex">
                                    {(
                                        [
                                            { value: 'all', label: 'Any time' },
                                            { value: '24h', label: '24h' },
                                            { value: '7d', label: '7d' },
                                            { value: '30d', label: '30d' },
                                        ] as const
                                    ).map((tab) => {
                                        const active = datePostedFilter === tab.value
                                        return (
                                            <button
                                                key={`date-${tab.value}`}
                                                type="button"
                                                onClick={() => handleDesktopDateChange(tab.value)}
                                                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all sm:px-3 sm:py-1.5 sm:text-xs ${
                                                    active
                                                        ? 'border border-violet-500/30 bg-violet-500/15 text-violet-300'
                                                        : 'border border-transparent text-gray-500 hover:border-gray-200 dark:text-gray-400 dark:hover:border-white/10'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Loading opportunities...
                                </p>
                            </div>
                        </div>
                    ) : (useRankedPagination ? rankedPool.length === 0 : jobs.length === 0) ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 px-4 py-16 text-center dark:border-gray-700 dark:bg-gray-800/40">
                            <p className="text-base font-medium text-gray-600 dark:text-gray-300 sm:text-lg">
                                {categoryChip === 'saved' && getSavedJobIds().length === 0
                                    ? 'No saved jobs yet. Tap the bookmark icon on a job to save it here.'
                                    : categoryChip === 'campus_drive'
                                      ? 'No campus drives found matching your criteria.'
                                      : 'No jobs found matching your criteria.'}
                            </p>
                            {!(categoryChip === 'saved' && getSavedJobIds().length === 0) && (
                            <Button
                                variant="link"
                                onClick={clearFilters}
                                className="mt-2 text-primary-600 dark:text-primary-400"
                            >
                                Clear filters
                            </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {displayJobs.map((job, index) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    cardIndex={index}
                                    selected={selectedJob?.id === job.id}
                                    onSelect={() => selectJobForPanel(job)}
                                    onViewDescription={() => router.push(getJobDetailPath(job))}
                                    onApply={() => handleApplyClick(job)}
                                    isApplying={applyingJobId === job.id}
                                    showMatchScore={personalizeFeed && job.match_score >= 1}
                                    matchScore={job.match_score}
                                />
                            ))}
                        </div>
                    )}

                    {pagination.total_pages > 1 && (
                        <div className="mt-8 flex justify-center pb-8">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                    disabled={pagination.page === 1}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {(() => {
                                        const totalPages = pagination.total_pages
                                        const currentPage = pagination.page

                                        const renderPageButton = (pageNum: number) => (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                className={`h-9 w-9 p-0 font-medium transition-all ${
                                                    currentPage === pageNum
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                                        : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                                                }`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        )

                                        const pages = []

                                        if (totalPages <= 7) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(renderPageButton(i))
                                            }
                                        } else {
                                            pages.push(renderPageButton(1))

                                            if (currentPage > 3) {
                                                pages.push(
                                                    <span key="ellipsis-start" className="px-1 text-gray-400">
                                                        ...
                                                    </span>
                                                )
                                            }

                                            let start = Math.max(2, currentPage - 1)
                                            let end = Math.min(totalPages - 1, currentPage + 1)

                                            if (currentPage <= 3) {
                                                start = 2
                                                end = 4
                                            } else if (currentPage >= totalPages - 2) {
                                                start = totalPages - 3
                                                end = totalPages - 1
                                            }

                                            for (let i = start; i <= end; i++) {
                                                pages.push(renderPageButton(i))
                                            }

                                            if (currentPage < totalPages - 2) {
                                                pages.push(
                                                    <span key="ellipsis-end" className="px-1 text-gray-400">
                                                        ...
                                                    </span>
                                                )
                                            }

                                            pages.push(renderPageButton(totalPages))
                                        }
                                        return pages
                                    })()}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                    disabled={pagination.page === pagination.total_pages}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {desktopFilterOpen ? (
                    <StickyFilterPanel title="Filter Jobs" onClear={clearFilters}>
                        <div className="space-y-4 text-sm">
                            <JobsFilterFields
                                filters={filters}
                                datePosted={datePostedFilter}
                                onFilterChange={handleFilterChange}
                                onDatePostedChange={handleDesktopDateChange}
                                dense
                                namePrefix="jobs-sidebar"
                            />
                            <Button
                                type="button"
                                onClick={() => {
                                    handleDesktopShowResults()
                                    setDesktopFilterOpen(false)
                                }}
                                className="h-10 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
                            >
                                Show Results
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDesktopFilterOpen(false)}
                                className="h-10 w-full rounded-xl"
                            >
                                Close filters
                            </Button>
                        </div>
                    </StickyFilterPanel>
                ) : (
                    <JobsLinkedInRightRail
                        job={selectedJob}
                        highlightJobs={displayJobs.filter((j) => {
                            const status = String(j.status || '').toLowerCase()
                            return status !== 'closed' && status !== 'expired'
                        })}
                        isLoggedIn={isLoggedIn}
                        showApplyForm={showApplyFormInPanel}
                        onSelectJob={(job) => {
                            setSelectedJob(job)
                            setDesktopFilterOpen(false)
                            setShowApplyFormInPanel(false)
                        }}
                        onStartQuickApply={() => {
                            if (!selectedJob) return
                            handleApplyClick(selectedJob)
                        }}
                        onGuestAuth={() => {
                            if (!selectedJob) return
                            handleApplyClick(selectedJob)
                        }}
                        onApplySuccess={handleQuickApplySuccess}
                        onCloseApplyForm={() => setShowApplyFormInPanel(false)}
                    />
                )}
            </div>

            {showQuickApplyModal && selectedJob && (
                <QuickApplyModal
                    job={selectedJob}
                    onClose={() => {
                        setShowQuickApplyModal(false)
                        setApplyingJobId(null)
                    }}
                    onSuccess={handleQuickApplySuccess}
                />
            )}

            <PostQuickApplySkillsNudgeDialog
                isOpen={showSkillsNudge}
                onClose={() => setShowSkillsNudge(false)}
            />
        </div>
    )
}
