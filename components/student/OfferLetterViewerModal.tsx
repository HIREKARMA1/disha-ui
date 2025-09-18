"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Calendar, Building, User, CheckCircle } from 'lucide-react'
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

interface OfferLetterViewerModalProps {
    isOpen: boolean
    onClose: () => void
    application: ApplicationData
    onDownload: () => void
}

export function OfferLetterViewerModal({
    isOpen,
    onClose,
    application,
    onDownload
}: OfferLetterViewerModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const formatDate = (dateString: string) => {
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

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            await onDownload()
        } finally {
            setIsLoading(false)
        }
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
                            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Offer Letter
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {application.job_title} - {application.corporate_name}
                                        </p>
                                    </div>
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
                                {/* Application Details */}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Application Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Job Title</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {application.job_title || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {application.corporate_name || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Applied Date</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(application.applied_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Expected Salary</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatSalary(application.expected_salary)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Offer Letter */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Offer Letter
                                    </h3>
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        {application.offer_letter_url ? (
                                            <iframe
                                                src={application.offer_letter_url}
                                                className="w-full h-96"
                                                title="Offer Letter"
                                            />
                                        ) : (
                                            <div className="p-8 text-center">
                                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    No offer letter available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information */}
                                {application.corporate_notes && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Corporate Notes
                                        </h3>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {application.corporate_notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {application.interview_date && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Interview Details
                                        </h3>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                            <div className="space-y-2">
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    <strong>Date:</strong> {formatDate(application.interview_date)}
                                                </p>
                                                {application.interview_location && (
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        <strong>Location:</strong> {application.interview_location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                                {application.offer_letter_url && (
                                    <Button
                                        onClick={handleDownload}
                                        disabled={isLoading}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        {isLoading ? 'Downloading...' : 'Download Offer Letter'}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
