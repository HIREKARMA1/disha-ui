"use client"

import { useState, useEffect } from 'react'
import { Search, Loader2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JobCard } from '@/components/dashboard/JobCard'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { profileService, type ProfileCompletionResponse } from '@/services/profileService'

// Types (reusing from student/jobs/page.tsx logic)
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

    // Description Modal state
    const [viewJob, setViewJob] = useState<Job | null>(null)

    // User state
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)
    const [studentProfile, setStudentProfile] = useState<{ degree?: string; branch?: string } | null>(null)

    // Filter state
    const [showFilters, setShowFilters] = useState(false)
    const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'open' | 'closed'>('all')
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

            setJobs(filteredByStatus)
            setPagination({
                page: data.page || 1,
                limit: data.limit || 12,
                total: filteredByStatus.length,
                total_pages: Math.ceil(filteredByStatus.length / (data.limit || 12))
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

        if (profileCompletion && profileCompletion.completion_percentage < 75) {
            toast.error('Profile completion must be at least 75% to apply.')
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
            let errorMessage = 'Failed to submit application'
            const detail = error.response?.data?.detail

            if (typeof detail === 'string') {
                errorMessage = detail
            } else if (Array.isArray(detail)) {
                // Handle array of errors (FastAPI standard validation error)
                errorMessage = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
            } else if (typeof detail === 'object' && detail !== null) {
                // Handle single object error
                errorMessage = detail.msg || JSON.stringify(detail)
            }

            toast.error(errorMessage)
        } finally {
            setIsApplying(false)
            setApplyingJobId(null)
        }
    }

    return (
        <div className="w-full">
            {/* Search Bar */}
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Job Opportunities 💼
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Discover and apply for exciting career opportunities ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                📈 Career Growth
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                🚀 New Opportunities
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 p-6">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search jobs by title, skills, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <div className="relative">
                        <select
                            value={jobStatusFilter}
                            onChange={(e) => {
                                const newFilter = e.target.value as 'all' | 'open' | 'closed'
                                setJobStatusFilter(newFilter)
                            }}
                            className="appearance-none px-2 py-2 pr-10 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800 text-sm h-10 font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                        >
                            <option value="all">All Jobs</option>
                            <option value="open">Open Jobs</option>
                            <option value="closed">Closed Jobs</option>
                        </select>
                        <svg
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <Button
                        onClick={(e) => handleSearch(e)}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        Search
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📍 Location
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
                                🏭 Industry
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
                                💼 Job Type
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
                                🏠 Remote Work
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
                                ⏰ Min Experience (years)
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
                                ⏰ Max Experience (years)
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
                                💰 Min Salary (INR)
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
                                💰 Max Salary (INR)
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
                                ✨ Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2 w-full sm:w-auto"
                            >
                                🗑️ Clear All
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        <p className="text-gray-500">Loading opportunities...</p>
                    </div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchTerm(''); fetchJobs(1) }}
                        className="mt-2 text-primary-600"
                    >
                        Clear search
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {jobs.map((job, index) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            cardIndex={index}
                            onViewDescription={() => setViewJob(job)}
                            onApply={() => handleApplyClick(job)}
                            isApplying={applyingJobId === job.id}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.total_pages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </Button>
                </div>
            )}

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
