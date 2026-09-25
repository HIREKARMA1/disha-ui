"use client"

import { useState, useCallback, type ReactElement, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Users, Eye, CheckCircle, X, Bookmark, Share2 } from 'lucide-react'
import { formatSalaryRange } from '@/lib/currency'
import { displayJobTitle } from '@/lib/jobSkillMatch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { SalaryBadge, hasJobSalary } from '@/components/jobs/SalaryBadge'
import { ShareJobModal } from '@/components/jobs/ShareJobModal'
import { Tooltip } from '@/components/ui/tooltip'
import toast from 'react-hot-toast'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { getCampusDriveRequestApplyOverride } from '@/lib/campusDriveInterest'

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
    is_campus_drive?: boolean
    is_public?: boolean | null
    public_access_level?: string | null
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
    campus_drive_request_status?: string | null
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
    /** @deprecated Match % badge removed from UI; ranking still uses match_score upstream */
    showMatchScore?: boolean
    /** @deprecated Match % badge removed from UI */
    matchScore?: number
    /** Highlight when selected in split view */
    selected?: boolean
    /** Click card body (not View/Apply) to select job for right panel */
    onSelect?: () => void
    /** Quieter layout on small screens (hide secondary badges) */
    compactMobile?: boolean
}

export function JobCard({
    job,
    onViewDescription,
    onApply,
    isApplying = false,
    cardIndex = 0,
    showMatchScore: _showMatchScore = false,
    matchScore: _matchScore,
    selected = false,
    onSelect,
    compactMobile = false,
}: JobCardProps) {
    const { isSaved, toggle: toggleSaved } = useSavedJobs(job?.id)
    const [showShareModal, setShowShareModal] = useState(false)
    const closeShareModal = useCallback(() => setShowShareModal(false), [])
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
        const requestOverride = getCampusDriveRequestApplyOverride(
            job.campus_drive_request_status
        )
        return (
            !job.application_status &&
            !isDeadlineExpired() &&
            job.can_apply &&
            !requestOverride
        )
    }

    const applyButtonLabel = () => {
        if (isApplying) return null
        if (job.application_status === 'applied') return 'Applied'
        if (job.application_status === 'selected') return 'Selected'
        if (job.application_status === 'rejected') return 'Not Selected'
        if (job.application_status === 'shortlisted') return 'Shortlisted'
        if (job.application_status === 'pending') return 'Under Review'
        const requestOverride = getCampusDriveRequestApplyOverride(
            job.campus_drive_request_status
        )
        if (requestOverride === 'pending') return 'Pending'
        if (requestOverride === 'rejected') return 'Rejected'
        if (isDeadlineExpired()) return 'Expired'
        return 'Apply'
    }

    const statusLower = String(job.status || '').toLowerCase()
    const isLive =
        Boolean(job.is_active) &&
        Boolean(job.can_apply) &&
        !isDeadlineExpired() &&
        statusLower !== 'closed' &&
        statusLower !== 'expired'
    const isExpiredCard = isDeadlineExpired() || statusLower === 'expired' || statusLower === 'closed'

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
                    <span className="inline-flex items-center gap-1 rounded-md border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:border-primary-700/50 dark:bg-primary-900/30 dark:text-primary-200">
                        <CheckCircle className="h-3 w-3" />
                        Applied
                    </span>
                )
                break
            case 'shortlisted':
                badge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#f58020]">
                        <Users className="h-3 w-3" />
                        Shortlisted
                    </span>
                )
                break
            case 'selected':
                badge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#098855]">
                        <CheckCircle className="h-3 w-3" />
                        Selected
                    </span>
                )
                break
            case 'rejected':
                badge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#d64246]">
                        <X className="h-3 w-3" />
                        Not Selected
                    </span>
                )
                break
            case 'pending':
                badge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-secondary-600 dark:text-secondary-400">
                        <Clock className="h-3 w-3" />
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
            className={cn(
                'group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition-[box-shadow,border-color] duration-200 dark:border-[#1A2233] dark:bg-[#141A29] dark:shadow-none sm:p-4',
                selected
                    ? 'border-primary-300 bg-primary-50/40 shadow-sm ring-1 ring-primary-200/60 dark:border-primary-600/50 dark:bg-primary-950/30 dark:ring-primary-700/40'
                    : 'hover:border-primary-200 hover:shadow-md dark:hover:border-[#33405E] dark:hover:bg-[#1B2334]',
                isLive &&
                    !selected &&
                    'border-l-[3px] border-l-primary-500 dark:border-l-primary-400',
                isExpiredCard &&
                    !selected &&
                    'border-gray-200/90 bg-gray-50/70 opacity-90 dark:border-[#1A2233] dark:bg-[#10141c]/80 dark:opacity-80',
                onSelect && 'cursor-pointer'
            )}
            onClick={onSelect}
            data-job-card-id={job.id}
            aria-selected={selected}
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
                            <div className="flex flex-wrap items-center gap-1.5">
                                <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 dark:text-white">
                                    {displayJobTitle(typeof job.title === 'string' ? job.title : String(job.title || ''))}
                                </h3>
                                <span className="inline-flex items-center rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                    {getJobTypeLabel(jobType)}
                                </span>
                                {isLive && (
                                    <span className="inline-flex items-center gap-1 rounded border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                                        Live
                                    </span>
                                )}
                                {job.is_campus_drive && (
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded border border-secondary-200 bg-secondary-50 px-1.5 py-0.5 text-[10px] font-medium text-secondary-700 dark:border-secondary-700/40 dark:bg-secondary-950/40 dark:text-secondary-300',
                                            compactMobile && 'hidden sm:inline-flex'
                                        )}
                                    >
                                        Campus Drive
                                    </span>
                                )}
                                {job.is_public && job.public_access_level === 'premium' && (
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/40 dark:text-amber-300',
                                            compactMobile && 'hidden sm:inline-flex'
                                        )}
                                    >
                                        Premium Users
                                    </span>
                                )}
                            </div>
                            {companyDisplayName && (
                                <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                                    {companyDisplayName}
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
                            {isDeadlineNear() && !isDeadlineExpired() && (
                                <span className="hidden items-center gap-1 text-[11px] font-semibold text-[#f58020] sm:inline-flex">
                                    <Clock className="h-3 w-3" />
                                    Apply Soon
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShowShareModal(true)
                                }}
                                className={cn(
                                    'rounded-md p-1.5 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-300',
                                    compactMobile && 'hidden sm:inline-flex'
                                )}
                                aria-label="Share job"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    const saved = toggleSaved(job.id)
                                    toast.success(saved ? 'Job saved' : 'Removed from saved jobs')
                                }}
                                className={cn(
                                    'rounded-md p-1.5 transition-colors',
                                    isSaved
                                        ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300'
                                        : 'text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40'
                                )}
                                aria-label={isSaved ? 'Unsave job' : 'Save job'}
                                aria-pressed={isSaved}
                            >
                                <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:gap-3 sm:text-sm">
                        <span className="inline-flex min-w-0 flex-1 items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary-500" />
                            <span className="truncate">
                                {Array.isArray(job.location) ? job.location.join(', ') : (job.location || 'Location TBA')}
                            </span>
                        </span>
                        {hasJobSalary(job.salary_min, job.salary_max) ? (
                            <SalaryBadge
                                salaryMin={job.salary_min}
                                salaryMax={job.salary_max}
                            />
                        ) : (
                            <span className="shrink-0 text-gray-500 dark:text-gray-400">
                                {formatSalaryRange(job.salary_min, job.salary_max)}
                            </span>
                        )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div
                            className={cn(
                                'flex flex-wrap items-center gap-1.5',
                                compactMobile && 'hidden sm:flex'
                            )}
                        >
                            {isOnCampusJob() && (
                                <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                    On Campus
                                </span>
                            )}
                            {(job.number_of_openings || 0) > 1 && (
                                <span className="inline-flex items-center gap-1 rounded border border-[#f58020]/25 bg-[#f58020]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#f58020]">
                                    <Users className="h-3 w-3" />
                                    {job.number_of_openings} Vacancies
                                </span>
                            )}
                            {isDeadlineNear() && !isDeadlineExpired() && (
                                <span className="inline-flex items-center gap-1 rounded border border-[#fec40d]/30 bg-[#fec40d]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#b3880a] dark:text-[#fec40d]">
                                    Urgent
                                </span>
                            )}
                        </div>

                        <div
                            className={cn(
                                'flex items-center gap-2',
                                compactMobile ? 'w-full sm:ml-auto sm:w-auto' : 'ml-auto'
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                onClick={onViewDescription}
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'h-8 rounded-md border-gray-200 px-3 text-xs shadow-none dark:border-gray-600',
                                    compactMobile && 'h-9 flex-1 sm:h-8 sm:flex-none'
                                )}
                            >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                View
                            </Button>
                            <Button
                                onClick={onApply}
                                disabled={!canApply() || isApplying}
                                size="sm"
                                className={cn(
                                    'h-8 rounded-md px-4 text-xs font-semibold shadow-none',
                                    compactMobile && 'h-9 flex-1 sm:h-8 sm:flex-none',
                                    job.application_status === 'applied'
                                        ? 'bg-primary-600 text-white hover:bg-primary-600'
                                        : !canApply()
                                          ? 'cursor-not-allowed bg-gray-300 text-white dark:bg-gray-600'
                                          : 'bg-primary-600 text-white hover:bg-primary-700'
                                )}
                            >
                                {isApplying ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Applying
                                    </span>
                                ) : (
                                    applyButtonLabel()
                                )}
                            </Button>
                        </div>
                    </div>

                    {job.application_status && job.application_status !== 'none' && (
                        <div className={cn('mt-2', compactMobile && 'hidden sm:block')}>
                            {getApplicationStatusDisplay(job.application_status)}
                        </div>
                    )}
                </div>
            </div>

            <ShareJobModal
                isOpen={showShareModal}
                onClose={closeShareModal}
                job={job}
            />
        </motion.div>
    )
}
