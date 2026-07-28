"use client"

import { useState, useEffect } from 'react'
import {
    ChevronUp,
    ChevronDown,
    Eye,
    Building,
    FileText,
    ClipboardList,
    Undo2,
    MessageSquare,
} from 'lucide-react'
import { formatAmountINR } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { ViewAssignmentModal } from './ViewAssignmentModal'
import { ViewApplicationDetailsModal } from '@/components/university/ViewApplicationDetailsModal'
import { ApplicationCard } from '@/components/student/ui/ApplicationCard'
import { StatusBadge } from '@/components/student/ui/StatusBadge'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ApplicationData {
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
    corporate_name?: string
    creator_type?: string
    is_university_created?: boolean
    can_update_status?: boolean
    has_assignment?: boolean
}

interface StudentApplicationTableProps {
    applications: ApplicationData[]
    loading: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
    onSort: (field: string) => void
    onViewOfferLetter: (application: ApplicationData) => void
    onDownloadOfferLetter: (application: ApplicationData) => void
    onWithdraw?: (application: ApplicationData) => void
    onViewMessages?: (application: ApplicationData) => void
    onStatusUpdate?: (application: ApplicationData) => void
    pagination: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
    onPageChange: (page: number) => void
}

export function StudentApplicationTable({
    applications,
    loading,
    sortBy,
    sortOrder,
    onSort,
    onViewOfferLetter,
    onWithdraw,
    onViewMessages,
    onStatusUpdate,
    pagination,
    onPageChange,
}: StudentApplicationTableProps) {
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
    const [submittedJobModules, setSubmittedJobModules] = useState<Map<string, boolean>>(new Map())
    const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false)
    const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<ApplicationData | null>(null)

    useEffect(() => {
        const checkSubmissions = async () => {
            const submittedModulesStr = localStorage.getItem('submitted_practice_modules')
            if (!submittedModulesStr) return

            try {
                const submittedModuleIds = JSON.parse(submittedModulesStr) as string[]
                if (submittedModuleIds.length === 0) return

                const onCampusJobs = applications.filter(
                    (app) =>
                        (app.creator_type === 'University' || app.is_university_created === true) &&
                        app.has_assignment
                )

                const submissionStatus = new Map<string, boolean>()
                for (const job of onCampusJobs) {
                    try {
                        const modules = await apiClient.getPracticeModulesByJobId(job.job_id)
                        const hasSubmittedModule = modules.some((module: any) =>
                            submittedModuleIds.includes(module.id)
                        )
                        submissionStatus.set(job.job_id, hasSubmittedModule)
                    } catch {
                        submissionStatus.set(job.job_id, false)
                    }
                }
                setSubmittedJobModules(submissionStatus)
            } catch (error) {
                console.error('Error checking submitted modules:', error)
            }
        }

        if (applications.length > 0) checkSubmissions()
    }, [applications])

    const checkExamSubmitted = (application: ApplicationData): boolean => {
        const isOnCampus =
            application.creator_type === 'University' || application.is_university_created === true
        if (!isOnCampus || !application.has_assignment) return false
        return submittedJobModules.get(application.job_id) || false
    }

    const handleViewAssignment = (application: ApplicationData) => {
        setSelectedApplication(application)
        setAssignmentModalOpen(true)
    }

    const handleViewApplicationDetails = (application: ApplicationData) => {
        setSelectedApplicationForDetails(application)
        setShowApplicationDetailsModal(true)
    }

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

    const canWithdraw = (status: string) => ['applied', 'shortlisted', 'pending'].includes(status)

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

    const iconBtn =
        'h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'

    const renderActions = (application: ApplicationData) => (
        <div className="flex items-center justify-end gap-1 flex-wrap">
            {onStatusUpdate && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusUpdate(application)}
                    className={iconBtn}
                    title="View"
                >
                    <Eye className="w-3.5 h-3.5" />
                </Button>
            )}

            {!onStatusUpdate && application.has_assignment && (
                <>
                    {(application.creator_type === 'University' || application.is_university_created === true) &&
                    checkExamSubmitted(application) &&
                    application.status === 'applied' ? (
                        <span className="text-[10px] text-gray-400 px-1">Soon</span>
                    ) : (application.creator_type === 'University' ||
                          application.is_university_created === true) &&
                      checkExamSubmitted(application) &&
                      application.status !== 'applied' &&
                      application.status !== 'selected' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplicationDetails(application)}
                            className={iconBtn}
                            title="View Details"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </Button>
                    ) : !(
                          (application.creator_type === 'University' ||
                              application.is_university_created === true) &&
                          application.status === 'selected'
                      ) ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAssignment(application)}
                            className={cn(iconBtn, 'text-primary-600 border-primary-200')}
                            title="View Assignment"
                        >
                            <ClipboardList className="w-3.5 h-3.5" />
                        </Button>
                    ) : null}
                </>
            )}

            {!onStatusUpdate && onViewMessages && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewMessages(application)}
                    className={iconBtn}
                    title="View Messages"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                </Button>
            )}

            {!onStatusUpdate &&
                application.status === 'selected' &&
                application.offer_letter_url && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewOfferLetter(application)}
                        className={cn(iconBtn, 'text-emerald-600 border-emerald-200')}
                        title="View Offer Letter"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </Button>
                )}

            {!onStatusUpdate && onWithdraw && canWithdraw(application.status) && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWithdraw(application)}
                    className={cn(iconBtn, 'text-red-600 border-red-200')}
                    title="Withdraw"
                >
                    <Undo2 className="w-3.5 h-3.5" />
                </Button>
            )}
        </div>
    )

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
                    Apply to jobs to see them tracked here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-2 sm:space-y-3">
            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
                {applications.map((application) => (
                    <ApplicationCard
                        key={application.id}
                        application={{
                            id: application.id,
                            job_title: application.job_title,
                            corporate_name: application.corporate_name,
                            status: application.status,
                            applied_at: application.applied_at,
                            location: application.interview_location || undefined,
                            salary: application.expected_salary
                                ? formatAmountINR(application.expected_salary)
                                : undefined,
                            job_type: (application as ApplicationData & { job_type?: string }).job_type,
                        }}
                        onView={() => {
                            if (onViewMessages) onViewMessages(application)
                            else if (application.offer_letter_url) onViewOfferLetter(application)
                            else handleViewApplicationDetails(application)
                        }}
                        onWithdraw={
                            onWithdraw && canWithdraw(application.status)
                                ? () => onWithdraw(application)
                                : undefined
                        }
                    />
                ))}
            </div>

            {/* Desktop dense table */}
            <div className="hidden md:block rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/90 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-3 py-2.5 text-left"><SortButton field="job_title">Job</SortButton></th>
                                <th className="px-3 py-2.5 text-left"><SortButton field="corporate_name">Company</SortButton></th>
                                <th className="px-3 py-2.5 text-left"><SortButton field="status">Status</SortButton></th>
                                <th className="px-3 py-2.5 text-left whitespace-nowrap"><SortButton field="applied_at">Applied</SortButton></th>
                                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                            {applications.map((application) => {
                                const company = application.corporate_name || 'Company'
                                const initial = company.charAt(0).toUpperCase()
                                return (
                                    <tr
                                        key={application.id}
                                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-3 py-2.5 align-middle">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                    {initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                                                        {application.job_title || 'Untitled'}
                                                    </p>
                                                    {application.creator_type && (
                                                        <span className="inline-flex mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                            {application.creator_type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                                                    {company}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 align-middle">
                                            <StatusBadge status={application.status} />
                                        </td>
                                        <td className="px-3 py-2.5 align-middle whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                                            {formatDate(application.applied_at)}
                                        </td>
                                        <td className="px-3 py-2.5 align-middle">
                                            {renderActions(application)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Compact pagination */}
                <div className="px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                        {((pagination.page - 1) * pagination.limit) + 1}–
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs rounded-lg"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            Prev
                        </Button>
                        <span className="text-xs text-gray-600 dark:text-gray-300 px-2 tabular-nums">
                            {pagination.page} / {Math.max(pagination.total_pages, 1)}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs rounded-lg"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.total_pages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile pagination */}
            {pagination.total_pages > 1 && (
                <div className="md:hidden flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg"
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        Prev
                    </Button>
                    <span className="text-xs text-gray-500">
                        {pagination.page} / {pagination.total_pages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg"
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.total_pages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {selectedApplication && (
                <ViewAssignmentModal
                    isOpen={assignmentModalOpen}
                    onClose={() => {
                        setAssignmentModalOpen(false)
                        setSelectedApplication(null)
                    }}
                    jobId={selectedApplication.job_id}
                    jobTitle={selectedApplication.job_title || 'Job'}
                    isOnCampus={
                        selectedApplication.creator_type === 'University' ||
                        selectedApplication.is_university_created === true
                    }
                />
            )}

            <ViewApplicationDetailsModal
                isOpen={showApplicationDetailsModal}
                onClose={() => {
                    setShowApplicationDetailsModal(false)
                    setSelectedApplicationForDetails(null)
                }}
                application={selectedApplicationForDetails}
            />
        </div>
    )
}
