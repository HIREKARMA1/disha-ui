'use client'

import { motion } from 'framer-motion'
import {
    MapPin,
    Briefcase,
    IndianRupee,
    Users,
    Building,
    FileText,
    MoreVertical,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    UserCheck,
} from 'lucide-react'
import { formatSalaryRange } from '@/lib/currency'
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
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    expiration_date?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
    onsite_office?: boolean
    mode_of_work?: string
    company_logo?: string
}

interface CorporateJobCardProps {
    job: Job
    onViewDescription: () => void
    onEdit: () => void
    onDelete: () => void
    onStatusChange: (job: Job, newStatus: string) => void
    onViewAppliedStudents: () => void
    cardIndex?: number
}

const ACCENT_SCHEMES = [
    {
        border: 'border-blue-200 dark:border-blue-500/30',
        logo: 'bg-blue-500',
        ring: 'text-blue-500',
        track: 'stroke-blue-500/20',
        fill: 'stroke-blue-500',
    },
    {
        border: 'border-emerald-200 dark:border-emerald-500/30',
        logo: 'bg-emerald-500',
        ring: 'text-emerald-500',
        track: 'stroke-emerald-500/20',
        fill: 'stroke-emerald-500',
    },
    {
        border: 'border-violet-200 dark:border-violet-500/30',
        logo: 'bg-violet-500',
        ring: 'text-violet-500',
        track: 'stroke-violet-500/20',
        fill: 'stroke-violet-500',
    },
    {
        border: 'border-orange-200 dark:border-orange-500/30',
        logo: 'bg-orange-500',
        ring: 'text-orange-500',
        track: 'stroke-orange-500/20',
        fill: 'stroke-orange-500',
    },
]

