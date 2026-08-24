"use client"

import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, Banknote, Users, Building, Eye, CheckCircle, Calendar, X, Bookmark } from 'lucide-react'
import { formatSalaryRange } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { Tooltip } from '@/components/ui/tooltip'
import type { ReactElement, ReactNode } from 'react'
import toast from 'react-hot-toast'
import { useSavedJobs } from '@/hooks/useSavedJobs'

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
    corporate_id?: string | null
    corporate_name?: string
    university_id?: string | null
    // Company information fields (for university-created jobs)
    company_name?: string
    company_logo?: string
    slug?: string | null
    is_active: boolean
    can_apply: boolean
    application_status?: string
    // Additional fields
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    expiration_date?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    onsite_office?: boolean
    mode_of_work?: string
}

interface JobCardProps {
    job: Job
    onViewDescription: () => void
    onApply: () => void
    isApplying?: boolean
    cardIndex?: number // Add card index for consecutive color assignment
    showMatchScore?: boolean // Add option to show match score pie chart
    matchScore?: number // Add match score for career align jobs
}

export function JobCard({ job, onViewDescription, onApply, isApplying = false, cardIndex = 0, showMatchScore = false, matchScore }: JobCardProps) {
    const { isSaved, toggle: toggleSaved } = useSavedJobs(job?.id)
    // Safety check - ensure job object is valid
    if (!job || typeof job !== 'object') {
        console.error('Invalid job object:', job)
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <p className="text-red-600 dark:text-red-400 text-center">Invalid job data</p>
            </div>
        )
    }

    const formatExperience = (min?: number, max?: number) => {
        try {
            if (!min && !max) return 'Not specified'
            if (min && max) return `${Number(min)}-${Number(max)} years`
            if (min) return `${Number(min)}+ years`
            if (max) return `Up to ${Number(max)} years`
            return 'Not specified'
        } catch (error) {
            console.error('Error formatting experience:', error, { min, max })
            return 'Not specified'
        }
    }

    const formatDate = (dateString: string) => {
        try {
            if (!dateString || typeof dateString !== 'string') {
                return 'Invalid date'
            }
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return 'Invalid date'
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            console.error('Error formatting date:', error, dateString)
            return 'Invalid date'
        }
    }

    const getJobTypeColor = (jobType: string) => {
        const colors = {
            full_time: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
            part_time: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            contract: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800',
            internship: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
            freelance: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
        }
        return colors[jobType as keyof typeof colors] || colors.full_time
    }

    const getJobTypeLabel = (jobType: string) => {
        const labels = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            contract: 'Contract',
            internship: 'Internship',
            freelance: 'Freelance'
        }
        return labels[jobType as keyof typeof labels] || jobType
    }

    const isDeadlineNear = () => {
        try {
            if (!job.application_deadline || typeof job.application_deadline !== 'string') return false
            const deadline = new Date(job.application_deadline)
            if (isNaN(deadline.getTime())) return false
            const now = new Date()
            const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            return diffDays <= 7 && diffDays > 0
        } catch (error) {
            console.error('Error checking deadline near:', error)
            return false
        }
    }

    const isDeadlineExpired = () => {
        try {
            if (!job.application_deadline || typeof job.application_deadline !== 'string') return false
            const deadline = new Date(job.application_deadline)
            if (isNaN(deadline.getTime())) return false
            const now = new Date()
            return deadline < now
        } catch (error) {
            console.error('Error checking deadline expired:', error)
            return false
        }
    }

    const canApply = () => {
        return !job.application_status && !isDeadlineExpired() && job.can_apply
    }

    // Check if job is university-created (on-campus job)
    // Matches the logic from UniversityJobCard: university_id exists and no corporate_id
    const isOnCampusJob = () => {
        return job.university_id && !job.corporate_id
    }

    const getApplicationStatusDisplay = (status: string) => {
        const tipByStatus: Record<string, string> = {
            applied: 'You have applied to this job',
            shortlisted: 'Your application was shortlisted for the next round',
            selected: 'You were selected for this role',
            rejected: 'This application was not selected',
            pending: 'Your application is under review',
        }
        const tip = tipByStatus[status]
        let badge: ReactNode = null
        switch (status) {
            case 'applied':
                badge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white border border-blue-500">
                        <CheckCircle className="w-3 h-3" />
                        Applied
                    </span>
                )
                break
            case 'shortlisted':
                badge = (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        Shortlisted
                    </span>
                )
                break
            case 'selected':
                badge = (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Selected! 🎉
                    </span>
                )
                break
            case 'rejected':
                badge = (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-1">
                        <X className="w-3 h-3" />
                        Not Selected
                    </span>
                )
                break
            case 'pending':
                badge = (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Under Review
                    </span>
                )
                break
            default:
                return null
        }
        return tip ? <Tooltip content={tip}>{badge as ReactElement}</Tooltip> : badge
    }

    const getWorkModeBadge = () => {
        if (job.mode_of_work) {
            if (job.mode_of_work === 'hybrid') {
                return (
                    <span className="text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                        Hybrid
                    </span>
                )
            } else if (job.mode_of_work === 'onsite') {
                return (
                    <span className="text-[10px] font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                        Onsite
                    </span>
                )
            } else if (job.mode_of_work === 'remote') {
                return (
                    <span className="text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                        Remote
                    </span>
                )
            }
        } else {
            if (job.remote_work) {
                return (
                    <span className="text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                        Remote
                    </span>
                )
            } else {
                return (
                    <span className="text-[10px] font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                        Onsite
                    </span>
                )
            }
        }
        return null
    }

    const companyDisplayName =
        (typeof job.company_name === 'string' && job.company_name) ||
        (typeof job.corporate_name === 'string' && job.corporate_name) ||
        ''
    const jobType = typeof job.job_type === 'string' ? job.job_type : String(job.job_type || '')

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.25 }}
            className="group relative rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#151b2b] shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-200 p-3.5 sm:p-4"
        >
            <div className="flex items-start gap-3 sm:gap-4">
                {/* Company logo */}
                <CompanyLogo
                    logoUrl={job.company_logo}
                    companyName={companyDisplayName}
                    size="md"
                />

                {/* Main info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                                    {typeof job.title === 'string' ? job.title : String(job.title || '')}
                                </h3>
                                <span className={cn(
                                    'inline-flex items-center px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-md',
                                    'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                                )}>
                                    {getJobTypeLabel(jobType)}
                                </span>
                            </div>
                            {companyDisplayName && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {companyDisplayName}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            {isDeadlineNear() && !isDeadlineExpired() && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400">
                                    <Clock className="w-3 h-3" />
                                    Apply Soon
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    const saved = toggleSaved(job.id)
                                    toast.success(saved ? 'Job saved' : 'Removed from saved jobs')
                                }}
                                className={cn(
                                    'p-1.5 rounded-lg transition-colors',
                                    isSaved
                                        ? 'text-blue-500 bg-blue-500/10 hover:text-blue-600 hover:bg-blue-500/15'
                                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                                )}
                                aria-label={isSaved ? 'Unsave job' : 'Save job'}
                                aria-pressed={isSaved}
                            >
                                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 min-w-0">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                            <span className="truncate">
                                {Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'Location TBA')}
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                            {formatSalaryRange(job.salary_min, job.salary_max)}
                        </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {isOnCampusJob() && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                    On Campus
                                </span>
                            )}
                            {(job.number_of_openings || 0) > 1 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/20">
                                    <Users className="w-3 h-3" />
                                    {job.number_of_openings} Vacancies
                                </span>
                            )}
                            {isDeadlineNear() && !isDeadlineExpired() && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                    ⚡ Urgent Hiring
                                </span>
                            )}
                            {showMatchScore && matchScore !== undefined && (
                                <span className={cn(
                                    'inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md',
                                    matchScore >= 80 ? 'bg-emerald-500 text-white' :
                                        matchScore >= 60 ? 'bg-orange-500 text-white' :
                                            'bg-red-500 text-white'
                                )}>
                                    {Math.round(matchScore)}% Match
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                onClick={onViewDescription}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-lg text-xs border-gray-200 dark:border-white/10"
                            >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View
                            </Button>
                            <Button
                                onClick={onApply}
                                disabled={!canApply() || isApplying}
                                size="sm"
                                className={cn(
                                    'h-8 px-4 rounded-lg text-xs font-semibold',
                                    job.application_status === 'applied'
                                        ? 'bg-blue-600 text-white border-0 cursor-default hover:bg-blue-600'
                                        : !canApply()
                                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-white'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                                )}
                            >
                                {isApplying ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Applying
                                    </span>
                                ) : (
                                    job.application_status === 'applied' ? 'Applied' :
                                        job.application_status === 'selected' ? 'Selected' :
                                            job.application_status === 'rejected' ? 'Not Selected' :
                                                job.application_status === 'shortlisted' ? 'Shortlisted' :
                                                    job.application_status === 'pending' ? 'Under Review' :
                                                        isDeadlineExpired() ? 'Expired' : 'Apply'
                                )}
                            </Button>
                        </div>
                    </div>

                    {job.application_status && job.application_status !== 'none' && (
                        <div className="mt-2">
                            {getApplicationStatusDisplay(job.application_status)}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
