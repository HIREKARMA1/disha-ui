"use client"

import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, DollarSign, Users, Building, Eye, FileText, Calendar, MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight, GraduationCap, UserCheck, Link2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

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
    onsite_office?: boolean
    mode_of_work?: string
    is_public?: boolean
    public_link_token?: string
}

interface AdminJobCardProps {
    job: Job
    onViewDescription: () => void
    onEdit: (job: Job) => void
    onDelete: (job: Job) => void
    onStatusChange: (job: Job, status: string) => void
    onAssignToUniversity: (job: Job) => void
    onViewAppliedStudents: (job: Job) => void
    onMakePublic: (job: Job) => void
    onCreateAssessment?: (job: Job) => void
    cardIndex?: number
}

export function AdminJobCard({ job, onViewDescription, onEdit, onDelete, onStatusChange, onAssignToUniversity, onViewAppliedStudents, onMakePublic, onCreateAssessment, cardIndex = 0 }: AdminJobCardProps) {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            inactive: 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            closed: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            paused: 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
        return colors[status as keyof typeof colors] || colors.inactive
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            active: 'Active',
            inactive: 'Inactive',
            closed: 'Closed',
            paused: 'Paused'
        }
        return labels[status as keyof typeof labels] || status
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
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                getJobTypeColor(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))
                            )}>
                                {getJobTypeLabel(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))}
                            </span>
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                getStatusColor(typeof job.status === 'string' ? job.status : String(job.status || ''))
                            )}>
                                {getStatusLabel(typeof job.status === 'string' ? job.status : String(job.status || ''))}
                            </span>
                        </div>

                        {/* 3-dots dropdown menu */}
                        <div className="relative" ref={dropdownRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showDropdown && (
                                <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onEdit(job)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Job
                                        </button>

                                        {onCreateAssessment && (
                                            <button
                                                onClick={() => {
                                                    onCreateAssessment(job)
                                                    setShowDropdown(false)
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Create Assessment
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                onAssignToUniversity(job)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                                        >
                                            <GraduationCap className="w-4 h-4" />
                                            Assign to University
                                        </button>

                                        <button
                                            onClick={() => {
                                                onViewAppliedStudents(job)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            View Applied Students
                                        </button>

                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                                        <button
                                            onClick={() => {
                                                onMakePublic(job)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2"
                                        >
                                            {job.is_public ? (
                                                <>
                                                    <Globe className="w-4 h-4" />
                                                    Manage Public Link
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="w-4 h-4" />
                                                    Make Public
                                                </>
                                            )}
                                        </button>

                                        {/* Specific status options */}
                                        {job.status !== 'active' && (
                                            <button
                                                onClick={() => {
                                                    onStatusChange(job, 'active')
                                                    setShowDropdown(false)
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                                            >
                                                <ToggleRight className="w-4 h-4" />
                                                Set to Active
                                            </button>
                                        )}

                                        {job.status !== 'inactive' && (
                                            <button
                                                onClick={() => {
                                                    onStatusChange(job, 'inactive')
                                                    setShowDropdown(false)
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2"
                                            >
                                                <ToggleLeft className="w-4 h-4" />
                                                Set to Inactive
                                            </button>
                                        )}

                                        {job.status !== 'closed' && (
                                            <button
                                                onClick={() => {
                                                    onStatusChange(job, 'closed')
                                                    setShowDropdown(false)
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                                <ToggleLeft className="w-4 h-4" />
                                                Set to Closed
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                onDelete(job)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Job
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{Array.isArray(job.location) ? job.location.join(', ') : (job.location || '')}</span>
                        {(() => {
                            // Determine work mode display
                            if (job.mode_of_work) {
                                if (job.mode_of_work === 'hybrid') {
                                    return (
                                        <span className="text-xs bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 px-2 py-0.5 rounded">
                                            Hybrid
                                        </span>
                                    )
                                } else if (job.mode_of_work === 'onsite') {
                                    return (
                                        <span className="text-xs bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded">
                                            Onsite
                                        </span>
                                    )
                                } else if (job.mode_of_work === 'remote') {
                                    return (
                                        <span className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded">
                                            Remote
                                        </span>
                                    )
                                }
                            } else {
                                // Fallback for existing jobs
                                if (job.remote_work) {
                                    return (
                                        <span className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded">
                                            Remote
                                        </span>
                                    )
                                } else {
                                    return (
                                        <span className="text-xs bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded">
                                            Onsite
                                        </span>
                                    )
                                }
                            }
                        })()}
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
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                </div>

                {/* Action Button - Only View JD */}
                <div className="mt-auto pt-4">
                    <Button
                        onClick={onViewDescription}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                    >
                        <FileText className="w-4 h-4" />
                        View JD
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}