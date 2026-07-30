'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Calendar,
    IndianRupee,
    FileText,
    Eye,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    MapPin,
    Mail,
    Phone,
    Briefcase,
    MoreVertical,
} from 'lucide-react'
import { formatAmountINR } from '@/lib/currency'
import { ApplicationData } from '@/app/dashboard/corporate/applications/page'
import { CorporatePagination } from '@/components/corporate/ui/CorporatePagination'
import { corpCard } from '@/components/corporate/ui/corporate-theme'
import { cn } from '@/lib/utils'

interface ApplicationTableProps {
    applications: ApplicationData[]
    isLoading: boolean
    error: string | null
    onStatusUpdate: (application: ApplicationData) => void
    onOfferLetterUpload: (application: ApplicationData) => void
    onRetry: () => void
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalCount?: number
    pageSize?: number
    onPageSizeChange?: (size: number) => void
}

type SortField = 'student_name' | 'job_title' | 'applied_at' | 'expected_salary' | 'status'
type SortDirection = 'asc' | 'desc' | null

function formatStudentPhone(phone?: string | null): string | null {
    if (!phone) return null
    const trimmed = String(phone).trim()
    if (!trimmed) return null
    const digits = trimmed.replace(/\D/g, '')
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
    }
    if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    }
    if (trimmed.startsWith('+')) return trimmed
    return trimmed
}