export function CorporateJobCard({
    job,
    onViewDescription,
    onEdit,
    onDelete,
    onStatusChange,
    onViewAppliedStudents,
    cardIndex = 0,
}: CorporateJobCardProps) {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!job || typeof job !== 'object') {
        return (
            <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
                <p className="text-red-600 dark:text-red-400 text-center">Invalid job data</p>
            </div>
        )
    }

    const accent = ACCENT_SCHEMES[cardIndex % ACCENT_SCHEMES.length]
    const applicants = Number(job.current_applications || job.applications_count || 0)
    const maxApps = Math.max(Number(job.max_applications || 0), applicants, 1)
    const progress = Math.min(100, Math.round((applicants / maxApps) * 100))
    const circumference = 2 * Math.PI * 28
    const dash = (progress / 100) * circumference

    const daysActive = (() => {
        try {
            const created = new Date(job.created_at)
            if (isNaN(created.getTime())) return 0
            return Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000))
        } catch {
            return 0
        }
    })()

    const formatExperience = (min?: number, max?: number) => {
        if (min === undefined && max === undefined) return 'Not specified'
        if (min !== undefined && max !== undefined) return `${min}-${max} years`
        if (min !== undefined) return `${min}+ years`
        if (max !== undefined) return `Up to ${max} years`
        return 'Not specified'
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return '—'
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        } catch {
            return '—'
        }
    }

    const getJobTypeLabel = (jobType: string) => {
        const labels: Record<string, string> = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            contract: 'Contract',
            internship: 'Internship',
            freelance: 'Freelance',
        }
        return labels[jobType] || jobType
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: 'Active',
            inactive: 'Inactive',
            closed: 'Closed',
            paused: 'Paused',
        }
        return labels[status] || status
    }

    const workMode = (() => {
        if (job.mode_of_work === 'hybrid') return 'Hybrid'
        if (job.mode_of_work === 'onsite') return 'Onsite'
        if (job.mode_of_work === 'remote') return 'Remote'
        return job.remote_work ? 'Remote' : 'Onsite'
    })()

    const locationText = Array.isArray(job.location) ? job.location.join(', ') : job.location || ''
    const companyInitial = (job.corporate_name || job.title || 'J').charAt(0).toUpperCase()

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
                'relative rounded-[18px] border bg-white/90 dark:bg-[#0D1628]',
                'shadow-sm dark:shadow-[0_8px_32px_rgba(59,130,246,0.08)] hover:shadow-lg transition-all duration-300',
                'p-4 md:p-5 lg:p-6',
                accent.border
            )}
        >
            {/* Mobile menu — top right */}
            <div className="absolute top-3 right-3 z-10 lg:hidden" ref={dropdownRef}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="h-8 w-8 p-0 rounded-lg"
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
                {showDropdown && (
                    <div className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161d2c] shadow-xl overflow-hidden">
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    onViewAppliedStudents()
                                    setShowDropdown(false)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 flex items-center gap-2"
                            >
                                <UserCheck className="w-4 h-4" />
                                View Applied Students
                            </button>
                            <button
                                onClick={() => {
                                    onEdit()
                                    setShowDropdown(false)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Job
                            </button>
                            <button
                                onClick={() => {
                                    onDelete()
                                    setShowDropdown(false)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Job
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5">
                {/* Logo + title block for mobile */}
                <div className="flex items-start gap-3 lg:contents">
                <div
                    className={cn(
                        'w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md',
                        accent.logo
                    )}
                >
                    {job.company_logo ? (
                        <img src={job.company_logo} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        companyInitial
                    )}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 space-y-2 pr-8 lg:pr-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                            {job.title}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-full border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-300">
                            {getJobTypeLabel(job.job_type)}
                        </span>
                        <span
                            className={cn(
                                'px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full',
                                job.status === 'active'
                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                    : job.status === 'closed'
                                      ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                                      : 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300'
                            )}
                        >
                            {getStatusLabel(job.status)}
                        </span>
                    </div>

                    {job.corporate_name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">{job.corporate_name}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {job.corporate_name && (
                            <span className="hidden lg:inline-flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5" />
                                {job.corporate_name}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {locationText || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            {workMode}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {formatExperience(job.experience_min, job.experience_max)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {applicants} Applicants
                        </span>
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {job.skills_required.slice(0, 5).map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300"
                                >
                                    {typeof skill === 'string' ? skill : String(skill)}
                                </span>
                            ))}
                            {job.skills_required.length > 5 && (
                                <span className="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500">
                                    +{job.skills_required.length - 5}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                </div>

                {/* Mobile footer: salary | ring | View JD */}
                <div className="flex items-center justify-between gap-3 lg:hidden pt-1 border-t border-gray-100 dark:border-white/[0.06]">
                    <div className="min-w-0">
                        <div className="flex items-center gap-0.5 text-sm font-bold text-gray-900 dark:text-white">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span className="truncate">{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            Posted on {formatDate(job.created_at)}
                        </p>
                    </div>
                    <div className="relative w-14 h-14 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" className={accent.track} />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                strokeWidth="5"
                                strokeLinecap="round"
                                className={accent.fill}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - dash}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn('text-xs font-bold', accent.ring)}>{applicants}</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onViewDescription}
                        className="rounded-xl h-9 text-xs border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex-shrink-0"
                    >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        View JD
                    </Button>
                </div>

                {/* Desktop salary / ring / actions — unchanged */}
                <div className="hidden lg:block lg:text-right flex-shrink-0 space-y-1">
                    <div className="flex items-center lg:justify-end gap-1 text-base font-bold text-gray-900 dark:text-white">
                        <IndianRupee className="w-4 h-4" />
                        {formatSalaryRange(job.salary_min, job.salary_max)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Posted on {formatDate(job.created_at)}
                    </p>
                </div>

                <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" className={accent.track} />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                strokeWidth="5"
                                strokeLinecap="round"
                                className={accent.fill}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - dash}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn('text-sm font-bold', accent.ring)}>{applicants}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Applicants</p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Active for {daysActive} day{daysActive === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 flex-shrink-0 lg:flex-col xl:flex-row">
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        {showDropdown && (
                            <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161d2c] shadow-xl overflow-hidden">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            onViewAppliedStudents()
                                            setShowDropdown(false)
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 flex items-center gap-2"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        View Applied Students
                                    </button>
                                    <button
                                        onClick={() => {
                                            onEdit()
                                            setShowDropdown(false)
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Job
                                    </button>
                                    {job.status !== 'active' && (
                                        <button
                                            onClick={() => {
                                                onStatusChange(job, 'active')
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2"
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
                                            className="w-full px-4 py-2.5 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center gap-2"
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
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                                        >
                                            <ToggleLeft className="w-4 h-4" />
                                            Set to Closed
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            onDelete()
                                            setShowDropdown(false)
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Job
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={onViewDescription}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50"
                    >
                        <FileText className="w-4 h-4 mr-1.5" />
                        View JD
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
