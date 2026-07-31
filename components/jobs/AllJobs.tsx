"use client"

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type FormEvent,
} from 'react'
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { JobCard } from '@/components/dashboard/JobCard'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import {
  JobsFilterFields,
  EMPTY_JOB_FILTERS,
  INDUSTRY_OPTIONS,
  toApiDatePosted,
  type JobsFilterValues,
  type DatePostedFilter,
} from '@/components/jobs/JobsFilterFields'
import { apiClient } from '@/lib/api'
import { getJobDetailPath } from '@/lib/jobSlug'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { profileService, type ProfileCompletionResponse } from '@/services/profileService'
import { canApplyForJobs, extractErrorDetail, isProfileCompletionError } from '@/lib/profileCompletion'
import { showProfileCompletionToast } from '@/lib/showProfileCompletionToast'

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

type CategoryChip = 'recommended' | 'all' | 'open' | 'closed'
type JobStatusFilter = 'all' | 'open' | 'closed'

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

    const categoryRaw = params.get('category') || 'recommended'
    const categoryChip: CategoryChip =
        categoryRaw === 'all' || categoryRaw === 'open' || categoryRaw === 'closed' || categoryRaw === 'recommended'
            ? categoryRaw
            : 'recommended'

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
    if (opts.categoryChip !== 'recommended') params.set('category', opts.categoryChip)
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
    const initial = useMemo(() => parseFiltersFromParams(searchParams), []) // eslint-disable-line react-hooks/exhaustive-deps

    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(initial.searchTerm)
    const [pagination, setPagination] = useState({
        page: initial.page,
        limit: 12,
        total: 0,
        total_pages: 0,
    })

    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)
    const [studentProfile, setStudentProfile] = useState<{ degree?: string; branch?: string } | null>(null)

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
            }
        ) => {
            const activeSearch = override?.searchTerm ?? searchTerm
            const activeFilters = override?.filters ?? filters
            const activeDate = override?.datePostedFilter ?? datePostedFilter
            const activeStatus = override?.jobStatusFilter ?? jobStatusFilter
            const requestId = ++fetchIdRef.current

            try {
                setLoading(true)
                const params = new URLSearchParams()
                params.set('page', String(page))
                params.set('limit', String(pagination.limit))
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
                    // Request a wider window; refine client-side to 15 days
                    params.set('date_posted', '30_days')
                }

                const response = await apiClient.client.get(`/public/jobs/?${params}`)
                if (requestId !== fetchIdRef.current) return

                const data: JobSearchResponse = response.data
                const cleanedData = deepCleanObject(data) as JobSearchResponse
                let validatedJobs = (cleanedData.jobs || []).map((job: Job) => ({
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
                }))

                if (activeStatus === 'open') {
                    validatedJobs = validatedJobs.filter(isJobOpen)
                } else if (activeStatus === 'closed') {
                    validatedJobs = validatedJobs.filter((job) => !isJobOpen(job))
                }

                // Client refine for 15d (no API bucket) and as safety net
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
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                    return dateB - dateA
                })

                setJobs(validatedJobs)
                setPagination({
                    page: data.page || page,
                    limit: data.limit || 12,
                    total: data.total_count || 0,
                    total_pages: data.total_pages || 1,
                })
            } catch (error) {
                if (requestId !== fetchIdRef.current) return
                console.error('Error fetching jobs:', error)
                toast.error('Failed to load jobs')
                setJobs([])
            } finally {
                if (requestId === fetchIdRef.current) setLoading(false)
            }
        },
        [searchTerm, filters, datePostedFilter, jobStatusFilter, pagination.limit]
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
            categoryChip: 'recommended',
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
                    const profile = await profileService.getProfile()
                    setStudentProfile({
                        degree: profile.degree,
                        branch: profile.branch,
                    })
                    const completion = await profileService.getProfileCompletion()
                    setProfileCompletion(completion)
                } catch {
                    // Silent fail
                }
            }
        }
        void checkLoginStatus()
    }, [])

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
            })
            return
        }

        void fetchJobs(parsed.page, {
            searchTerm: parsed.searchTerm,
            filters: parsed.filters,
            datePostedFilter: parsed.datePostedFilter,
            jobStatusFilter: parsed.jobStatusFilter,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

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

    const handleSearch = (e?: FormEvent) => {
        e?.preventDefault()
        applyFiltersAndFetch({ searchTerm, page: 1 })
    }

    const handleCategoryChange = (value: CategoryChip) => {
        const nextStatus: JobStatusFilter =
            value === 'recommended' || value === 'all' ? 'all' : (value as JobStatusFilter)
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
        void fetchJobs(page)
    }

    const handleApplyClick = (job: Job) => {
        if (!isLoggedIn) {
            const returnUrl = encodeURIComponent('/jobs')
            router.push(`/auth/login?redirect=${returnUrl}`)
            return
        }

        if (profileCompletion && !canApplyForJobs(profileCompletion)) {
            showProfileCompletionToast()
            return
        }

        if (!job.can_apply) {
            toast.error('Applications are closed for this job.')
            return
        }

        setSelectedJob(job)
        setShowApplicationModal(true)
    }

    const handleApplySubmit = async (data: {
        cover_letter?: string
        expected_salary?: string | number
        availability_date?: string
    }) => {
        if (!selectedJob) return

        try {
            setIsApplying(true)
            setApplyingJobId(selectedJob.id)

            await apiClient.applyForJob(selectedJob.id, {
                job_id: selectedJob.id,
                cover_letter: data.cover_letter,
                expected_salary: data.expected_salary ? Number(data.expected_salary) : null,
                availability_date: data.availability_date,
            })

            toast.success('Application submitted successfully!')
            setShowApplicationModal(false)

            setJobs((prevJobs) =>
                prevJobs.map((job) =>
                    job.id === selectedJob.id
                        ? { ...job, application_status: 'applied', can_apply: false }
                        : job
                )
            )

            void fetchJobs(pagination.page)
        } catch (error: unknown) {
            console.error('Application error:', error)
            const detail = extractErrorDetail(error)
            if (isProfileCompletionError(detail)) {
                showProfileCompletionToast()
                return
            }

            let errorMessage = detail || 'Failed to submit application'
            const err = error as { response?: { data?: { detail?: unknown } } }
            const rawDetail = err.response?.data?.detail
            if (!detail && typeof rawDetail === 'object' && rawDetail !== null && !Array.isArray(rawDetail)) {
                errorMessage =
                    (rawDetail as { msg?: string }).msg || JSON.stringify(rawDetail)
            }

            toast.error(errorMessage)
        } finally {
            setIsApplying(false)
            setApplyingJobId(null)
        }
    }

    return (
        <div className="w-full overflow-x-hidden">
            <div className="mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Live Jobs
                </h1>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Discover and apply to the best job opportunities.
                </p>
            </div>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-4">
                <div className="min-w-0">
                    {/* Search + mobile filter */}
                    <div className="mb-3 rounded-xl border border-gray-200/70 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-[#151b2b]/90 sm:mb-4 sm:rounded-2xl sm:p-4">
                        <form
                            onSubmit={handleSearch}
                            className="flex gap-1.5 sm:gap-3"
                        >
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-4 sm:w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search for jobs, roles, skills or companies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 rounded-lg border-gray-200 bg-white pl-8 text-sm focus:border-blue-500 focus:ring-blue-500/20 dark:border-white/10 dark:bg-[#0f1219] sm:h-10 sm:rounded-xl sm:pl-9"
                                />
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
                                />
                            </MobileFilterBottomSheet>
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
                                {(
                                    [
                                        { value: 'recommended', label: 'Recommended' },
                                        { value: 'all', label: 'All Jobs' },
                                        { value: 'open', label: 'Open' },
                                        { value: 'closed', label: 'Closed' },
                                    ] as const
                                ).map((tab) => {
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
                    ) : jobs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 px-4 py-16 text-center dark:border-gray-700 dark:bg-gray-800/40">
                            <p className="text-base font-medium text-gray-600 dark:text-gray-300 sm:text-lg">
                                No jobs found matching your criteria.
                            </p>
                            <Button
                                variant="link"
                                onClick={clearFilters}
                                className="mt-2 text-primary-600 dark:text-primary-400"
                            >
                                Clear filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {jobs.map((job, index) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    cardIndex={index}
                                    onViewDescription={() => router.push(getJobDetailPath(job))}
                                    onApply={() => handleApplyClick(job)}
                                    isApplying={applyingJobId === job.id}
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

                {/* Desktop filter sidebar — sticky, independently scrollable */}
                <aside className="sticky top-20 hidden max-h-[calc(100vh-5.5rem)] self-start overflow-y-auto overscroll-contain lg:block">
                    <div className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#151b2b]/90">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Filter Jobs
                            </h2>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-xs font-semibold text-blue-500 hover:text-blue-400"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">Job Type</p>
                                <div className="space-y-1.5">
                                    {[
                                        { value: '', label: 'All Types' },
                                        { value: 'full_time', label: 'Full Time' },
                                        { value: 'part_time', label: 'Part Time' },
                                        { value: 'internship', label: 'Internship' },
                                        { value: 'contract', label: 'Contract' },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value || 'all'}
                                            className="flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-300"
                                        >
                                            <input
                                                type="radio"
                                                name="job_type_sidebar"
                                                checked={filters.job_type === opt.value}
                                                onChange={() => handleFilterChange('job_type', opt.value)}
                                                className="accent-blue-500"
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                                    Location
                                </label>
                                <Input
                                    placeholder="City, State"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="h-9 border-gray-200 bg-white text-sm dark:border-white/10 dark:bg-[#0f1219]"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                                    Industry
                                </label>
                                <select
                                    value={filters.industry}
                                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-900 dark:border-white/10 dark:bg-[#0f1219] dark:text-white"
                                >
                                    {INDUSTRY_OPTIONS.filter((o) =>
                                        ['', 'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'].includes(
                                            o.value
                                        )
                                    ).map((opt) => (
                                        <option key={opt.value || 'all'} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">Date Posted</p>
                                <div className="space-y-1.5">
                                    {[
                                        { value: 'all', label: 'Anytime' },
                                        { value: '24h', label: 'Last 24 hours' },
                                        { value: '7d', label: 'Last 7 days' },
                                        { value: '30d', label: 'Last 30 days' },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value}
                                            className="flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-300"
                                        >
                                            <input
                                                type="radio"
                                                name="date_posted_sidebar"
                                                checked={datePostedFilter === opt.value}
                                                onChange={() =>
                                                    handleDesktopDateChange(opt.value as DatePostedFilter)
                                                }
                                                className="accent-blue-500"
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleDesktopShowResults}
                                className="h-10 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
                            >
                                Show Results
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>

            {showApplicationModal && selectedJob && (
                <ApplicationModal
                    job={selectedJob}
                    isApplying={isApplying}
                    onClose={() => setShowApplicationModal(false)}
                    onSubmit={handleApplySubmit}
                />
            )}
        </div>
    )
}
