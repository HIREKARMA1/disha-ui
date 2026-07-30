"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Plus, Briefcase, Calendar, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { CorporateJobCard } from '@/components/dashboard/CorporateJobCard'
import { CreateJobModal } from '@/components/dashboard/CreateJobModal'
import { EditJobModal } from '@/components/dashboard/EditJobModal'
import { DeleteConfirmationModal } from '@/components/dashboard/DeleteConfirmationModal'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { CorporateAppliedStudentsModal } from '@/components/corporate/CorporateAppliedStudentsModal'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporatePagination } from '@/components/corporate/ui/CorporatePagination'
import { corpCard, corpInput } from '@/components/corporate/ui/corporate-theme'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Job {
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
    onsite_office?: boolean
    mode_of_work?: string
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    education_level?: string | string[]
    education_degree?: string | string[]
    education_branch?: string | string[]
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
    corporate_id: string
    corporate_name?: string
    is_active: boolean
    can_apply: boolean
    // Additional fields
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    expiration_date?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
}

export default function CorporateJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        status: '',
        job_type: '',
        industry: ''
    })
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [editingJob, setEditingJob] = useState<Job | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJobModal, setShowJobModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showAppliedStudentsModal, setShowAppliedStudentsModal] = useState(false)
    const [selectedJobForStudents, setSelectedJobForStudents] = useState<Job | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0
    })

    // Fetch corporate jobs
    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getCorporateJobs()
            console.log('🔍 Jobs fetched from API:', response)
            if (response.length > 0) {
                console.log('First job data:', response[0])
                console.log('First job job_type:', response[0].job_type)
            }
            setJobs(response)
            setPagination(prev => ({
                ...prev,
                total: response.length,
                total_pages: Math.ceil(response.length / prev.limit)
            }))
        } catch (error: any) {
            console.error('Failed to fetch jobs:', error)
            toast.error('Failed to load jobs. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    // Filter jobs based on search and filters
    const filteredJobs = jobs.filter(job => {
        const locationString = Array.isArray(job.location) ? job.location.join(' ') : job.location
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            locationString.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !filters.status || job.status === filters.status
        const matchesJobType = !filters.job_type || job.job_type === filters.job_type
        const matchesIndustry = !filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())

        return matchesSearch && matchesStatus && matchesJobType && matchesIndustry
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

    const handleCreateJob = () => {
        setShowCreateModal(true)
    }

    const handleJobCreated = () => {
        fetchJobs() // Refresh the jobs list
    }

    const handleJobUpdated = () => {
        fetchJobs() // Refresh the jobs list
    }

    const handleViewJob = (job: Job) => {
        setSelectedJob(job)
        setShowJobModal(true)
    }

    const handleEditJob = (job: Job) => {
        console.log('🔍 handleEditJob called with job:', job)
        console.log('Job type in handleEditJob:', job.job_type)
        setEditingJob(job)
        setShowEditModal(true)
    }

    const handleDeleteJob = (job: Job) => {
        setJobToDelete(job)
        setShowDeleteModal(true)
    }

    const handleViewAppliedStudents = (job: Job) => {
        setSelectedJobForStudents(job)
        setShowAppliedStudentsModal(true)
    }

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return

        setIsDeleting(true)
        try {
            await apiClient.deleteJob(jobToDelete.id)
            toast.success('Job deleted successfully!')
            fetchJobs() // Refresh the jobs list
            setShowDeleteModal(false)
            setJobToDelete(null)
        } catch (error: any) {
            console.error('Failed to delete job:', error)
            toast.error('Failed to delete job. Please try again.')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleStatusChange = async (job: Job, newStatus: string) => {
        try {
            await apiClient.changeJobStatus(job.id, newStatus)

            const statusMessages = {
                active: 'activated',
                inactive: 'deactivated',
                closed: 'closed'
            }

            const message = statusMessages[newStatus as keyof typeof statusMessages] || 'updated'
            toast.success(`Job ${message} successfully!`)
            fetchJobs() // Refresh the jobs list
        } catch (error: any) {
            console.error('Failed to change job status:', error)
            toast.error('Failed to change job status. Please try again.')
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilters({
            status: '',
            job_type: '',
            industry: ''
        })
    }

    return (
        <CorporateDashboardLayout>
            <div className="space-y-4 md:space-y-6 main-content max-w-[1400px] mx-auto">
                <CorporatePageHero
                    title="Job Postings 💼"
                    subtitle="Manage and track all your job postings."
                    chips={[
                        {
                            label: new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            }),
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Talent Acquisition',
                            tone: 'green',
                            icon: <Users className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Growth Opportunities',
                            tone: 'purple',
                            icon: <TrendingUp className="w-3.5 h-3.5" />,
                        },
                    ]}
                />

                <div className={cn(corpCard, 'p-4 md:p-5 relative overflow-visible')}>
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search jobs by title, description, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={cn(corpInput, 'pl-10 h-11')}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleCreateJob}
                                className="flex-1 lg:flex-none h-11 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Job
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex-1 lg:flex-none h-11 rounded-xl border-gray-200 dark:border-white/10"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-white/[0.06] overflow-hidden"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="z-[60]">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Job Type
                                    </label>
                                    <Select
                                        value={filters.job_type || 'all'}
                                        onValueChange={(value) =>
                                            setFilters((prev) => ({ ...prev, job_type: value === 'all' ? '' : value }))
                                        }
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent sideOffset={4} className="z-[60]">
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="full_time">Full Time</SelectItem>
                                            <SelectItem value="part_time">Part Time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="internship">Internship</SelectItem>
                                            <SelectItem value="freelance">Freelance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Industry
                                    </label>
                                    <Input
                                        placeholder="e.g., Technology, Finance"
                                        value={filters.industry}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, industry: e.target.value }))}
                                        className="rounded-xl"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {(searchTerm || filters.status || filters.job_type || filters.industry) && (
                        <div className="flex justify-end mt-3">
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-lg">
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>

                {!loading && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 px-1">
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{pagination.total}</span> jobs
                    </p>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                className={cn(corpCard, 'p-6 animate-pulse h-32')}
                            />
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {paginatedJobs.map((job, index) => (
                                <CorporateJobCard
                                    key={job.id}
                                    job={job}
                                    onViewDescription={() => handleViewJob(job)}
                                    onEdit={() => handleEditJob(job)}
                                    onDelete={() => handleDeleteJob(job)}
                                    onStatusChange={handleStatusChange}
                                    onViewAppliedStudents={() => handleViewAppliedStudents(job)}
                                    cardIndex={index}
                                />
                            ))}
                        </div>

                        {pagination.total_pages > 0 && (
                            <CorporatePagination
                                page={pagination.page}
                                totalPages={pagination.total_pages}
                                total={pagination.total}
                                limit={pagination.limit}
                                itemLabel="jobs"
                                onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                                onLimitChange={(limit) =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        limit,
                                        page: 1,
                                        total_pages: Math.ceil(prev.total / limit),
                                    }))
                                }
                                limitOptions={[5, 10, 20]}
                            />
                        )}
                    </>
                ) : (
                    <div className={cn(corpCard, 'text-center py-12 px-6')}>
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {searchTerm || filters.status || filters.job_type || filters.industry
                                ? 'No jobs found matching your criteria'
                                : 'No job postings yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchTerm || filters.status || filters.job_type || filters.industry
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first job posting to start attracting talent.'}
                        </p>
                        {!searchTerm && !filters.status && !filters.job_type && !filters.industry && (
                            <Button
                                onClick={handleCreateJob}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Job
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateJobModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onJobCreated={handleJobCreated}
            />

            <EditJobModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setEditingJob(null)
                }}
                onJobUpdated={handleJobUpdated}
                job={editingJob}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setJobToDelete(null)
                }}
                onConfirm={confirmDeleteJob}
                jobTitle={jobToDelete?.title || ''}
                isDeleting={isDeleting}
            />

            {selectedJob && (
                <JobDescriptionModal
                    job={selectedJob}
                    onClose={() => {
                        setShowJobModal(false)
                        setSelectedJob(null)
                    }}
                    onApply={() => { }} // Not applicable for corporate view
                    isApplying={false}
                    showApplyButton={false} // Hide apply button in corporate context
                />
            )}

            <CorporateAppliedStudentsModal
                isOpen={showAppliedStudentsModal}
                onClose={() => {
                    setShowAppliedStudentsModal(false)
                    setSelectedJobForStudents(null)
                }}
                job={selectedJobForStudents}
            />
        </CorporateDashboardLayout>
    )
}
