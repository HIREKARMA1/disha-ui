"use client"

import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react'
import { Search, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { UniversityJobCard } from '@/components/dashboard/UniversityJobCard'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { CreateJobModal } from '@/components/dashboard/CreateJobModal'
import { UniversityAppliedStudentsModal } from '@/components/university/UniversityAppliedStudentsModal'
import { EditJobModal } from '@/components/dashboard/EditJobModal'
import { DeleteConfirmationModal } from '@/components/dashboard/DeleteConfirmationModal'
import { JobAssignmentResultsModal } from '@/components/university/JobAssignmentResultsModal'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { StickyFilterPanel } from '@/components/ui/StickyFilterPanel'
import {
    JobsFilterFields,
    EMPTY_JOB_FILTERS,
    type JobsFilterValues,
    type DatePostedFilter,
} from '@/components/jobs/JobsFilterFields'

type CategoryChip = 'recommended' | 'all' | 'open' | 'closed'

interface UniversityJob {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    company_name?: string
    company_verified?: boolean
    industry?: string
    location: string | string[]
    job_type: string
    salary_min?: string
    salary_max?: string
    salary_currency?: string
    application_deadline?: string
    campus_drive_date?: string
    venue?: string
    max_students?: number
    skills_required?: string[]
    status: string
    benefits?: string
    selection_process?: string
    approved: boolean
    rejected?: boolean
    pending?: boolean
    approval_status?: string
    corporate_id?: string
    corporate_name?: string
    university_id?: string
    // Additional fields for complete job data
    remote_work?: boolean
    travel_required?: boolean
    onsite_office?: boolean
    mode_of_work?: string
    experience_min?: number
    experience_max?: number
    education_level?: string | string[]
    education_degree?: string | string[]
    education_branch?: string | string[]
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    expiration_date?: string
    created_at?: string
    is_active?: boolean
    can_apply?: boolean
    // Company information fields (for university-created jobs)
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

interface UniversityJobsResponse {
    jobs: UniversityJob[]
    total_jobs: number
    pending_approval: number
    approved: number
    rejected: number
}

function UniversityJobsPageContent() {
    const [jobs, setJobs] = useState<UniversityJob[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<JobsFilterValues>({ ...EMPTY_JOB_FILTERS })
    const [datePostedFilter, setDatePostedFilter] = useState<DatePostedFilter>('all')
    const [categoryChip, setCategoryChip] = useState<CategoryChip>('recommended')
    const [filterSheetOpen, setFilterSheetOpen] = useState(false)
    const [draftFilters, setDraftFilters] = useState<JobsFilterValues>({ ...EMPTY_JOB_FILTERS })
    const [draftDatePosted, setDraftDatePosted] = useState<DatePostedFilter>('all')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        total_pages: 0
    })
    const [selectedJob, setSelectedJob] = useState<UniversityJob | null>(null)
    const [completeJobData, setCompleteJobData] = useState<any>(null)
    const [loadingJobDetails, setLoadingJobDetails] = useState(false)
    const [processingJobs, setProcessingJobs] = useState<Set<string>>(new Set())
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [jobToReject, setJobToReject] = useState<UniversityJob | null>(null)
    const [stats, setStats] = useState({
        total_jobs: 0,
        pending_approval: 0,
        approved: 0,
        rejected: 0
    })
    const [showCreateModal, setShowCreateModal] = useState(false) // State for create modal
    const [showAppliedStudentsModal, setShowAppliedStudentsModal] = useState(false)
    const [selectedJobForStudents, setSelectedJobForStudents] = useState<UniversityJob | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingJob, setEditingJob] = useState<UniversityJob | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<UniversityJob | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showResultsModal, setShowResultsModal] = useState(false)
    const [selectedJobForResults, setSelectedJobForResults] = useState<UniversityJob | null>(null)

    // Fetch jobs from API
    const fetchJobs = async (): Promise<void> => {
        try {
            setLoading(true)
            const response = await apiClient.getUniversityJobs()
            console.log('University jobs response:', response)

            if (response && response.jobs) {
                setJobs(response.jobs)
                setStats({
                    total_jobs: response.total_jobs || response.jobs.length,
                    pending_approval: response.pending_approval || 0,
                    approved: response.approved || 0,
                    rejected: response.rejected || 0
                })
                setPagination(prev => ({
                    ...prev,
                    total: response.jobs.length,
                    total_pages: Math.ceil(response.jobs.length / prev.limit)
                }))
            } else {
                setJobs([])
                setStats({ total_jobs: 0, pending_approval: 0, approved: 0, rejected: 0 })
            }
        } catch (error: any) {
            console.error('Error fetching university jobs:', error)
            toast.error('Failed to fetch jobs')
            setJobs([])
        } finally {
            setLoading(false)
        }
    }

    const jobLocationText = (location?: string | string[]) => {
        if (Array.isArray(location)) return location.join(', ')
        return location || ''
    }

    const matchesDatePosted = (createdAt?: string, datePosted: DatePostedFilter = datePostedFilter) => {
        if (datePosted === 'all' || !createdAt) return true
        const created = new Date(createdAt).getTime()
        if (Number.isNaN(created)) return true
        const hours = (Date.now() - created) / 36e5
        if (datePosted === '24h') return hours <= 24
        if (datePosted === '7d') return hours <= 24 * 7
        if (datePosted === '15d') return hours <= 24 * 15
        if (datePosted === '30d') return hours <= 24 * 30
        return true
    }

    const filteredJobs = jobs.filter(job => {
        const q = searchTerm.toLowerCase().trim()
        const locationText = jobLocationText(job.location).toLowerCase()
        const matchesSearch = !q ||
            job.title?.toLowerCase().includes(q) ||
            job.description?.toLowerCase().includes(q) ||
            locationText.includes(q) ||
            job.company_name?.toLowerCase().includes(q) ||
            (job.skills_required || []).some((skill) => String(skill).toLowerCase().includes(q))

        const matchesCategory =
            categoryChip === 'all' ||
            categoryChip === 'recommended' ||
            (categoryChip === 'open' && (job.approval_status === 'approved' || job.approved) && job.status !== 'closed' && job.is_active !== false) ||
            (categoryChip === 'closed' && (
                job.approval_status === 'rejected' ||
                job.rejected ||
                job.status === 'closed' ||
                job.is_active === false
            ))

        const matchesJobType = !filters.job_type || job.job_type === filters.job_type
        const matchesIndustry = !filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())
        const matchesLocation = !filters.location || locationText.includes(filters.location.toLowerCase())

        const salaryMin = job.salary_min != null ? Number(job.salary_min) : undefined
        const salaryMax = job.salary_max != null ? Number(job.salary_max) : undefined
        const matchesSalaryMin = !filters.salary_min || (salaryMax != null && !Number.isNaN(salaryMax)
            ? salaryMax >= Number(filters.salary_min)
            : salaryMin != null && !Number.isNaN(salaryMin) && salaryMin >= Number(filters.salary_min))
        const matchesSalaryMax = !filters.salary_max || (salaryMin != null && !Number.isNaN(salaryMin)
            ? salaryMin <= Number(filters.salary_max)
            : salaryMax != null && !Number.isNaN(salaryMax) && salaryMax <= Number(filters.salary_max))

        const matchesExpMin = !filters.experience_min || (job.experience_max ?? job.experience_min ?? 0) >= Number(filters.experience_min)
        const matchesExpMax = !filters.experience_max || (job.experience_min ?? job.experience_max ?? 0) <= Number(filters.experience_max)

        const skillTerms = filters.skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        const jobSkills = (job.skills_required || []).map((s) => String(s).toLowerCase())
        const matchesSkills = skillTerms.length === 0 || skillTerms.every((term) =>
            jobSkills.some((skill) => skill.includes(term))
        )

        const isRemote = Boolean(job.remote_work) || job.mode_of_work === 'remote'
        const matchesRemote =
            !filters.remote_work ||
            (filters.remote_work === 'true' && isRemote) ||
            (filters.remote_work === 'false' && !isRemote)

        return matchesSearch && matchesCategory && matchesJobType && matchesIndustry &&
            matchesLocation && matchesSalaryMin && matchesSalaryMax && matchesExpMin &&
            matchesExpMax && matchesSkills && matchesRemote && matchesDatePosted(job.created_at)
    })

    // Apply pagination to filtered jobs
    const paginatedJobs = filteredJobs.slice(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit
    )

    // Update pagination when filters change
    useEffect(() => {
        const totalPages = Math.ceil(filteredJobs.length / pagination.limit)
        setPagination(prev => ({
            ...prev,
            total: filteredJobs.length,
            total_pages: totalPages,
            page: prev.page > totalPages ? 1 : prev.page
        }))
    }, [filteredJobs.length, pagination.limit])

    // Handle job approval
    const handleApproveJob = async (job: UniversityJob) => {
        try {
            setProcessingJobs(prev => new Set(prev).add(job.id))

            await apiClient.approveUniversityJob(job.id)

            // Update the local state
            setJobs(prev => prev.map(j =>
                j.id === job.id ? { 
                    ...j, 
                    approved: true, 
                    rejected: false, 
                    pending: false,
                    approval_status: 'approved'
                } : j
            ))

            // Update stats
            setStats(prev => ({
                ...prev,
                pending_approval: prev.pending_approval - 1,
                approved: prev.approved + 1
            }))

            toast.success('Job approved successfully!')
        } catch (error: any) {
            console.error('Error approving job:', error)
            toast.error('Failed to approve job')
        } finally {
            setProcessingJobs(prev => {
                const newSet = new Set(prev)
                newSet.delete(job.id)
                return newSet
            })
        }
    }

    // Handle job rejection
    const handleRejectJob = async (job: UniversityJob) => {
        try {
            setProcessingJobs(prev => new Set(prev).add(job.id))

            console.log('Rejecting job:', job.id, 'Current status:', job.approval_status)
            
            await apiClient.rejectUniversityJob(job.id)

            // Mark job as rejected instead of removing it
            setJobs(prev => {
                const updatedJobs = prev.map(j =>
                    j.id === job.id ? { 
                        ...j, 
                        rejected: true, 
                        approved: false, 
                        pending: false,
                        approval_status: 'rejected'
                    } : j
                )
                console.log('Updated jobs after rejection:', updatedJobs.find(j => j.id === job.id))
                return updatedJobs
            })

            // Update stats
            setStats(prev => ({
                ...prev,
                pending_approval: prev.pending_approval - 1,
                rejected: prev.rejected + 1
            }))

            toast.success('Job not approved successfully!')
        } catch (error: any) {
            console.error('Error rejecting job:', error)
            toast.error('Failed to not approve job')
        } finally {
            setProcessingJobs(prev => {
                const newSet = new Set(prev)
                newSet.delete(job.id)
                return newSet
            })
        }
    }

    // Handle not approved action (show confirmation modal)
    const handleNotApproveJob = (job: UniversityJob) => {
        setJobToReject(job)
        setShowRejectModal(true)
    }

    // Handle confirmed rejection
    const handleConfirmReject = async () => {
        if (!jobToReject) return
        await handleRejectJob(jobToReject)
        setShowRejectModal(false)
        setJobToReject(null)
    }

    // Handle modal close
    const handleCloseRejectModal = () => {
        setShowRejectModal(false)
        setJobToReject(null)
    }

    const handleFilterChange = useCallback((key: keyof JobsFilterValues, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPagination((prev) => ({ ...prev, page: 1 }))
    }, [])

    const handleDraftFilterChange = useCallback((key: keyof JobsFilterValues, value: string) => {
        setDraftFilters((prev) => ({ ...prev, [key]: value }))
    }, [])

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
    }

    const activeFilterCount = useMemo(() => {
        let count = Object.values(filters).filter(Boolean).length
        if (datePostedFilter !== 'all') count += 1
        return count
    }, [filters, datePostedFilter])

    const clearFilters = () => {
        const cleared = { ...EMPTY_JOB_FILTERS }
        setFilters(cleared)
        setDraftFilters(cleared)
        setDatePostedFilter('all')
        setDraftDatePosted('all')
        setCategoryChip('recommended')
        setSearchTerm('')
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const openFilterSheet = () => {
        setDraftFilters(filters)
        setDraftDatePosted(datePostedFilter)
        setFilterSheetOpen(true)
    }

    const applySheetFilters = () => {
        setFilters(draftFilters)
        setDatePostedFilter(draftDatePosted)
        setPagination((prev) => ({ ...prev, page: 1 }))
        setFilterSheetOpen(false)
    }

    const handleSearch = (e?: FormEvent) => {
        e?.preventDefault()
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleCategoryChange = (value: CategoryChip) => {
        setCategoryChip(value)
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleDesktopDateChange = (value: DatePostedFilter) => {
        setDatePostedFilter(value)
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    // Load initial data
    useEffect(() => {
        fetchJobs()
    }, [])

    // Handle job created
    const handleJobCreated = () => {
        fetchJobs() // Refresh the jobs list
    }

    // Handle view applied students
    const handleViewAppliedStudents = (job: UniversityJob) => {
        setSelectedJobForStudents(job)
        setShowAppliedStudentsModal(true)
    }

    // Handle edit job - fetch complete job data
    const handleEditJob = async (job: UniversityJob) => {
        try {
            // Fetch complete job data by ID to ensure we have all fields including company info
            const completeJobData = await apiClient.getJobById(job.id)
            console.log('Complete job data fetched for editing:', completeJobData)
            
            // Map the complete job data to UniversityJob format
            const jobForEdit: UniversityJob = {
                ...job,
                ...completeJobData,
                // Ensure all company information fields are included with fallbacks
                company_name: completeJobData.company_name || job.company_name,
                company_logo: completeJobData.company_logo || job.company_logo,
                company_website: completeJobData.company_website || job.company_website,
                company_address: completeJobData.company_address || job.company_address,
                company_size: completeJobData.company_size || job.company_size,
                company_type: completeJobData.company_type || job.company_type,
                company_founded: completeJobData.company_founded ?? job.company_founded,
                company_description: completeJobData.company_description || job.company_description,
                contact_person: completeJobData.contact_person || job.contact_person,
                contact_designation: completeJobData.contact_designation || job.contact_designation,
                // Map other fields
                requirements: completeJobData.requirements || job.requirements,
                responsibilities: completeJobData.responsibilities || job.responsibilities,
                remote_work: completeJobData.remote_work ?? job.remote_work,
                travel_required: completeJobData.travel_required ?? job.travel_required,
                mode_of_work: completeJobData.mode_of_work || job.mode_of_work,
                salary_min: completeJobData.salary_min?.toString() || job.salary_min,
                salary_max: completeJobData.salary_max?.toString() || job.salary_max,
                salary_currency: completeJobData.salary_currency || job.salary_currency,
                experience_min: completeJobData.experience_min ?? job.experience_min,
                experience_max: completeJobData.experience_max ?? job.experience_max,
                education_level: completeJobData.education_level || job.education_level,
                education_degree: completeJobData.education_degree || job.education_degree,
                education_branch: completeJobData.education_branch || job.education_branch,
                skills_required: completeJobData.skills_required || job.skills_required,
                application_deadline: completeJobData.application_deadline || job.application_deadline,
                industry: completeJobData.industry || job.industry,
                selection_process: completeJobData.selection_process || job.selection_process,
                campus_drive_date: completeJobData.campus_drive_date || job.campus_drive_date,
                number_of_openings: completeJobData.number_of_openings ?? job.number_of_openings,
                perks_and_benefits: completeJobData.perks_and_benefits || job.perks_and_benefits,
                eligibility_criteria: completeJobData.eligibility_criteria || job.eligibility_criteria,
                service_agreement_details: completeJobData.service_agreement_details || job.service_agreement_details,
                ctc_with_probation: completeJobData.ctc_with_probation || job.ctc_with_probation,
                ctc_after_probation: completeJobData.ctc_after_probation || job.ctc_after_probation,
                expiration_date: completeJobData.expiration_date || job.expiration_date,
                created_at: completeJobData.created_at || job.created_at,
                is_active: completeJobData.is_active ?? job.is_active,
                can_apply: completeJobData.can_apply ?? job.can_apply
            }
            
            console.log('🔍 Job data mapped for editing:', {
                industry: jobForEdit.industry,
                company_size: jobForEdit.company_size,
                company_type: jobForEdit.company_type,
                completeJobData_industry: completeJobData.industry,
                completeJobData_company_size: completeJobData.company_size,
                completeJobData_company_type: completeJobData.company_type,
                job_industry: job.industry,
                job_company_size: job.company_size,
                job_company_type: job.company_type
            })
            
            setEditingJob(jobForEdit)
            setShowEditModal(true)
        } catch (error: any) {
            console.error('Error fetching complete job data:', error)
            toast.error('Failed to load job details. Using available data.')
            // Fallback to using the job data we already have
        setEditingJob(job)
        setShowEditModal(true)
        }
    }

    // Handle delete job
    const handleDeleteJob = (job: UniversityJob) => {
        setJobToDelete(job)
        setShowDeleteModal(true)
    }

    // Confirm delete job
    const handleConfirmDelete = async () => {
        if (!jobToDelete) return

        try {
            setIsDeleting(true)
            await apiClient.deleteJobUniversity(jobToDelete.id)
            
            // Remove job from the list
            setJobs(prev => prev.filter(j => j.id !== jobToDelete.id))
            
            // Update stats
            setStats(prev => ({
                ...prev,
                total_jobs: prev.total_jobs - 1,
                approved: jobToDelete.approved ? prev.approved - 1 : prev.approved,
                pending_approval: jobToDelete.approval_status === 'pending' ? prev.pending_approval - 1 : prev.pending_approval,
                rejected: jobToDelete.rejected ? prev.rejected - 1 : prev.rejected
            }))

            toast.success('Job deleted successfully!')
            setShowDeleteModal(false)
            setJobToDelete(null)
        } catch (error: any) {
            console.error('Error deleting job:', error)
            toast.error('Failed to delete job')
        } finally {
            setIsDeleting(false)
        }
    }

    // Handle send assignment - redirect to practice module creation
    const handleSendAssignment = (job: UniversityJob) => {
        // Navigate to practice module creation page with job context
        const jobContext = encodeURIComponent(JSON.stringify({
            jobId: job.id,
            jobTitle: job.title,
            role: job.title // Use job title as suggested role
        }))
        window.location.href = `/dashboard/university/practice?createModule=true&jobContext=${jobContext}`
    }

    // Handle view results - show assignment results for this job
    const handleViewResults = (job: UniversityJob) => {
        setSelectedJobForResults(job)
        setShowResultsModal(true)
    }

    // Handle job updated
    const handleJobUpdated = () => {
        fetchJobs() // Refresh the jobs list
        setShowEditModal(false)
        setEditingJob(null)
    }

    const handleViewJobDescription = async (job: UniversityJob) => {
        setSelectedJob(job)
        setLoadingJobDetails(true)
        setCompleteJobData(null)

        try {
            const response = await apiClient.getJobById(job.id)
            setCompleteJobData(response)
        } catch (error) {
            console.error('Failed to fetch complete job data:', error)
            toast.error('Failed to load complete job details')
        } finally {
            setLoadingJobDetails(false)
        }
    }

    return (
        <UniversityDashboardLayout>
            <div className="w-full overflow-x-hidden">
            <div className="mb-3 sm:mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Live Jobs
                    </h1>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                        Discover and apply to the best job opportunities.
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="h-10 shrink-0 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                </Button>
            </div>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-4">
                <div className="min-w-0">
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
                                    namePrefix="uni-jobs-sheet"
                                />
                            </MobileFilterBottomSheet>
                            <Button
                                type="submit"
                                className="hidden h-10 shrink-0 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-500 sm:inline-flex"
                            >
                                Search
                            </Button>
                        </form>

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
                    ) : paginatedJobs.length === 0 ? (
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
                            {paginatedJobs.map((job, index) => (
                                <UniversityJobCard
                                    key={job.id}
                                    job={job}
                                    onViewDescription={() => handleViewJobDescription(job)}
                                    onApprove={() => handleApproveJob(job)}
                                    onReject={() => handleRejectJob(job)}
                                    onNotApprove={() => handleNotApproveJob(job)}
                                    isProcessing={processingJobs.has(job.id)}
                                    cardIndex={index}
                                    onViewApplications={() => handleViewAppliedStudents(job)}
                                    onEdit={() => handleEditJob(job)}
                                    onDelete={() => handleDeleteJob(job)}
                                    onSendAssignment={() => handleSendAssignment(job)}
                                    onViewResults={() => handleViewResults(job)}
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

                <StickyFilterPanel title="Filter Jobs" onClear={clearFilters}>
                    <div className="space-y-4 text-sm">
                        <JobsFilterFields
                            filters={filters}
                            datePosted={datePostedFilter}
                            onFilterChange={handleFilterChange}
                            onDatePostedChange={handleDesktopDateChange}
                            dense
                            namePrefix="uni-jobs-sidebar"
                        />
                        <Button
                            type="button"
                            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                            className="h-10 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
                        >
                            Show Results
                        </Button>
                    </div>
                </StickyFilterPanel>
            </div>
            </div>

            {/* Job Description Modal */}
            {selectedJob && (
                <JobDescriptionModal
                    job={completeJobData || {
                        id: selectedJob.id,
                        title: selectedJob.title,
                        description: selectedJob.description,
                        requirements: selectedJob.requirements,
                        responsibilities: selectedJob.responsibilities || '',
                        job_type: selectedJob.job_type,
                        status: selectedJob.status,
                        location: selectedJob.location,
                        remote_work: selectedJob.remote_work || false,
                        travel_required: selectedJob.travel_required || false,
                        onsite_office: selectedJob.onsite_office || false,
                        salary_min: selectedJob.salary_min ? Number(selectedJob.salary_min) : undefined,
                        salary_max: selectedJob.salary_max ? Number(selectedJob.salary_max) : undefined,
                        salary_currency: selectedJob.salary_currency || 'INR',
                        experience_min: selectedJob.experience_min,
                        experience_max: selectedJob.experience_max,
                        education_level: selectedJob.education_level,
                        education_degree: selectedJob.education_degree,
                        education_branch: selectedJob.education_branch,
                        skills_required: selectedJob.skills_required,
                        application_deadline: selectedJob.application_deadline,
                        max_applications: 0,
                        current_applications: 0,
                        industry: selectedJob.industry,
                        selection_process: selectedJob.selection_process,
                        campus_drive_date: selectedJob.campus_drive_date,
                        views_count: 0,
                        applications_count: 0,
                        created_at: selectedJob.created_at || '',
                        corporate_id: selectedJob.corporate_id || '',
                        corporate_name: selectedJob.company_name,
                        is_active: selectedJob.is_active || true,
                        can_apply: selectedJob.can_apply || false,
                        number_of_openings: selectedJob.number_of_openings,
                        perks_and_benefits: selectedJob.perks_and_benefits,
                        eligibility_criteria: selectedJob.eligibility_criteria,
                        service_agreement_details: selectedJob.service_agreement_details,
                        ctc_with_probation: selectedJob.ctc_with_probation,
                        ctc_after_probation: selectedJob.ctc_after_probation,
                        expiration_date: selectedJob.expiration_date
                    }}
                    onClose={() => {
                        setSelectedJob(null)
                        setCompleteJobData(null)
                    }}
                    onApply={() => { }} // Not applicable for university view
                    isApplying={loadingJobDetails}
                    showApplyButton={false} // Hide apply button in university context
                />
            )}

            {/* Rejection Confirmation Modal */}
            <ConfirmationModal
                isOpen={showRejectModal}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
                title="Not Approve Job"
                message={`Are you sure you want to not approve this job? This action will remove the job from your university's job list and cannot be undone.`}
                confirmText="Not Approve"
                cancelText="Cancel"
                isLoading={jobToReject ? processingJobs.has(jobToReject.id) : false}
                variant="danger"
            />

            {/* Create Job Modal */}
            <CreateJobModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onJobCreated={handleJobCreated}
                userType="university"
            />

            {/* Applied Students Modal */}
            <UniversityAppliedStudentsModal
                isOpen={showAppliedStudentsModal}
                onClose={() => {
                    setShowAppliedStudentsModal(false)
                    setSelectedJobForStudents(null)
                }}
                job={selectedJobForStudents ? {
                    id: selectedJobForStudents.id,
                    title: selectedJobForStudents.title,
                    company_name: selectedJobForStudents.company_name,
                    corporate_name: selectedJobForStudents.corporate_name,
                    university_id: selectedJobForStudents.university_id
                } : null}
            />

            {/* Edit Job Modal */}
            {editingJob && (
                <EditJobModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setEditingJob(null)
                    }}
                    onJobUpdated={handleJobUpdated}
                    isUniversity={true}
                    job={{
                        id: editingJob.id,
                        title: editingJob.title,
                        description: editingJob.description,
                        requirements: editingJob.requirements || '',
                        responsibilities: editingJob.responsibilities || '',
                        job_type: editingJob.job_type,
                        status: editingJob.status,
                        location: editingJob.location,
                        remote_work: editingJob.remote_work || false,
                        travel_required: editingJob.travel_required || false,
                        mode_of_work: editingJob.mode_of_work || 'onsite',
                        salary_min: editingJob.salary_min ? Number(editingJob.salary_min) : undefined,
                        salary_max: editingJob.salary_max ? Number(editingJob.salary_max) : undefined,
                        salary_currency: editingJob.salary_currency || 'INR',
                        experience_min: editingJob.experience_min,
                        experience_max: editingJob.experience_max,
                        education_level: editingJob.education_level,
                        education_degree: editingJob.education_degree,
                        education_branch: editingJob.education_branch,
                        skills_required: editingJob.skills_required || [],
                        application_deadline: editingJob.application_deadline,
                        max_applications: editingJob.max_students || 0,
                        current_applications: 0,
                        industry: editingJob.industry,
                        selection_process: editingJob.selection_process,
                        campus_drive_date: editingJob.campus_drive_date,
                        views_count: 0,
                        applications_count: 0,
                        created_at: editingJob.created_at || '',
                        corporate_id: editingJob.corporate_id || '',
                        corporate_name: editingJob.company_name,
                        is_active: editingJob.is_active || true,
                        can_apply: editingJob.can_apply || false,
                        number_of_openings: editingJob.number_of_openings,
                        perks_and_benefits: editingJob.perks_and_benefits,
                        eligibility_criteria: editingJob.eligibility_criteria,
                        service_agreement_details: editingJob.service_agreement_details,
                        ctc_with_probation: editingJob.ctc_with_probation,
                        ctc_after_probation: editingJob.ctc_after_probation,
                        expiration_date: editingJob.expiration_date,
                        // Company information fields (for university-created jobs)
                        company_name: editingJob.company_name,
                        company_logo: editingJob.company_logo,
                        company_website: editingJob.company_website,
                        company_address: editingJob.company_address,
                        company_size: editingJob.company_size,
                        company_type: editingJob.company_type,
                        company_founded: editingJob.company_founded,
                        company_description: editingJob.company_description,
                        contact_person: editingJob.contact_person,
                        contact_designation: editingJob.contact_designation
                    } as any}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setJobToDelete(null)
                }}
                onConfirm={handleConfirmDelete}
                jobTitle={jobToDelete?.title || ''}
                isDeleting={isDeleting}
            />

            {/* Assignment Results Modal */}
            {selectedJobForResults && (
                <JobAssignmentResultsModal
                    isOpen={showResultsModal}
                    onClose={() => {
                        setShowResultsModal(false)
                        setSelectedJobForResults(null)
                    }}
                    job={selectedJobForResults}
                />
            )}
        </UniversityDashboardLayout>
    )
}

export default function UniversityJobs() {
    return (
        <ErrorBoundary>
            <UniversityJobsPageContent />
        </ErrorBoundary>
    )
}