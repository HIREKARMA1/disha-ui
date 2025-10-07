"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, FileText, Save, Loader, Upload } from 'lucide-react'
import { ApplicationData } from '@/app/dashboard/corporate/applications/page'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface StatusUpdateModalProps {
    isOpen: boolean
    onClose: () => void
    application: ApplicationData | null
    onSubmit: (applicationId: string, statusData: any) => void
}

const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-500' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-yellow-500' },
    { value: 'selected', label: 'Selected', color: 'bg-green-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
    // { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-500' },
    { value: 'pending', label: 'Pending', color: 'bg-purple-500' },
]

export function StatusUpdateModal({
    isOpen,
    onClose,
    application,
    onSubmit
}: StatusUpdateModalProps) {
    const [status, setStatus] = useState('applied')
    const [corporateNotes, setCorporateNotes] = useState('')
    const [interviewDate, setInterviewDate] = useState('')
    const [interviewLocation, setInterviewLocation] = useState('')
    const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Dynamic field visibility based on status
    const getVisibleFields = () => {
        switch (status) {
            case 'shortlisted':
                return {
                    corporateNotes: true,
                    interviewDate: true,
                    interviewLocation: true,
                    offerLetterUpload: false
                }
            case 'selected':
                return {
                    corporateNotes: true,
                    interviewDate: true,
                    interviewLocation: true,
                    offerLetterUpload: true
                }
            case 'applied':
            case 'pending':
            case 'rejected':
                return {
                    corporateNotes: true,
                    interviewDate: false,
                    interviewLocation: false,
                    offerLetterUpload: false
                }
            default:
                return {
                    corporateNotes: true,
                    interviewDate: false,
                    interviewLocation: false,
                    offerLetterUpload: false
                }
        }
    }

    const visibleFields = getVisibleFields()

    // Upload offer letter function
    const uploadOfferLetter = async (applicationId: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            
            const response = await apiClient.client.post(
                `/applications/${applicationId}/offer-letter`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            
            toast.success('Offer letter uploaded successfully!')
            return response.data
        } catch (error: any) {
            console.error('Failed to upload offer letter:', error)
            toast.error(error.response?.data?.detail || 'Failed to upload offer letter')
            throw error
        }
    }

    // Reset form when application changes
    useState(() => {
        if (application) {
            setStatus(application.status)
            setCorporateNotes(application.corporate_notes || '')
            setInterviewDate(application.interview_date ? new Date(application.interview_date).toISOString().split('T')[0] : '')
            setInterviewLocation(application.interview_location || '')
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!application) return

        setIsSubmitting(true)
        try {
            // If we're uploading an offer letter, we need to update status first, then upload
            if (offerLetterFile && status === 'selected') {
                // First update the status to 'selected'
                const statusData = {
                    status,
                    corporate_notes: corporateNotes || null,
                    interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
                    interview_location: interviewLocation || null
                }
                await onSubmit(application.id, statusData)
                
                // Wait a moment for the status update to be committed
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Then upload the offer letter
                try {
                    await uploadOfferLetter(application.id, offerLetterFile)
                } catch (uploadError) {
                    console.error('Offer letter upload failed:', uploadError)
                    toast.error('Status updated but offer letter upload failed. Please try uploading again.')
                    // Don't close modal so user can retry offer letter upload
                    return
                }
            } else {
                // Normal status update without offer letter
                const statusData = {
                    status,
                    corporate_notes: corporateNotes || null,
                    interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
                    interview_location: interviewLocation || null
                }
                await onSubmit(application.id, statusData)
            }
            
            // Close modal after successful submission
            onClose()
        } catch (error) {
            console.error('Failed to update application status:', error)
            // Don't close modal on error so user can retry
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            onClose()
        }
    }

    if (!application) return null

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
                            onClick={handleClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Update Application Status
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {application.student_name} - {application.job_title}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <form onSubmit={handleSubmit} className="p-6 pb-8 space-y-6">
                                {/* Status Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Application Status
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {statusOptions.map((option) => (
                                            <label
                                                key={option.value}
                                                className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all ${status === option.value
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={option.value}
                                                    checked={status === option.value}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-3 h-3 rounded-full mr-3 ${option.color}`} />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Corporate Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Corporate Notes
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <textarea
                                            value={corporateNotes}
                                            onChange={(e) => setCorporateNotes(e.target.value)}
                                            placeholder="Add notes about the candidate..."
                                            rows={4}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Interview Details - Only show for shortlisted and selected */}
                                <AnimatePresence>
                                    {(visibleFields.interviewDate || visibleFields.interviewLocation) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                        {/* Interview Date */}
                                        {visibleFields.interviewDate && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Interview Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="date"
                                                        value={interviewDate}
                                                        onChange={(e) => setInterviewDate(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Interview Location */}
                                        {visibleFields.interviewLocation && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Interview Location
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={interviewLocation}
                                                        onChange={(e) => setInterviewLocation(e.target.value)}
                                                        placeholder="Office address or online"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Offer Letter Upload - Only show for selected */}
                                <AnimatePresence>
                                    {visibleFields.offerLetterUpload && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mb-4"
                                        >
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Offer Letter Upload
                                        </label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setOfferLetterFile(e.target.files?.[0] || null)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                            />
                                        </div>
                                        {offerLetterFile && (
                                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                                <p className="text-sm text-green-800 dark:text-green-200">
                                                    Selected: {offerLetterFile.name}
                                                </p>
                                            </div>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Upload offer letter (PDF, DOC, DOCX)
                                        </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update Status
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
