"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, FileText, User, Briefcase, DollarSign, Clock, Mail } from 'lucide-react'

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
}

interface ViewApplicationDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    application: ApplicationData | null
}

export function ViewApplicationDetailsModal({
    isOpen,
    onClose,
    application
}: ViewApplicationDetailsModalProps) {
    if (!application) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            case 'shortlisted':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            case 'selected':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            case 'pending':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={onClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Application Details
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {application.student_name} - {application.job_title}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Student & Job Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Student</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {application.student_name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {application.job_title || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {application.corporate_name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="w-5 h-5 mt-0.5">
                                            <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold ${getStatusColor(application.status)}`}>
                                                {application.status.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Details</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Applied Date</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {formatDate(application.applied_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Expected Salary</p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {formatSalary(application.expected_salary)}
                                                </p>
                                            </div>
                                        </div>

                                        {application.availability_date && (
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Availability Date</p>
                                                    <p className="text-base text-gray-900 dark:text-white">
                                                        {formatDate(application.availability_date)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                {application.cover_letter && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cover Letter</h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {application.cover_letter}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Interview Details - if available */}
                                {(application.interview_date || application.interview_location) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Interview Details</h3>
                                        <div className="space-y-3">
                                            {application.interview_date && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Interview Date</p>
                                                        <p className="text-base text-gray-900 dark:text-white">
                                                            {formatDate(application.interview_date)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {application.interview_location && (
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Interview Location</p>
                                                        <p className="text-base text-gray-900 dark:text-white">
                                                            {application.interview_location}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Corporate Notes - if available */}
                                {application.corporate_notes && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <FileText className="w-5 h-5 text-gray-400 mb-2" />
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {application.corporate_notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Offer Letter - if available */}
                                {application.offer_letter_url && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Offer Letter</h3>
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                                            Offer Letter Available
                                                        </p>
                                                        {application.offer_letter_uploaded_at && (
                                                            <p className="text-xs text-green-700 dark:text-green-300">
                                                                Uploaded on {formatDate(application.offer_letter_uploaded_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={application.offer_letter_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    View Letter
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Banner */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Note:</strong> This is a read-only view. This application is for a job created by {application.corporate_name}. 
                                        Only the company can update the application status.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}

