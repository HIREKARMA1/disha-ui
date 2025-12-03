"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Calendar, Users, MessageSquare, X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface UniversityLicenseRequestModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    initialBatch?: string
    isRenewalFlow?: boolean
}

export function UniversityLicenseRequestModal({ isOpen, onClose, onSuccess, initialBatch, isRenewalFlow }: UniversityLicenseRequestModalProps) {
    const [loading, setLoading] = useState(false)
    const [checkingEligibility, setCheckingEligibility] = useState(false)
    const [eligibility, setEligibility] = useState<{
        eligible: boolean;
        request_type?: 'NEW' | 'RENEWAL';
        reason?: string;
        usage?: any;
    } | null>(null)

    const [formData, setFormData] = useState({
        requested_total: '',
        batch: '',
        period_from: '',
        period_to: '',
        message: ''
    })

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                requested_total: '',
                batch: initialBatch || '',
                period_from: '',
                period_to: '',
                message: ''
            })
            setEligibility(null)

            if (initialBatch) {
                checkEligibility(initialBatch)
            }
        }
    }, [isOpen, initialBatch])

    // Check eligibility when batch changes
    const checkEligibility = async (batch: string) => {
        if (!batch || batch.length < 4) {
            setEligibility(null)
            return
        }

        setCheckingEligibility(true)
        try {
            const result = await apiClient.checkBatchEligibility(batch)
            setEligibility(result)

            // If renewal, pre-fill dates from existing license if available
            if (result.request_type === 'RENEWAL' && result.usage) {
                // Optional: could pre-fill dates here
            }
        } catch (error) {
            console.error('Failed to check eligibility:', error)
        } finally {
            setCheckingEligibility(false)
        }
    }

    const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const batch = e.target.value
        setFormData(prev => ({ ...prev, batch }))

        // Debounce check
        const timeoutId = setTimeout(() => checkEligibility(batch), 500)
        return () => clearTimeout(timeoutId)
    }

    const handleSubmit = async () => {
        // Consider it a renewal if the API says so OR if we are in the renewal flow
        const isRenewal = eligibility?.request_type === 'RENEWAL' || isRenewalFlow

        // For renewal, we don't need dates from form
        if (!formData.requested_total || !formData.batch || (!isRenewal && (!formData.period_from || !formData.period_to))) {
            toast.error('Please fill in all required fields')
            return
        }

        if (eligibility && !eligibility.eligible) {
            toast.error(eligibility.reason || 'You are not eligible to request licenses for this batch')
            return
        }

        const total = parseInt(formData.requested_total)
        if (isNaN(total) || total <= 0) {
            toast.error('Requested licenses must be greater than 0')
            return
        }

        // Date validation only for new requests
        if (!isRenewal && new Date(formData.period_from) >= new Date(formData.period_to)) {
            toast.error('End date must be after start date')
            return
        }

        setLoading(true)
        try {
            // For renewal, set default dates (today to 1 year from now)
            // These are placeholders as admin will likely set the actual dates
            const today = new Date()
            const nextYear = new Date()
            nextYear.setFullYear(today.getFullYear() + 1)

            const periodFrom = isRenewal ? today.toISOString() : new Date(formData.period_from).toISOString()
            const periodTo = isRenewal ? nextYear.toISOString() : new Date(formData.period_to).toISOString()

            await apiClient.createLicenseRequest({
                requested_total: total,
                batch: formData.batch,
                period_from: periodFrom,
                period_to: periodTo,
                message: formData.message
            })

            toast.success('License request submitted successfully')
            onClose()
            if (onSuccess) onSuccess()

            // Reset form
            setFormData({
                requested_total: '',
                batch: '',
                period_from: '',
                period_to: '',
                message: ''
            })
            setEligibility(null)
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit request'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 border-b border-primary-200 dark:border-primary-700 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        {eligibility?.request_type === 'RENEWAL' || isRenewalFlow ? "Request License Renewal" : "Request New License"}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Submit a request for student licenses
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {/* Info Banner */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {eligibility?.request_type === 'RENEWAL' || isRenewalFlow
                                            ? "You are requesting a renewal for an exhausted batch. This will be reviewed by the admin."
                                            : "Submit a request for student licenses. The admin will review your request and approve the licenses."
                                        }
                                    </p>
                                </div>

                                {/* Eligibility Error */}
                                {eligibility && !eligibility.eligible && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        <span className="text-sm text-red-800 dark:text-red-200 font-medium">
                                            {eligibility.reason}
                                        </span>
                                    </div>
                                )}

                                {/* Batch Status */}
                                {eligibility?.usage?.exists && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Current Batch Status
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{eligibility.usage.total}</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Used</p>
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{eligibility.usage.used}</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{eligibility.usage.remaining}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Request Details Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary-500" />
                                        Request Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Batch Year <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="text"
                                                    value={formData.batch}
                                                    onChange={handleBatchChange}
                                                    placeholder="e.g. 2024-2025"
                                                    className={`pl-9 ${eligibility && !eligibility.eligible ? 'border-red-300 focus:ring-red-500' : ''}`}
                                                />
                                                {checkingEligibility && (
                                                    <div className="absolute right-3 top-2.5">
                                                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Licenses Needed <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={formData.requested_total}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, requested_total: e.target.value }))}
                                                    placeholder="e.g. 100"
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        {eligibility?.request_type !== 'RENEWAL' && !isRenewalFlow && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Start Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="date"
                                                            value={formData.period_from}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, period_from: e.target.value }))}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        End Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="date"
                                                            value={formData.period_to}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, period_to: e.target.value }))}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-primary-500" />
                                        Additional Information
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Message to Admin (Optional)
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                                placeholder="Any specific requirements or context..."
                                                rows={3}
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                                className="border-gray-300 dark:border-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || (eligibility !== null && !eligibility.eligible)}
                                loading={loading}
                                className={eligibility?.request_type === 'RENEWAL' || isRenewalFlow ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-primary-600 hover:bg-primary-700 text-white"}
                            >
                                {eligibility?.request_type === 'RENEWAL' || isRenewalFlow ? "Request Renewal" : "Submit Request"}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
