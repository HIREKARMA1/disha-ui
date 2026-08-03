"use client"

import {
    ChevronUp,
    ChevronDown,
    Eye,
    Calendar,
    Building,
    FileText,
    User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/student/ui/StatusBadge'

export interface UniversityApplicationRow {
    id: string
    job_id: string
    student_id: string
    university_id?: string
    status: string
    applied_at: string
    updated_at?: string
    cover_letter?: string
    expected_salary?: number
    availability_date?: string
    corporate_notes?: string
    interview_date?: string
    interview_location?: string
    offer_letter_url?: string
    offer_letter_uploaded_at?: string
    job_title?: string
    student_name?: string
    student_email?: string
    batch?: string | null
    degree?: string | null
    branch?: string | null
    company_name?: string | null
    corporate_name?: string
    creator_type?: string
    is_university_created?: boolean
    can_update_status?: boolean
}

interface UniversityApplicationTableProps {
    applications: UniversityApplicationRow[]
    loading: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
    onSort: (field: string) => void
    onStatusUpdate?: (application: UniversityApplicationRow) => void
    pagination: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
    onPageChange: (page: number) => void
}

function displayValue(value?: string | null) {
    const trimmed = value?.trim()
    return trimmed ? trimmed : '—'
}

export function UniversityApplicationTable({
    applications,
    loading,
    sortBy,
    sortOrder,
    onSort,
    onStatusUpdate,
    pagination,
    onPageChange,
}: UniversityApplicationTableProps) {
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: '2-digit',
            })
        } catch {
            return '—'
        }
    }

    const companyName = (application: UniversityApplicationRow) =>
        displayValue(application.company_name || application.corporate_name)

    const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <button
            onClick={() => onSort(field)}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
            {children}
            {sortBy === field &&
                (sortOrder === 'asc' ? (
                    <ChevronUp className="w-3 h-3" />
                ) : (
                    <ChevronDown className="w-3 h-3" />
                ))}
        </button>
    )

    const renderActions = (application: UniversityApplicationRow) => {
        if (!onStatusUpdate) return null

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusUpdate(application)}
                className="flex items-center gap-1 shrink-0"
                title={
                    application.can_update_status
                        ? 'Update Application Status'
                        : 'View Application Details'
                }
            >
                <Eye className="w-4 h-4" />
                <span>View</span>
            </Button>
        )
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="animate-pulse space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (applications.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/50 p-10 text-center">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    No applications found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Student applications for your jobs will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible md:overflow-hidden h-auto min-h-fit">
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-white/10 overflow-visible">
                {applications.map((application) => (
                    <article
                        key={`mobile-${application.id}`}
                        className="p-3 space-y-2.5 h-auto overflow-visible"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                                    {displayValue(application.job_title)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                                    <Building className="w-3 h-3 shrink-0" />
                                    {companyName(application)}
                                </p>
                            </div>
                            <StatusBadge status={application.status} className="shrink-0" />
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                            <p className="flex items-center gap-1 min-w-0">
                                <User className="w-3 h-3 shrink-0 text-gray-400" />
                                <span className="truncate">{displayValue(application.student_name)}</span>
                            </p>
                            <p className="truncate">
                                <span className="text-gray-400">Batch:</span>{' '}
                                {displayValue(application.batch)}
                            </p>
                            <p className="truncate">
                                <span className="text-gray-400">Degree:</span>{' '}
                                {displayValue(application.degree)}
                            </p>
                            <p className="truncate">
                                <span className="text-gray-400">Branch:</span>{' '}
                                {displayValue(application.branch)}
                            </p>
                            <p className="col-span-2 flex items-center gap-1 text-gray-500">
                                <Calendar className="w-3 h-3" />
                                Applied {formatDate(application.applied_at)}
                            </p>
                        </div>

                        <div>{renderActions(application)}</div>
                    </article>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[980px]">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <SortButton field="job_title">Job Title</SortButton>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SortButton field="corporate_name">Company Name</SortButton>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SortButton field="student_name">Student Name</SortButton>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                    Batch
                                </span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                    Degree
                                </span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                    Branch
                                </span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SortButton field="status">Status</SortButton>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <SortButton field="applied_at">Applied Date</SortButton>
                            </th>
                            <th className="px-4 py-3 text-center">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                    Actions
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {applications.map((application) => (
                            <tr
                                key={application.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                                        {displayValue(application.job_title)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {companyName(application)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {displayValue(application.student_name)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {displayValue(application.batch)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {displayValue(application.degree)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {displayValue(application.branch)}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={application.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-white">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        {formatDate(application.applied_at)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        {renderActions(application)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.total_pages > 1 && (
                <div className="px-2.5 md:px-6 py-2 md:py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
                        <div className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} applications
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-sm"
                            >
                                Previous
                            </Button>
                            <span className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300">
                                Page {pagination.page} of {pagination.total_pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.total_pages}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-sm"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
