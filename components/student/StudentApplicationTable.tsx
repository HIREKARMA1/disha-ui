"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronUp,
    ChevronDown,
    Eye,
    Download,
    Calendar,
    Building,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    UserCheck,
    FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
}

interface StudentApplicationTableProps {
    applications: ApplicationData[]
    loading: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
    onSort: (field: string) => void
    onViewOfferLetter: (application: ApplicationData) => void
    onDownloadOfferLetter: (application: ApplicationData) => void
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
    onDownloadOfferLetter,
    pagination,
    onPageChange
}: StudentApplicationTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'applied':
                return <Clock className="w-4 h-4 text-blue-500" />
            case 'shortlisted':
                return <UserCheck className="w-4 h-4 text-purple-500" />
            case 'selected':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />
            default:
                return <FileText className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'text-blue-600 dark:text-blue-400'
            case 'shortlisted':
                return 'text-purple-600 dark:text-purple-400'
            case 'selected':
                return 'text-green-600 dark:text-green-400'
            case 'rejected':
                return 'text-red-600 dark:text-red-400'
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400'
            default:
                return 'text-gray-600 dark:text-gray-400'
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch {
            return 'Invalid Date'
        }
    }

    const formatSalary = (salary?: number) => {
        if (!salary) return 'Not specified'
        return `₹${salary.toLocaleString()}`
    }

    const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <button
            onClick={() => onSort(field)}
            className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
            {children}
            {sortBy === field && (
                sortOrder === 'asc' ?
                    <ChevronUp className="w-4 h-4" /> :
                    <ChevronDown className="w-4 h-4" />
            )}
        </button>
    )

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No applications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You haven't applied to any jobs yet. Start exploring job opportunities!
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="job_title">Job Title</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="corporate_name">Company</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="status">Status</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="applied_at">Applied Date</SortButton>
                            </th>
                            <th className="px-6 py-4 text-left">
                                <SortButton field="expected_salary">Expected Salary</SortButton>
                            </th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {applications.map((application) => (
                            <motion.tr
                                key={application.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${hoveredRow === application.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                                    }`}
                                onMouseEnter={() => setHoveredRow(application.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {application.job_title || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Job ID: {application.job_id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">
                                            {application.corporate_name || 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(application.status)}
                                        <span className={`font-medium ${getStatusColor(application.status)}`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">
                                            {formatDate(application.applied_at)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">
                                            {formatSalary(application.expected_salary)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {application.offer_letter_url && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onViewOfferLetter(application)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDownloadOfferLetter(application)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </Button>
                                            </>
                                        )}
                                        {!application.offer_letter_url && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                No offer letter
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Page {pagination.page} of {pagination.total_pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.total_pages}
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
