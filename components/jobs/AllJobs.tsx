"use client"

import { useState, useEffect } from 'react'
import { Search, Loader2, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JobCard } from '@/components/dashboard/JobCard'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { buildJobPath } from '@/lib/jobSlug'
import { profileService, type ProfileCompletionResponse } from '@/services/profileService'
import { canApplyForJobs, extractErrorDetail, isProfileCompletionError } from '@/lib/profileCompletion'
import { showProfileCompletionToast } from '@/lib/showProfileCompletionToast'

// Types (reusing from student/jobs/page.tsx logic)
export interface Job {
    id: string
    slug?: string
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

export function AllJobs() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        total_pages: 0
    })

    // Application state
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
    // Description Modal state (fallback only)
    const [viewJob, setViewJob] = useState<Job | null>(null)

    // User state
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)
    const [studentProfile, setStudentProfile] = useState<{ degree?: string; branch?: string } | null>(null)

    // Filter state
    const [showFilters, setShowFilters] = useState(false)
    const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
    const [categoryChip, setCategoryChip] = useState<'recommended' | 'all' | 'open' | 'closed'>('recommended')
    const [datePostedFilter, setDatePostedFilter] = useState<'all' | '24h' | '7d' | '15d' | '30d'>('all')
    const [filters, setFilters] = useState({
        location: '',
        industry: '',
        job_type: '',
        remote_work: '',
        experience_min: '',
        experience_max: '',
        salary_min: '',
        salary_max: ''
    })

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            location: '',
            industry: '',
            job_type: '',
            remote_work: '',
            experience_min: '',
            experience_max: '',
            salary_min: '',
            salary_max: ''
        })
        setSearchTerm('')
        setJobStatusFilter('all')
        setDatePostedFilter('all')
        fetchJobs(1)
    }

    useEffect(() => {
        // Check login status on mount
        const checkLoginStatus = async () => {
            const token = apiClient.getAccessToken()
            if (token) {
                setIsLoggedIn(true)
                try {
                    const profile = await profileService.getProfile()
                    setStudentProfile({
                        degree: profile.degree,
                        branch: profile.branch
                    })
                    const completion = await profileService.getProfileCompletion()
                    setProfileCompletion(completion)
                } catch (error) {
                    // console.error('Error fetching profile:', error)
                    // Silent fail if not logged in or token invalid (let component continue)
                }
            }
        }
        checkLoginStatus()
    }, [])

    useEffect(() => {
        fetchJobs(pagination.page)
    }, [pagination.page]) // Refetch on page change

    useEffect(() => {
        // Refetch when job status filter changes
        fetchJobs(1)
    }, [jobStatusFilter])

    useEffect(() => {
        // Refetch when date posted filter changes
        fetchJobs(1)
    }, [datePostedFilter])

    // Deep link (?jobId=) → redirect to SEO job page when slug available
    useEffect(() => {
        const jobId = searchParams?.get('jobId')
        if (!jobId || loading || jobs.length === 0) return
        const match = jobs.find((j) => j.id === jobId)
        if (match) {
            router.replace(
                buildJobPath(match.slug, match.company_name || match.corporate_name, match.title, match.id),
                { scroll: false }
            )
        }
    }, [searchParams, jobs, loading, router])

    // Search debounce could be added here, simplified for now
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchJobs(1)
    }

    const fetchJobs = async (page = 1) => {
        try {
            setLoading(true)
            // Use apiClient to fetch public jobs
            // Note: The backend route /jobs/ is assumed to be public or handled by interceptor if token exists.
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', String(pagination.limit))

            // Sort by created_at descending (most recent first)
            params.set('sort_by', 'created_at')
            params.set('sort_order', 'desc')

            if (searchTerm) params.set('title', searchTerm) // Assuming backend supports title search

            // Add other filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value)
            })

            // Note: jobStatusFilter 'open'/'closed' logic might need backend support or frontend filtering
            // For now, let's assume 'status' param if supported, or filter client side.
            // But since pagination is server-side, it's best to send to backend.
            // If backend doesn't support 'status' filter for public jobs yet, we might see mixed results.
            // The user requested UI filter, we should try to support it. 
            // If the PublicJobService supports status filtering (it filters Active by default), logic might need tweak if 'closed' is requested.
            // However, public job listing usually only implies OPEN/ACTIVE jobs.
            // If user wants to see 'closed' jobs publicly... that's unusual.
            // Let's stick to standard filters for now and maybe ignore 'all'|'open'|'closed' for public API 
            // unless we know backend supports it. The `PublicJobService` filters `JobStatus.ACTIVE`.
            // So we can only show active jobs.
            // If the dropdown is strictly required to FUNCTION, we'd need backend changes to allow querying non-active jobs publicly?
            // "Open Jobs" (Active) is default. "Closed Jobs" ... probably shouldn't be shown publicly.
            // I'll leave the dropdown in UI as requested but it might effectively be decorative if only Active jobs are returned.

            // Using direct get because we need to handle the response specific cleaning logic
            // Use the PUBLIC endpoint which bypasses university filtering
            const response = await apiClient.client.get(`/public/jobs/?${params}`)
            const data: JobSearchResponse = response.data

            // --- CLEANING LOGIC START (Copied from student/jobs/page.tsx for consistency) ---
            const deepCleanObject = (obj: any): any => {
                if (obj === null || obj === undefined) return obj
                if (typeof obj !== 'object') return obj
                if (Array.isArray(obj)) return obj.map(deepCleanObject)
                if ('type' in obj && 'loc' in obj && 'msg' in obj) return null
                const cleaned: any = {}
                for (const [key, value] of Object.entries(obj)) {
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

            const cleanedData = deepCleanObject(data)
            let validatedJobs = (cleanedData.jobs || []).map((job: any) => ({
                ...job,
                // Ensure primitive types
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
                // Map other necessary fields... simplified for brevity but essential ones included
                salary_min: job.salary_min ? Number(job.salary_min) : undefined,
                salary_max: job.salary_max ? Number(job.salary_max) : undefined,
                experience_min: job.experience_min ? Number(job.experience_min) : undefined,
                experience_max: job.experience_max ? Number(job.experience_max) : undefined,
                skills_required: Array.isArray(job.skills_required) ? job.skills_required.map(String) : [],
                application_deadline: job.application_deadline ? String(job.application_deadline) : undefined,
                max_applications: Number(job.max_applications || 0),
                current_applications: Number(job.current_applications || 0),
                industry: job.industry ? String(job.industry) : undefined,
                corporate_name: job.corporate_name ? String(job.corporate_name) : undefined,
                company_name: job.company_name ? String(job.company_name) : undefined,
                company_logo: job.company_logo ? String(job.company_logo) : undefined,
                slug: job.slug ? String(job.slug) : undefined,
            }))
            // --- CLEANING LOGIC END ---

            // Apply client-side status filtering
            let filteredByStatus = validatedJobs
            if (jobStatusFilter === 'open') {
                // Open jobs: can_apply is true and application_deadline hasn't passed
                filteredByStatus = validatedJobs.filter((job: Job) => {
                    const isOpen = job.can_apply && job.is_active
                    // Check if deadline hasn't passed
                    if (job.application_deadline) {
                        const deadline = new Date(job.application_deadline)
                        const now = new Date()
                        return isOpen && deadline > now
                    }
                    return isOpen
                })
            } else if (jobStatusFilter === 'closed') {
                // Closed jobs: can_apply is false OR deadline has passed
                filteredByStatus = validatedJobs.filter((job: Job) => {
                    if (!job.can_apply || !job.is_active) return true
                    if (job.application_deadline) {
                        const deadline = new Date(job.application_deadline)
                        const now = new Date()
                        return deadline <= now
                    }
                    return false
                })
            }
            // 'all' shows everything (no filter)

            // Apply date posted filter
            let filteredByDate = filteredByStatus
            if (datePostedFilter !== 'all') {
                const now = new Date()
                const filterHours = {
                    '24h': 24,
                    '7d': 24 * 7,
                    '15d': 24 * 15,
                    '30d': 24 * 30
                }[datePostedFilter] || 0

                filteredByDate = filteredByStatus.filter((job: Job) => {
                    if (!job.created_at) return false
                    const jobDate = new Date(job.created_at)
                    const hoursDiff = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60)
                    return hoursDiff <= filterHours
                })
            }

            // Sort jobs by created_at (most recent first)
            const sortedJobs = filteredByDate.sort((a: Job, b: Job) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                return dateB - dateA // Descending order
            })

            setJobs(sortedJobs)
            setPagination({
                page: data.page || 1,
                limit: data.limit || 12,
                total: data.total_count || 0,
                total_pages: data.total_pages || 1
            })
        } catch (error) {
            console.error('Error fetching jobs:', error)
            toast.error('Failed to load jobs')
            setJobs([])
        } finally {
            setLoading(false)
        }
    }

    const handleApplyClick = (job: Job) => {
        // 1. Check Login
        if (!isLoggedIn) {
            const returnUrl = encodeURIComponent('/jobs')
            router.push(`/auth/login?redirect=${returnUrl}`)
            return
        }

        // 2. Check Role (Implicitly handled by profile check) & Eligibility
        if (!studentProfile) {
            // If they are logged in but profile fetch failed or not a student
            // This might happen if user is corporate or university.
            // We could check user role from token but for now let's lenient check or re-fetch?
            // Assuming strict student apply.
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

    const handleApplySubmit = async (data: any) => {
        if (!selectedJob) return

        try {
            setIsApplying(true)
            setApplyingJobId(selectedJob.id)

            await apiClient.applyForJob(selectedJob.id, {
                job_id: selectedJob.id,
                cover_letter: data.cover_letter,
                expected_salary: data.expected_salary ? Number(data.expected_salary) : null,
                availability_date: data.availability_date
            })

            toast.success('Application submitted successfully!')
            setShowApplicationModal(false)

            // Update the job status immediately in the local state
            setJobs(prevJobs => prevJobs.map(job =>
                job.id === selectedJob.id
                    ? { ...job, application_status: 'applied', can_apply: false }
                    : job
            ))

            // Also refetch to ensure data consistency
            fetchJobs(pagination.page)
        } catch (error: any) {
            console.error('Application error:', error)
            const detail = extractErrorDetail(error)
            if (isProfileCompletionError(detail)) {
                showProfileCompletionToast()
                return
            }

            let errorMessage = detail || 'Failed to submit application'
            const rawDetail = error.response?.data?.detail
            if (!detail && typeof rawDetail === 'object' && rawDetail !== null && !Array.isArray(rawDetail)) {
                errorMessage = rawDetail.msg || JSON.stringify(rawDetail)
            }

            toast.error(errorMessage)
        } finally {
            setIsApplying(false)
            setApplyingJobId(null)
        }
    }

    return (
        <div className="w-full">
            {/* Compact header matching reference */}
            <div className="mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Live Jobs
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Discover and apply to the best job opportunities.
                </p>
            </div>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-4 lg:items-start">
            <div className="min-w-0">

            {/* Search and Filters — tight gap under hero */}
            <div className="bg-white dark:bg-[#151b2b]/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-gray-200/70 dark:border-white/10 mb-3 sm:mb-4 p-2.5 sm:p-4 shadow-sm">
                {/* Search row */}
                <div className="flex gap-1.5 sm:gap-3">
                    <div className="flex-1 relative min-w-0">
                        <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <Input
                            type="text"
                            placeholder="Search for jobs, roles, skills or companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm rounded-lg sm:rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219] focus:border-blue-500 focus:ring-blue-500/20"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden h-9 w-9 sm:w-auto sm:px-3 rounded-lg border-gray-200 dark:border-white/10 shrink-0"
                        aria-label="Filters"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1.5 text-xs">Filters</span>
                    </Button>
                    <Button
                        onClick={(e) => handleSearch(e)}
                        className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 h-10 rounded-xl transition-all duration-200 shadow-md shadow-blue-500/20 shrink-0"
                    >
                        Search
                    </Button>
                </div>

                {/* Category tabs */}
                <div className="mt-2 sm:mt-3 -mx-0.5 px-0.5 overflow-x-auto scrollbar-none">
                    <div className="flex gap-1 sm:gap-1.5 min-w-max">
                        {[
                            { value: 'recommended', label: 'Recommended' },
                            { value: 'all', label: 'All Jobs' },
                            { value: 'open', label: 'Open' },
                            { value: 'closed', label: 'Closed' },
                        ].map((tab) => {
                            const isActive = categoryChip === tab.value
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => {
                                        setCategoryChip(tab.value as typeof categoryChip)
                                        if (tab.value === 'recommended' || tab.value === 'all') {
                                            setJobStatusFilter('all')
                                        } else {
                                            setJobStatusFilter(tab.value as 'open' | 'closed')
                                        }
                                    }}
                                    className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                        {[
                            { value: 'all', label: 'Any time' },
                            { value: '24h', label: '24h' },
                            { value: '7d', label: '7d' },
                            { value: '30d', label: '30d' },
                        ].map((tab) => {
                            const active = datePostedFilter === tab.value
                            return (
                                <button
                                    key={`date-${tab.value}`}
                                    type="button"
                                    onClick={() => setDatePostedFilter(tab.value as 'all' | '24h' | '7d' | '15d' | '30d')}
                                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                                        active
                                            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                                            : 'text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Filter toggle — mobile/tablet only; desktop uses sidebar */}
                <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center gap-2 lg:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="h-7 sm:h-9 rounded-lg border-gray-200 dark:border-white/10 px-2.5 sm:px-3 text-[11px] sm:text-sm shrink-0"
                    >
                        <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                        {showFilters ? 'Hide' : 'Filters'}
                    </Button>
                </div>

                {/* Filters — expandable on mobile */}
                {showFilters && (
                    <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-gray-200 dark:border-white/10">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                            </label>
                            <Input
                                placeholder="City, State"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Industry
                            </label>
                            <select
                                value={filters.industry}
                                onChange={(e) => handleFilterChange('industry', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All Industries</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Retail">Retail</option>
                                <option value="Consulting">Consulting</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Job Type
                            </label>
                            <select
                                value={filters.job_type}
                                onChange={(e) => handleFilterChange('job_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All Types</option>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Remote Work
                            </label>
                            <select
                                value={filters.remote_work}
                                onChange={(e) => handleFilterChange('remote_work', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All</option>
                                <option value="true">Remote Only</option>
                                <option value="false">On-site Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Min Experience (years)
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.experience_min}
                                onChange={(e) => handleFilterChange('experience_min', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Experience (years)
                            </label>
                            <Input
                                type="number"
                                placeholder="10"
                                value={filters.experience_max}
                                onChange={(e) => handleFilterChange('experience_max', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Min Salary (INR)
                            </label>
                            <Input
                                type="number"
                                placeholder="300000"
                                value={filters.salary_min}
                                onChange={(e) => handleFilterChange('salary_min', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Salary (INR)
                            </label>
                            <Input
                                type="number"
                                placeholder="2000000"
                                value={filters.salary_max}
                                onChange={(e) => handleFilterChange('salary_max', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col sm:flex-row items-center gap-3">
                            <Button
                                onClick={(e) => handleSearch(e)}
                                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                            >
                                Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2 w-full sm:w-auto"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        <p className="text-gray-500 dark:text-gray-300 text-sm">Loading opportunities...</p>
                    </div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40">
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-medium">No jobs found matching your criteria.</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchTerm(''); fetchJobs(1) }}
                        className="mt-2 text-primary-600 dark:text-primary-400"
                    >
                        Clear search
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {jobs.map((job, index) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            cardIndex={index}
                            onViewDescription={() =>
                                router.push(
                                    buildJobPath(
                                        job.slug,
                                        job.company_name || job.corporate_name,
                                        job.title,
                                        job.id
                                    )
                                )
                            }
                            onApply={() => handleApplyClick(job)}
                            isApplying={applyingJobId === job.id}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="mt-8 flex justify-center pb-8">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">

                        <Button
                            variant="outline"
                            size="icon"
                            className="w-9 h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {(() => {
                                const totalPages = pagination.total_pages
                                const currentPage = pagination.page

                                const renderPageButton = (pageNum: number) => (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        className={`w-9 h-9 p-0 font-medium transition-all ${currentPage === pageNum
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md'
                                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
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
                                    // Always show first page
                                    pages.push(renderPageButton(1))

                                    if (currentPage > 3) {
                                        pages.push(<span key="ellipsis-start" className="px-1 text-gray-400">...</span>)
                                    }

                                    // Calculate range
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
                                        pages.push(<span key="ellipsis-end" className="px-1 text-gray-400">...</span>)
                                    }

                                    // Always show last page
                                    pages.push(renderPageButton(totalPages))
                                }
                                return pages
                            })()}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="w-9 h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            disabled={pagination.page === pagination.total_pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            </div>{/* end main column */}

            {/* Desktop filter sidebar */}
            <aside className="hidden lg:block sticky top-20 self-start">
                <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#151b2b]/90 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Filter Jobs</h2>
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
                            <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">Job Type</p>
                            <div className="space-y-1.5">
                                {[
                                    { value: '', label: 'All Types' },
                                    { value: 'full_time', label: 'Full Time' },
                                    { value: 'part_time', label: 'Part Time' },
                                    { value: 'internship', label: 'Internship' },
                                    { value: 'contract', label: 'Contract' },
                                ].map((opt) => (
                                    <label key={opt.value || 'all'} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer">
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
                            <label className="font-medium text-gray-700 dark:text-gray-200 mb-1.5 block">Location</label>
                            <Input
                                placeholder="City, State"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="h-9 text-sm border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219]"
                            />
                        </div>

                        <div>
                            <label className="font-medium text-gray-700 dark:text-gray-200 mb-1.5 block">Industry</label>
                            <select
                                value={filters.industry}
                                onChange={(e) => handleFilterChange('industry', e.target.value)}
                                className="w-full h-9 px-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1219] text-gray-900 dark:text-white"
                            >
                                <option value="">All Industries</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Manufacturing">Manufacturing</option>
                            </select>
                        </div>

                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">Date Posted</p>
                            <div className="space-y-1.5">
                                {[
                                    { value: 'all', label: 'Anytime' },
                                    { value: '24h', label: 'Last 24 hours' },
                                    { value: '7d', label: 'Last 7 days' },
                                    { value: '30d', label: 'Last 30 days' },
                                ].map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="date_posted_sidebar"
                                            checked={datePostedFilter === opt.value}
                                            onChange={() => setDatePostedFilter(opt.value as typeof datePostedFilter)}
                                            className="accent-blue-500"
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={(e) => handleSearch(e)}
                            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                        >
                            Show Results
                        </Button>
                    </div>
                </div>
            </aside>
            </div>{/* end lg grid */}

            {/* Modals */}
            {showApplicationModal && selectedJob && (
                <ApplicationModal
                    job={selectedJob}
                    isApplying={isApplying}
                    onClose={() => setShowApplicationModal(false)}
                    onSubmit={handleApplySubmit}
                />
            )}

            {viewJob && (
                <JobDescriptionModal
                    job={viewJob}
                    onClose={() => setViewJob(null)}
                    onApply={() => {
                        setViewJob(null)
                        handleApplyClick(viewJob)
                    }}
                    applicationStatus={viewJob.application_status}
                />
            )}

        </div>
    )
}
