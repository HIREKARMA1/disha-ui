"use client"

import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, IndianRupee, Users, Building, Eye, CheckCircle, Calendar, X, Bookmark } from 'lucide-react'
import { formatSalaryRange } from '@/lib/currency'
import { Button } from '@/components/ui/button'
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
        switch (status) {
            case 'applied':
                return (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Application Submitted
                    </span>
                )
            case 'shortlisted':
                return (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        Shortlisted
                    </span>
                )
            case 'selected':
                return (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Selected! 🎉
                    </span>
                )
            case 'rejected':
                return (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-1">
                        <X className="w-3 h-3" />
                        Not Selected
                    </span>
                )
            case 'pending':
                return (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Under Review
                    </span>
                )
            default:
                return null
        }
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
    const companyInitial = companyDisplayName ? companyDisplayName.charAt(0).toUpperCase() : '?'
    const jobType = typeof job.job_type === 'string' ? job.job_type : String(job.job_type || '')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
            className="group flex flex-col h-full rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden"
        >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    {/* Company avatar */}
                    {job.company_logo ? (
                        <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <img
                                src={job.company_logo}
                                alt={companyDisplayName || 'Company logo'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-lg font-bold shadow-sm shadow-primary-500/20">
                            {companyInitial}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug">
                            {typeof job.title === 'string' ? job.title : String(job.title || '')}
                        </h3>
                        {companyDisplayName && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5 truncate">
                                <Building className="w-3.5 h-3.5 shrink-0" />
                                {companyDisplayName}
                            </p>
                        )}
                    </div>

                    {/* Bookmark (visual only) */}
                    <button
                        type="button"
                        onClick={(e) => e.preventDefault()}
                        className="shrink-0 p-2 rounded-full text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        aria-label="Bookmark job"
                    >
                        <Bookmark className="w-4 h-4" />
                    </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {isOnCampusJob() && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            🎓 On Campus
                        </span>
                    )}
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full border",
                        getJobTypeColor(jobType)
                    )}>
                        {getJobTypeLabel(jobType)}
                    </span>
                    {showMatchScore && matchScore !== undefined && (
                        <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full shadow-sm",
                            matchScore >= 80 ? 'bg-green-500 text-white' :
                                matchScore >= 60 ? 'bg-orange-500 text-white' :
                                    'bg-red-500 text-white'
                        )}>
                            {Math.round(matchScore)}% Match
                        </span>
                    )}
                </div>

                {/* Job Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                            <span className="truncate text-gray-700 dark:text-gray-300">
                                {Array.isArray(job.location) ? job.location.join(', ') : (job.location || '')}
                            </span>
                            {getWorkModeBadge()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="truncate text-gray-700 dark:text-gray-300 font-medium">
                            {formatSalaryRange(job.salary_min, job.salary_max)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="truncate text-gray-700 dark:text-gray-300">
                            {formatExperience(job.experience_min, job.experience_max)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="truncate text-gray-700 dark:text-gray-300">
                            {Number(job.current_applications || 0)} applicants
                        </span>
                    </div>
                </div>

                {/* Skills */}
                {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-wrap gap-1.5">
                            {job.skills_required.slice(0, 3).map((skill, index) => {
                                const skillText = typeof skill === 'string' ? skill : String(skill || '')
                                return (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 text-[11px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700"
                                    >
                                        {skillText}
                                    </span>
                                )
                            })}
                            {job.skills_required.length > 3 && (
                                <span className="px-2.5 py-1 text-[11px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
                                    +{job.skills_required.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {typeof job.description === 'string' ? job.description : String(job.description || '')}
                </p>

                {/* Additional Info */}
                <div className="space-y-2 mb-4 flex-1">
                    {job.industry && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Building className="w-3 h-3 shrink-0" />
                            <span>{typeof job.industry === 'string' ? job.industry : String(job.industry || '')}</span>
                        </div>
                    )}

                    {job.application_deadline && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>Deadline: {formatDate(job.application_deadline)}</span>
                            {isDeadlineNear() && (
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                    (Deadline near!)
                                </span>
                            )}
                            {isDeadlineExpired() && (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                    (Expired)
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                </div>

                {/* Status Indicators - moved above buttons for consistent alignment */}
                {job.application_status && job.application_status !== 'none' && (
                    <div className="mb-3 text-center">
                        {getApplicationStatusDisplay(job.application_status)}
                    </div>
                )}

                {isDeadlineExpired() && !job.application_status && (
                    <div className="mb-3 text-center">
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Application Deadline Expired
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        onClick={onViewDescription}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200"
                    >
                        <Eye className="w-4 h-4" />
                        View JD
                    </Button>

                    <Button
                        onClick={onApply}
                        disabled={!canApply() || isApplying}
                        size="sm"
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 rounded-xl transition-all duration-200",
                            !canApply()
                                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                                : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 text-white border-0"
                        )}
                    >
                        {isApplying ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Applying...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {job.application_status === 'applied' ? 'Applied' :
                                    job.application_status === 'selected' ? 'Selected' :
                                        job.application_status === 'rejected' ? 'Not Selected' :
                                            job.application_status === 'shortlisted' ? 'Shortlisted' :
                                                job.application_status === 'pending' ? 'Under Review' :
                                                    isDeadlineExpired() ? 'Expired' : 'Apply Now'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