export function ApplicationTable({
    applications,
    isLoading,
    error,
    onStatusUpdate,
    onRetry,
    currentPage,
    totalPages,
    onPageChange,
    totalCount,
    pageSize = 10,
    onPageSizeChange,
}: ApplicationTableProps) {
    const [sortField, setSortField] = useState<SortField | null>('applied_at')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
            case 'shortlisted':
                return 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300'
            case 'selected':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
            case 'pending':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            applied: 'Applied',
            shortlisted: 'Shortlisted',
            selected: 'Selected',
            rejected: 'Rejected',
            withdrawn: 'Withdrawn',
            pending: 'Pending',
        }
        return labels[status] || status
    }

    const getStatusHint = (status: string) => {
        const hints: Record<string, string> = {
            applied: 'Application submitted',
            shortlisted: 'Under review',
            selected: 'Candidate selected',
            rejected: 'Not selected',
            withdrawn: 'Withdrawn by candidate',
            pending: 'Awaiting action',
        }
        return hints[status] || ''
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
        if (sortDirection === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
        return <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
    }

    const sortedApplications = useMemo(() => {
        if (!sortField) return applications
        return [...applications].sort((a, b) => {
            let aValue: any
            let bValue: any
            switch (sortField) {
                case 'student_name':
                    aValue = a.student_name.toLowerCase()
                    bValue = b.student_name.toLowerCase()
                    break
                case 'job_title':
                    aValue = a.job_title.toLowerCase()
                    bValue = b.job_title.toLowerCase()
                    break
                case 'applied_at':
                    aValue = new Date(a.applied_at)
                    bValue = new Date(b.applied_at)
                    break
                case 'expected_salary':
                    aValue = a.expected_salary || 0
                    bValue = b.expected_salary || 0
                    break
                case 'status':
                    aValue = a.status
                    bValue = b.status
                    break
                default:
                    return 0
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [applications, sortField, sortDirection])

    if (isLoading) {
        return (
            <div className={cn(corpCard, 'p-10 flex items-center justify-center')}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn(corpCard, 'p-8 text-center')}>
                <FileText className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Error Loading Applications
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (applications.length === 0) {
        return (
            <div className={cn(corpCard, 'p-8 text-center')}>
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Applications Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    No applications match your current filters.
                </p>
            </div>
        )
    }

    const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
            {children}
            {getSortIcon(field)}
        </button>
    )

    return (
        <div className="space-y-4">
            <div className={cn(corpCard, 'overflow-hidden p-0')}>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/80 dark:bg-white/[0.02]">
                                <th className="px-5 py-3.5 text-left">
                                    <SortHeader field="student_name">Student</SortHeader>
                                </th>
                                <th className="px-5 py-3.5 text-left">
                                    <SortHeader field="job_title">Job Title</SortHeader>
                                </th>
                                <th className="px-5 py-3.5 text-left">
                                    <SortHeader field="status">Status</SortHeader>
                                </th>
                                <th className="px-5 py-3.5 text-left">
                                    <SortHeader field="applied_at">Applied Date</SortHeader>
                                </th>
                                <th className="px-5 py-3.5 text-left">
                                    <SortHeader field="expected_salary">Expected Salary</SortHeader>
                                </th>
                                <th className="px-5 py-3.5 text-right">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedApplications.map((application, index) => {
                                const appAny = application as ApplicationData & {
                                    phone?: string
                                    student_phone?: string
                                    location?: string
                                    job_location?: string
                                    job_type?: string
                                    salary_min?: number
                                    salary_max?: number
                                }
                                const location = appAny.location || appAny.job_location
                                const { date, time } = formatDate(application.applied_at)

                                return (
                                    <motion.tr
                                        key={application.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.03 }}
                                        className="border-b border-gray-50 dark:border-white/[0.04] hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.06] transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-bold text-white">
                                                        {application.student_name?.charAt(0)?.toUpperCase() || (
                                                            <User className="w-4 h-4 text-white" />
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {application.student_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                                        {application.student_email || 'Email not available'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {application.job_title}
                                            </p>
                                            {appAny.job_type && (
                                                <span className="inline-flex mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                                    {String(appAny.job_type).replace('_', ' ')}
                                                </span>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {application.corporate_name}
                                            </p>
                                            {location && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {location}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                                                    getStatusColor(application.status)
                                                )}
                                            >
                                                {getStatusLabel(application.status)}
                                            </span>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                                {getStatusHint(application.status)}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                                                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium">{date}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                                <IndianRupee className="w-4 h-4 mr-1.5 text-gray-400" />
                                                {application.expected_salary
                                                    ? formatAmountINR(application.expected_salary)
                                                    : 'Not specified'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => onStatusUpdate(application)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Details
                                            </button>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards — match screenshot */}
                <div className="md:hidden space-y-2.5 p-2.5">
                    {sortedApplications.map((application, index) => {
                        const { date, time } = formatDate(application.applied_at)
                        const appAny = application as ApplicationData & {
                            phone?: string
                            location?: string
                            job_location?: string
                            experience?: string
                            student_experience?: string
                            experience_min?: number
                            experience_max?: number
                        }
                        const phone =
                            formatStudentPhone(application.student_phone || appAny.phone) ||
                            'Phone not available'
                        const location =
                            appAny.location || appAny.job_location || application.interview_location || '—'
                        const experience =
                            appAny.experience ||
                            appAny.student_experience ||
                            (appAny.experience_min != null || appAny.experience_max != null
                                ? `${appAny.experience_min ?? 0} – ${appAny.experience_max ?? appAny.experience_min ?? 0} years`
                                : '—')

                        return (
                            <motion.div
                                key={application.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#0D1628] p-4 space-y-3.5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {application.student_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate text-[15px]">
                                                    {application.student_name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                                    {phone}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-1 flex-shrink-0">
                                                <div className="text-right">
                                                    <span
                                                        className={cn(
                                                            'inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
                                                            getStatusColor(application.status)
                                                        )}
                                                    >
                                                        {getStatusLabel(application.status)}
                                                    </span>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                                        {getStatusHint(application.status)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => onStatusUpdate(application)}
                                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                                    aria-label="More actions"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.05]">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {application.job_title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {application.corporate_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    {[
                                        {
                                            icon: Calendar,
                                            label: 'Applied Date',
                                            value: `${date} • ${time}`,
                                        },
                                        {
                                            icon: IndianRupee,
                                            label: 'Expected Salary',
                                            value: application.expected_salary
                                                ? formatAmountINR(application.expected_salary)
                                                : 'Not specified',
                                        },
                                        { icon: MapPin, label: 'Location', value: location },
                                        { icon: Briefcase, label: 'Experience', value: experience },
                                    ].map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex items-center justify-between gap-3 text-xs"
                                        >
                                            <span className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <row.icon className="w-3.5 h-3.5 text-blue-500" />
                                                {row.label}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white text-right">
                                                {row.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => onStatusUpdate(application)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-xl border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <CorporatePagination
                page={currentPage}
                totalPages={Math.max(totalPages, 1)}
                total={totalCount ?? applications.length}
                limit={pageSize}
                itemLabel="applications"
                onPageChange={onPageChange}
                onLimitChange={onPageSizeChange}
                limitOptions={[10, 20, 50]}
            />
        </div>
    )
}
