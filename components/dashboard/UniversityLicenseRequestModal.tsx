"use client"

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Calendar, Users, MessageSquare } from 'lucide-react'

interface UniversityLicenseRequestModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    initialBatch?: string
}

export function UniversityLicenseRequestModal({ isOpen, onClose, onSuccess, initialBatch }: UniversityLicenseRequestModalProps) {
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
        const isRenewal = eligibility?.request_type === 'RENEWAL'

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={eligibility?.request_type === 'RENEWAL' ? "Request License Renewal" : "Request New License"}
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                    {eligibility?.request_type === 'RENEWAL'
                        ? "You are requesting a renewal for an exhausted batch. This will be reviewed by the admin."
                        : "Submit a request for student licenses. The admin will review your request and approve the licenses."
                    }
                </div>

                {eligibility && !eligibility.eligible && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {eligibility.reason}
                    </div>
                )}

                {eligibility?.usage?.exists && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs space-y-1">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Current Batch Status:</p>
                        <div className="grid grid-cols-3 gap-2 text-gray-600 dark:text-gray-400">
                            <span>Total: {eligibility.usage.total}</span>
                            <span>Used: {eligibility.usage.used}</span>
                            <span>Remaining: {eligibility.usage.remaining}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                    {eligibility?.request_type !== 'RENEWAL' && (
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
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (eligibility !== null && !eligibility.eligible)}
                        loading={loading}
                        className={eligibility?.request_type === 'RENEWAL' ? "bg-amber-600 hover:bg-amber-700" : ""}
                    >
                        {eligibility?.request_type === 'RENEWAL' ? "Request Renewal" : "Submit Request"}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
