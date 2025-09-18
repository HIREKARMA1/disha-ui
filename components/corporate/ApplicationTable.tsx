"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    MoreVertical,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    FileText,
    Upload,
    Eye,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink
} from 'lucide-react'
import { ApplicationData } from '@/app/dashboard/corporate/applications/page'

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
}

type SortField = 'student_name' | 'job_title' | 'applied_at' | 'expected_salary' | 'status'
type SortDirection = 'asc' | 'desc' | null

export function ApplicationTable({
    applications,
    isLoading,
    error,
    onStatusUpdate,
    onOfferLetterUpload,
    onRetry,
    currentPage,
    totalPages,
    onPageChange
}: ApplicationTableProps) {
    const [sortField, setSortField] = useState<SortField | null>('applied_at')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
            case 'shortlisted':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            case 'selected':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            case 'withdrawn':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            case 'pending':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'applied':
                return 'Applied'
            case 'shortlisted':
                return 'Shortlisted'
            case 'selected':
                return 'Selected'
            case 'rejected':
                return 'Rejected'
            case 'withdrawn':
                return 'Withdrawn'
            case 'pending':
                return 'Pending'
            default:
                return status
        }
    }

    // Row color function - alternating transparent cool colors
    const getRowColor = (index: number) => {
        const colors = [
            'bg-blue-50/30 dark:bg-blue-900/10',
            'bg-purple-50/30 dark:bg-purple-900/10',
            'bg-green-50/30 dark:bg-green-900/10',
            'bg-orange-50/30 dark:bg-orange-900/10',
            'bg-pink-50/30 dark:bg-pink-900/10'
        ]
        return colors[index % colors.length]
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
        if (sortField !== field) {
            return <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        }
        if (sortDirection === 'asc') {
            return <ChevronUp className="w-4 h-4 text-primary-600" />
        }
        return <ChevronDown className="w-4 h-4 text-primary-600" />
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <FileText className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Error Loading Applications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center">
                    <div className="text-gray-400 mb-4">
                        <FileText className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Applications Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        No applications match your current filters.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {/* Student Info */}
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('student_name')}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                                >
                                    Student
                                    {getSortIcon('student_name')}
                                </button>
                            </th>

                            {/* Job Title */}
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('job_title')}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                                >
                                    Job Title
                                    {getSortIcon('job_title')}
                                </button>
                            </th>

                            {/* Status */}
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('status')}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                                >
                                    Status
                                    {getSortIcon('status')}
                                </button>
                            </th>

                            {/* Applied Date */}
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('applied_at')}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                                >
                                    Applied Date
                                    {getSortIcon('applied_at')}
                                </button>
                            </th>

                            {/* Expected Salary */}
                            <th className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleSort('expected_salary')}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 transition-colors"
                                >
                                    Expected Salary
                                    {getSortIcon('expected_salary')}
                                </button>
                            </th>

                            {/* Actions */}
                            <th className="px-6 py-4 text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Actions
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedApplications.map((application, index) => (
                            <motion.tr
                                key={application.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`${getRowColor(index)} hover:bg-opacity-50 transition-colors duration-200`}
                            >
                                {/* Student Info */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {application.student_name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {application.student_email}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Job Title */}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {application.job_title}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                        {getStatusLabel(application.status)}
                                    </span>
                                </td>

                                {/* Applied Date */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {formatDate(application.applied_at)}
                                    </div>
                                </td>

                                {/* Expected Salary */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                        {application.expected_salary ? formatCurrency(application.expected_salary) : 'Not specified'}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Status Update Button */}
                                        <button
                                            onClick={() => onStatusUpdate(application)}
                                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                            title="Update Status"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Offer Letter Upload Button (only for selected applications) */}
                                        {application.status === 'selected' && (
                                            <button
                                                onClick={() => onOfferLetterUpload(application)}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                title="Upload Offer Letter"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* View Offer Letter Button (if exists) */}
                                        {application.offer_letter_url && (
                                            <a
                                                href={application.offer_letter_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                title="View Offer Letter"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <span className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                {currentPage}
                            </span>

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
