"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Briefcase, Clock, DollarSign, Users, Building, Eye, FileText, CheckCircle, X, GraduationCap, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { UniversityJobCard } from '@/components/dashboard/UniversityJobCard'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'

interface UniversityJob {
    id: string
    title: string
    description: string
    requirements?: string
    company_name?: string
    company_verified?: boolean
    industry?: string
    location: string
    job_type: string
    salary_min?: string
    salary_max?: string
    application_deadline?: string
    campus_drive_date?: string
    venue?: string
    max_students?: number
    skills_required?: string[]
    status: string
    benefits?: string
    selection_process?: string
    approved: boolean
    corporate_id?: string
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
    const [showFilters, setShowFilters] = useState(false)
    const [processingJobs, setProcessingJobs] = useState<Set<string>>(new Set())
    const [stats, setStats] = useState({
        total_jobs: 0,
        pending_approval: 0,
        approved: 0,
        rejected: 0
    })

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
            job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = !filters.status || job.status === filters.status
        const matchesJobType = !filters.job_type || job.job_type === filters.job_type
        const matchesIndustry = !filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())
        const matchesApproved = !filters.approved ||
            (filters.approved === 'approved' && job.approved) ||
            (filters.approved === 'pending' && !job.approved)

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
                j.id === job.id ? { ...j, approved: true } : j
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

            await apiClient.rejectUniversityJob(job.id)

            // Remove from the list
            setJobs(prev => prev.filter(j => j.id !== job.id))

            // Update stats
            setStats(prev => ({
                ...prev,
                pending_approval: prev.pending_approval - 1,
                rejected: prev.rejected + 1
            }))

            toast.success('Job rejected successfully!')
        } catch (error: any) {
            console.error('Error rejecting job:', error)
            toast.error('Failed to reject job')
        } finally {
            setProcessingJobs(prev => {
                const newSet = new Set(prev)
                newSet.delete(job.id)
                return newSet
            })
        }
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

    return (
        <UniversityDashboardLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Job Management 🎯
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Review and approve job opportunities for your students ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                📈 {stats.total_jobs} Total Jobs
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                ⏳ {stats.pending_approval} Pending
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                ✅ {stats.approved} Approved
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
                            placeholder="Search jobs by title, company, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📍 Location
                            </label>
                            <Input
                                placeholder="City, State"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
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
                                ✅ Approval Status
                            </label>
                            <select
                                value={filters.approved}
                                onChange={(e) => handleFilterChange('approved', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending Approval</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col sm:flex-row items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2 w-full sm:w-auto"
                            >
                                🗑️ Clear All
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Main Content */}
            <div>
                {/* Results Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-gray-600 dark:text-gray-300 text-sm">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                    Loading jobs...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    📊 <span className="font-semibold text-primary-600 dark:text-primary-400">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
                                    </span>
                                </span>
                            )}
                        </div>
                        {pagination.total > 0 && (
                            <div className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                                📄 Page {pagination.page} of {pagination.total_pages} • {pagination.limit} jobs per page
                            </div>
                        )}
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedJobs.map((job, index) => (
                                <UniversityJobCard
                                    key={job.id}
                                    job={job}
                                    onViewDescription={() => setSelectedJob(job)}
                                    onApprove={() => handleApproveJob(job)}
                                    onReject={() => handleRejectJob(job)}
                                    isProcessing={processingJobs.has(job.id)}
                                    cardIndex={index}
                                />
                            ))}
                        </div>

                        {/* Simple Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="mt-8 flex items-center justify-center">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center gap-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ←
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.total_pages)].map((_, i) => {
                                                const pageNum = i + 1
                                                const isCurrentPage = pageNum === pagination.page
                                                const isNearCurrent = Math.abs(pageNum - pagination.page) <= 1
                                                const isFirstOrLast = pageNum === 1 || pageNum === pagination.total_pages

                                                if (isFirstOrLast || isNearCurrent) {
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={isCurrentPage ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`min-w-[32px] h-8 ${isCurrentPage
                                                                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                                                    return <span key={pageNum} className="px-2 text-primary-400 dark:text-primary-300">...</span>
                                                }
                                                return null
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            →
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No jobs found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {searchTerm || filters.status || filters.job_type || filters.industry || filters.approved
                                ? 'Try adjusting your search criteria or filters'
                                : 'No jobs have been assigned to your university yet'
                            }
                        </p>
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2"
                        >
                            🔄 Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Job Description Modal */}
            {selectedJob && (
                <JobDescriptionModal
                    job={{
                        id: selectedJob.id,
                        title: selectedJob.title,
                        description: selectedJob.description,
                        requirements: selectedJob.requirements,
                        responsibilities: '',
                        job_type: selectedJob.job_type,
                        status: selectedJob.status,
                        location: selectedJob.location,
                        remote_work: false,
                        travel_required: false,
                        salary_min: selectedJob.salary_min ? Number(selectedJob.salary_min) : undefined,
                        salary_max: selectedJob.salary_max ? Number(selectedJob.salary_max) : undefined,
                        salary_currency: 'INR',
                        experience_min: undefined,
                        experience_max: undefined,
                        education_level: undefined,
                        skills_required: selectedJob.skills_required,
                        application_deadline: selectedJob.application_deadline,
                        max_applications: 0,
                        current_applications: 0,
                        industry: selectedJob.industry,
                        selection_process: selectedJob.selection_process,
                        campus_drive_date: selectedJob.campus_drive_date,
                        views_count: 0,
                        applications_count: 0,
                        created_at: '',
                        corporate_id: selectedJob.corporate_id || '',
                        corporate_name: selectedJob.company_name,
                        is_active: true,
                        can_apply: false
                    }}
                    onClose={() => setSelectedJob(null)}
                    onApply={() => { }} // Not applicable for university view
                    isApplying={false}
                    showApplyButton={false} // Hide apply button in university context
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






