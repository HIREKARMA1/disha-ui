"use client"

import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, DollarSign, Users, Building, Eye, FileText, CheckCircle, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MatchScorePieChart } from './MatchScorePieChart'

interface Job {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: string
    status: string
    location: string
    remote_work: boolean
    travel_required: boolean
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    education_level?: string
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
    application_status?: string
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

    // Generate distinct color combinations for consecutive job cards
    const getCardColorScheme = (index: number) => {
        const colors = [
            { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', hover: 'hover:border-blue-300 dark:hover:border-blue-600' },
            { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', hover: 'hover:border-green-300 dark:hover:border-green-600' },
            { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700', hover: 'hover:border-emerald-300 dark:hover:border-emerald-600' },
            { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700', hover: 'hover:border-red-300 dark:hover:border-red-600' },
            { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', hover: 'hover:border-purple-300 dark:hover:border-purple-600' },
            { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', hover: 'hover:border-orange-300 dark:hover:border-orange-600' },
            { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-700', hover: 'hover:border-cyan-300 dark:hover:border-cyan-600' },
            { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-700', hover: 'hover:border-pink-300 dark:hover:border-pink-600' },
            { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-700', hover: 'hover:border-indigo-300 dark:hover:border-indigo-600' }
        ]

        // Use card index to ensure consecutive cards have distinct colors
        return colors[index % colors.length]
    }

    const cardColors = getCardColorScheme(cardIndex)
    const formatSalary = (currency: string, min?: number, max?: number) => {
        try {
            if (!min && !max) return 'Not specified'
            if (min && max) return `${currency} ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`
            if (min) return `${currency} ${Number(min).toLocaleString()}+`
            if (max) return `${currency} Up to ${Number(max).toLocaleString()}`
            return 'Not specified'
        } catch (error) {
            console.error('Error formatting salary:', error, { min, max, currency })
            return 'Not specified'
        }
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
            full_time: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            part_time: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            contract: 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            internship: 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            freelance: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${cardColors.bg} rounded-xl border ${cardColors.border} ${cardColors.hover} transition-all duration-200 hover:shadow-md group flex flex-col h-full`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {typeof job.title === 'string' ? job.title : String(job.title || '')}
                        </h3>
                        {job.corporate_name && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                {typeof job.corporate_name === 'string' ? job.corporate_name : String(job.corporate_name || '')}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            getJobTypeColor(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))
                        )}>
                            {getJobTypeLabel(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))}
                        </span>
                        {/* Prominent Match Score Badge */}
                        {showMatchScore && matchScore !== undefined && (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${matchScore >= 80 ? 'bg-green-500 text-white' :
                                matchScore >= 60 ? 'bg-orange-500 text-white' :
                                    'bg-red-500 text-white'
                                }`}>
                                {Math.round(matchScore)}% Match
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{typeof job.location === 'string' ? job.location : String(job.location || '')}</span>
                        {job.remote_work && (
                            <span className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded">
                                Remote
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="truncate">{formatSalary(job.salary_currency, job.salary_min, job.salary_max)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span className="truncate">{formatExperience(job.experience_min, job.experience_max)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="truncate">{Number(job.current_applications || 0)}/{Number(job.max_applications || 0)}</span>
                    </div>
                </div>



                {/* Skills */}
                {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {job.skills_required.slice(0, 3).map((skill, index) => {
                                // Ensure skill is a string
                                const skillText = typeof skill === 'string' ? skill : String(skill || '')
                                return (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                                    >
                                        {skillText}
                                    </span>
                                )
                            })}
                            {job.skills_required.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                                    +{job.skills_required.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {typeof job.description === 'string' ? job.description : String(job.description || '')}
                </p>

                {/* Additional Info */}
                <div className="space-y-2 mb-4 flex-1">
                    {job.industry && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Building className="w-3 h-3" />
                            <span>{typeof job.industry === 'string' ? job.industry : String(job.industry || '')}</span>
                        </div>
                    )}

                    {job.application_deadline && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
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
                        <Clock className="w-3 h-3" />
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
                <div className="flex gap-3 mt-auto pt-4">
                    <Button
                        onClick={onViewDescription}
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                    >
                        <FileText className="w-4 h-4" />
                        View JD
                    </Button>

                    <Button
                        onClick={onApply}
                        disabled={!canApply() || isApplying}
                        size="sm"
                        className={cn(
                            "flex-1 flex items-center gap-2 transition-all duration-200 hover:shadow-md",
                            !canApply()
                                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                : "bg-primary-500 hover:bg-primary-600"
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
