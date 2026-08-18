"use client"

import { motion } from 'framer-motion'
import { MapPin, Banknote, Users, Eye, CheckCircle, MoreVertical, Edit, Trash2, UserCheck, Send, XCircle } from 'lucide-react'
import { formatSalaryRange } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { apiClient } from '@/lib/api'
import { useState, useEffect, useRef } from 'react'

const corporateLogoCache = new Map<string, Promise<string | null>>()

function fetchCorporateLogo(corporateId: string): Promise<string | null> {
    const existing = corporateLogoCache.get(corporateId)
    if (existing) return existing
    const request = apiClient
        .getPublicCorporateProfile(corporateId)
        .then((profile) => {
            const logo = (profile?.company_logo || profile?.profile_picture || '').trim()
            return logo || null
        })
        .catch(() => null)
    corporateLogoCache.set(corporateId, request)
    return request
}

interface UniversityJob {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    company_name?: string
    company_verified?: boolean
    corporate_name?: string
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

export function UniversityJobCard({
    job,
    onViewDescription,
    onApprove,
    onNotApprove,
    isProcessing = false,
    onViewApplications,
    onEdit,
    onDelete,
    onSendAssignment,
    onViewResults
}: UniversityJobCardProps) {
    const [showDropdown, setShowDropdown] = useState(false)
    const [resolvedLogo, setResolvedLogo] = useState(job.company_logo || '')
    const dropdownRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        const directLogo = (job.company_logo || '').trim()
        if (directLogo) {
            setResolvedLogo(directLogo)
            return
        }

        const corporateId = job.corporate_id
        const hasCorporateId = Boolean(
            corporateId &&
            corporateId !== 'None' &&
            corporateId !== 'null' &&
            corporateId !== 'undefined'
        )
        if (!hasCorporateId) {
            setResolvedLogo('')
            return
        }

        let cancelled = false
        fetchCorporateLogo(corporateId as string).then((logo) => {
            if (!cancelled && logo) setResolvedLogo(logo)
        })
        return () => {
            cancelled = true
        }
    }, [job.company_logo, job.corporate_id])

    if (!job || typeof job !== 'object') {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <p className="text-red-600 dark:text-red-400 text-center">Invalid job data</p>
            </div>
        )
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

    const isOnCampusJob = Boolean(job.university_id && !job.corporate_id)
    const isPending = job.approval_status === 'pending'
    const isApproved = job.approval_status === 'approved'
    const isRejected = job.approval_status === 'rejected'
    const showMenu = isOnCampusJob || isPending

    const companyDisplayName =
        (typeof job.company_name === 'string' && job.company_name) ||
        (typeof job.corporate_name === 'string' && job.corporate_name) ||
        ''
    const jobType = typeof job.job_type === 'string' ? job.job_type : String(job.job_type || '')
    const locationText = Array.isArray(job.location)
        ? job.location.join(', ')
        : (job.location || 'Location TBA')

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.25 }}
            className="group relative rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#151b2b] shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-200 p-3.5 sm:p-4"
        >
            <div className="flex items-start gap-3 sm:gap-4">
                <CompanyLogo
                    logoUrl={resolvedLogo}
                    companyName={companyDisplayName}
                    size="md"
                    className="bg-white dark:bg-white/10 text-blue-600 dark:text-blue-300"
                />

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
                            {showMenu && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10"
                                        aria-label="Job actions"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-[#1a2234] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg">
                                            <div className="py-1">
                                                {isPending && onNotApprove && (
                                                    <button
                                                        onClick={() => {
                                                            onNotApprove()
                                                            setShowDropdown(false)
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Not Approve
                                                    </button>
                                                )}
                                                {onViewApplications && (
                                                    <button
                                                        onClick={() => {
                                                            onViewApplications()
                                                            setShowDropdown(false)
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        View Application
                                                    </button>
                                                )}
                                                {onEdit && (
                                                    <button
                                                        onClick={() => {
                                                            onEdit()
                                                            setShowDropdown(false)
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit Job
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => {
                                                            onDelete()
                                                            setShowDropdown(false)
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete Job
                                                    </button>
                                                )}
                                                {onSendAssignment && (
                                                    <button
                                                        onClick={() => {
                                                            onSendAssignment()
                                                            setShowDropdown(false)
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        Send Assignment
                                                    </button>
                                                )}
                                                {onViewResults && (
                                                    <button
                                                        onClick={() => {
                                                            onViewResults()
                                                            setShowDropdown(false)
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Results
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 min-w-0">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                            <span className="truncate">{locationText}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                            {formatSalaryRange(job.salary_min, job.salary_max)}
                        </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {isOnCampusJob && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                    On Campus
                                </span>
                            )}
                            {(job.number_of_openings || job.max_students || 0) > 1 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/20">
                                    <Users className="w-3 h-3" />
                                    {job.number_of_openings || job.max_students} Vacancies
                                </span>
                            )}
                            {isApproved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white border border-blue-500">
                                    <CheckCircle className="w-3 h-3" />
                                    Approved
                                </span>
                            )}
                            {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-red-500/15 text-red-400 border border-red-500/20">
                                    <XCircle className="w-3 h-3" />
                                    Not Approved
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
                            {isPending ? (
                                <Button
                                    onClick={onApprove}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="h-8 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                                >
                                    {isProcessing ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing
                                        </span>
                                    ) : (
                                        'Approve'
                                    )}
                                </Button>
                            ) : isApproved ? (
                                <Button
                                    disabled
                                    size="sm"
                                    className="h-8 px-4 rounded-lg text-xs font-semibold bg-blue-600 text-white border-0 cursor-default hover:bg-blue-600"
                                >
                                    Approved
                                </Button>
                            ) : isRejected ? (
                                <Button
                                    disabled
                                    size="sm"
                                    className="h-8 px-4 rounded-lg text-xs font-semibold bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-white"
                                >
                                    Not Approved
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
