"use client"

import { motion } from 'framer-motion'
import {
    MapPin,
    Briefcase,
    IndianRupee,
    Building,
    FileText,
    CheckCircle,
    Calendar,
    GraduationCap,
    XCircle,
    MoreVertical,
    Edit,
    Trash2,
    UserCheck,
    Send,
    Eye,
} from 'lucide-react'
import { formatSalaryRange } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

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
    university_id?: string
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

interface UniversityJobCardProps {
    job: UniversityJob
    onViewDescription: () => void
    onApprove?: () => void
    onReject?: () => void
    onNotApprove?: () => void
    isProcessing?: boolean
    cardIndex?: number
    onViewApplications?: () => void
    onEdit?: () => void
    onDelete?: () => void
    onSendAssignment?: () => void
    onViewResults?: () => void
}

const ACCENT_SCHEMES = [
    {
        border: 'border-blue-200 dark:border-blue-500/30',
        logo: 'bg-blue-500',
    },
    {
        border: 'border-emerald-200 dark:border-emerald-500/30',
        logo: 'bg-emerald-500',
    },
    {
        border: 'border-violet-200 dark:border-violet-500/30',
        logo: 'bg-violet-500',
    },
    {
        border: 'border-orange-200 dark:border-orange-500/30',
        logo: 'bg-orange-500',
    },
]

export function UniversityJobCard({
    job,
    onViewDescription,
    onApprove,
    onNotApprove,
    isProcessing = false,
    cardIndex = 0,
    onViewApplications,
    onEdit,
    onDelete,
    onSendAssignment,
    onViewResults,
}: UniversityJobCardProps) {
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
            <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
                <p className="text-red-600 dark:text-red-400 text-center">Invalid job data</p>
            </div>
        )
    }

    const accent = ACCENT_SCHEMES[cardIndex % ACCENT_SCHEMES.length]
    const locationText = Array.isArray(job.location) ? job.location.join(', ') : String(job.location || '')
    const companyInitial = (job.company_name || job.title || 'J').charAt(0).toUpperCase()
    const isUniversityCreated = job.university_id && !job.corporate_id

    const formatDate = (dateString: string) => {
        try {
            if (!dateString || typeof dateString !== 'string') return '—'
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

    const getApprovalStatusColor = () => {
        if (job.rejected || job.approval_status === 'rejected') {
            return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
        }
        if (job.approved || job.approval_status === 'approved') {
            return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        }
        return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300'
    }

    const getApprovalStatusLabel = () => {
        if (job.rejected || job.approval_status === 'rejected') return 'Not Approved'
        if (job.approved || job.approval_status === 'approved') return 'Approved'
        return 'Pending'
    }

    const isDeadlineExpired = () => {
        try {
            if (!job.application_deadline) return false
            const deadline = new Date(job.application_deadline)
            return !isNaN(deadline.getTime()) && deadline < new Date()
        } catch {
            return false
        }
    }

    const DropdownMenu = ({ className }: { className?: string }) => (
        showDropdown ? (
            <div className={cn(
                'absolute right-0 z-50 w-52 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161d2c] shadow-xl overflow-hidden',
                className
            )}>
                <div className="py-1">
                    {onViewApplications && (
                        <button
                            onClick={() => { onViewApplications(); setShowDropdown(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 flex items-center gap-2"
                        >
                            <UserCheck className="w-4 h-4" />
                            View Application
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={() => { onEdit(); setShowDropdown(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Job
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => { onDelete(); setShowDropdown(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Job
                        </button>
                    )}
                    {onSendAssignment && (
                        <button
                            onClick={() => { onSendAssignment(); setShowDropdown(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Send Assignment
                        </button>
                    )}
                    {onViewResults && (
                        <button
                            onClick={() => { onViewResults(); setShowDropdown(false) }}
                            className="w-full px-4 py-2.5 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            View Results
                        </button>
                    )}
                </div>
            </div>
        ) : null
    )

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
            {/* Mobile menu */}
            {isUniversityCreated && (
                <div className="absolute top-3 right-3 z-10 lg:hidden" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="h-8 w-8 p-0 rounded-lg"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                    <DropdownMenu className="top-9" />
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5">
                    <div className="flex items-start gap-3 lg:contents">
                        <div className={cn(
                            'w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md overflow-hidden',
                            accent.logo
                        )}>
                            {job.company_logo ? (
                                <img src={job.company_logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                companyInitial
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 pr-8 lg:pr-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                                    {typeof job.title === 'string' ? job.title : String(job.title || '')}
                                </h3>
                                <span className="px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-full border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-300">
                                    {getJobTypeLabel(typeof job.job_type === 'string' ? job.job_type : String(job.job_type || ''))}
                                </span>
                                <span className={cn('px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full', getApprovalStatusColor())}>
                                    {getApprovalStatusLabel()}
                                </span>
                                {isUniversityCreated && (
                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/30">
                                        On Campus
                                    </span>
                                )}
                            </div>

                            {job.company_name && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5" />
                                    {typeof job.company_name === 'string' ? job.company_name : String(job.company_name || '')}
                                    {job.company_verified && (
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {locationText || '—'}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    {formatSalaryRange(job.salary_min, job.salary_max)}
                                </span>
                                {job.campus_drive_date && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Drive: {formatDate(job.campus_drive_date)}
                                    </span>
                                )}
                                {job.max_students && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        Max: {job.max_students}
                                    </span>
                                )}
                            </div>

                            {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills_required.slice(0, 5).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300"
                                        >
                                            {typeof skill === 'string' ? skill : String(skill || '')}
                                        </span>
                                    ))}
                                    {job.skills_required.length > 5 && (
                                        <span className="px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500">
                                            +{job.skills_required.length - 5}
                                        </span>
                                    )}
                                </div>
                            )}

                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {typeof job.description === 'string' ? job.description : String(job.description || '')}
                            </p>
                        </div>
                    </div>

                    {/* Desktop menu */}
                    {isUniversityCreated && (
                        <div className="hidden lg:block relative flex-shrink-0" ref={dropdownRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                            <DropdownMenu className="top-10" />
                        </div>
                    )}
                </div>

                {isDeadlineExpired() && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Application deadline expired
                    </p>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                    <Button
                        onClick={onViewDescription}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50"
                    >
                        <FileText className="w-4 h-4 mr-1.5" />
                        View Details
                    </Button>

                    {job.approval_status === 'pending' && (
                        <>
                            <Button
                                onClick={onApprove}
                                disabled={isProcessing}
                                size="sm"
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isProcessing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Approve
                                    </>
                                )}
                            </Button>
                            {onNotApprove && (
                                <Button
                                    onClick={onNotApprove}
                                    disabled={isProcessing}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-gray-200 dark:border-white/10"
                                >
                                    <XCircle className="w-4 h-4 mr-1.5" />
                                    Not Approve
                                </Button>
                            )}
                        </>
                    )}

                    {job.approval_status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approved
                        </span>
                    )}

                    {job.approval_status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium px-2">
                            <XCircle className="w-3.5 h-3.5" />
                            Not Approved
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
