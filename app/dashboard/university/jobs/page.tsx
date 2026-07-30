"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Briefcase, Calendar, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'
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
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporateStatCard } from '@/components/corporate/ui/CorporateStatCard'
import { CorporatePagination } from '@/components/corporate/ui/CorporatePagination'
import { STAT_ACCENTS, corpCard, corpInput } from '@/components/corporate/ui/corporate-theme'
import { cn } from '@/lib/utils'

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
    const [filters, setFilters] = useState({
        status: '',
        job_type: '',
        industry: '',
        approved: ''
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        total_pages: 0
    })
    const [selectedJob, setSelectedJob] = useState<UniversityJob | null>(null)
    const [completeJobData, setCompleteJobData] = useState<any>(null)
    const [loadingJobDetails, setLoadingJobDetails] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
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

    // Filter jobs based on search and filters
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Array.isArray(job.location) ? job.location.join(', ').toLowerCase() : job.location.toLowerCase()).includes(searchTerm.toLowerCase()) ||
            job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !filters.status || job.status === filters.status
        const matchesJobType = !filters.job_type || job.job_type === filters.job_type
        const matchesIndustry = !filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())
        const matchesApproved = !filters.approved ||
            (filters.approved === 'approved' && job.approval_status === 'approved') ||
            (filters.approved === 'pending' && job.approval_status === 'pending') ||
            (filters.approved === 'rejected' && job.approval_status === 'rejected')

        return matchesSearch && matchesStatus && matchesJobType && matchesIndustry && matchesApproved
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

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    // Handle pagination
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
    }

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            status: '',
            job_type: '',
            industry: '',
            approved: ''
        })
        setSearchTerm('')
        setPagination(prev => ({ ...prev, page: 1 }))
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

    return (
        <UniversityDashboardLayout>
            <div className="space-y-4 md:space-y-6 main-content max-w-[1400px] mx-auto">
                <CorporatePageHero
                    title="Job Management"
                    subtitle="Review and approve job opportunities for your students"
                    chips={[
                        {
                            label: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                        {
                            label: `${stats.total_jobs} Total Jobs`,
                            tone: 'green',
                            icon: <Briefcase className="w-3.5 h-3.5" />,
                        },
                        {
                            label: `${stats.pending_approval} Pending`,
                            tone: 'orange',
                            icon: <Clock className="w-3.5 h-3.5" />,
                        },
                        {
                            label: `${stats.approved} Approved`,
                            tone: 'purple',
                            icon: <CheckCircle className="w-3.5 h-3.5" />,
                        },
                    ]}
                    actions={
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="h-10 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Job
                        </Button>
                    }
                />

                <div className="md:hidden grid grid-cols-4 gap-1.5">
                    {[
                        { label: 'Total Jobs', value: stats.total_jobs, icon: Briefcase, accent: 'blue' as const },
                        { label: 'Approved', value: stats.approved, icon: CheckCircle, accent: 'green' as const },
                        { label: 'Pending', value: stats.pending_approval, icon: Clock, accent: 'orange' as const },
                        { label: 'Rejected', value: stats.rejected, icon: XCircle, accent: 'red' as const },
                    ].map((stat, index) => {
                        const tones = STAT_ACCENTS[stat.accent]
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className={cn('rounded-xl border p-2 min-w-0', tones.card)}
                            >
                                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center mb-1.5', tones.icon)}>
                                    <Icon className="w-3 h-3" />
                                </div>
                                <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400 leading-tight line-clamp-2 mb-1">{stat.label}</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none">{stat.value}</p>
                            </motion.div>
                        )
                    })}
                </div>
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <CorporateStatCard label="Total Jobs" value={stats.total_jobs} subtitle="All job postings" icon={Briefcase} accent="blue" index={0} />
                    <CorporateStatCard label="Approved" value={stats.approved} subtitle="Active for students" icon={CheckCircle} accent="green" index={1} />
                    <CorporateStatCard label="Pending" value={stats.pending_approval} subtitle="Awaiting review" icon={Clock} accent="orange" index={2} />
                    <CorporateStatCard label="Not Approved" value={stats.rejected} subtitle="Rejected jobs" icon={XCircle} accent="red" index={3} />
                </div>

                <div className={cn(corpCard, 'p-4 md:p-5')}>
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search jobs by title, company, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(corpInput, 'pl-10 h-11')}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-11 rounded-xl border-gray-200 dark:border-white/10"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-white/[0.06] overflow-hidden"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                    <Input placeholder="City, State" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={cn(corpInput, 'h-10')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
                                    <select value={filters.industry} onChange={(e) => handleFilterChange('industry', e.target.value)} className={cn(corpInput, 'h-10 appearance-none')}>
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
                                    <select value={filters.job_type} onChange={(e) => handleFilterChange('job_type', e.target.value)} className={cn(corpInput, 'h-10 appearance-none')}>
                                        <option value="">All Types</option>
                                        <option value="full_time">Full Time</option>
                                        <option value="part_time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Approval Status</label>
                                    <select value={filters.approved} onChange={(e) => handleFilterChange('approved', e.target.value)} className={cn(corpInput, 'h-10 appearance-none')}>
                                        <option value="">All Status</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Not Approved</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-lg">Clear All</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!loading && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 px-1">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">{pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-blue-600 dark:text-blue-400">{pagination.total}</span> jobs
                    </p>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={cn(corpCard, 'p-6 animate-pulse h-32')} />
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {paginatedJobs.map((job, index) => (
                                <UniversityJobCard
                                    key={job.id}
                                    job={job}
                                    onViewDescription={async () => {
                                        setSelectedJob(job)
                                        setLoadingJobDetails(true)
                                        setCompleteJobData(null)
                                        
                                        try {
                                            // Fetch complete job data from the jobs API
                                            const response = await apiClient.getJobById(job.id)
                                            setCompleteJobData(response)
                                        } catch (error) {
                                            console.error('Failed to fetch complete job data:', error)
                                            toast.error('Failed to load complete job details')
                                            // Still show the modal with limited data
                                        } finally {
                                            setLoadingJobDetails(false)
                                        }
                                    }}
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

                        {pagination.total_pages > 1 && (
                            <CorporatePagination
                                page={pagination.page}
                                totalPages={pagination.total_pages}
                                total={pagination.total}
                                limit={pagination.limit}
                                itemLabel="jobs"
                                onPageChange={handlePageChange}
                                onLimitChange={(limit) =>
                                    setPagination(prev => ({
                                        ...prev,
                                        limit,
                                        page: 1,
                                        total_pages: Math.ceil(prev.total / limit),
                                    }))
                                }
                                limitOptions={[9, 12, 18]}
                            />
                        )}
                    </>
                ) : (
                    <div className={cn(corpCard, 'text-center py-12 px-6')}>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {searchTerm || filters.status || filters.job_type || filters.industry || filters.approved
                                ? 'Try adjusting your search criteria or filters'
                                : 'No jobs have been assigned to your university yet'}
                        </p>
                        <Button onClick={clearFilters} variant="outline" className="rounded-xl border-gray-200 dark:border-white/10">Clear Filters</Button>
                    </div>
                )}
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