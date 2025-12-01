"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { Building2, Mail, FileText, Calendar, Users, Clock, Info, X, CheckCircle, AlertCircle, Shield } from 'lucide-react'

interface LicenseRequest {
    id: string
    university_id: string
    university_name: string
    university_email: string
    requested_total: number
    batch: string
    period_from: string
    period_to: string
    message?: string
    status: string
    admin_note?: string
    created_at: string
}

interface LicenseRequestModalProps {
    isOpen: boolean
    onClose: () => void
    requestId: string | null
    onSuccess?: () => void
}

export function LicenseRequestModal({ isOpen, onClose, requestId, onSuccess }: LicenseRequestModalProps) {
    const [request, setRequest] = useState<LicenseRequest | null>(null)
    const [loading, setLoading] = useState(false)
    const [viewMode, setViewMode] = useState<'info' | 'approve' | 'reject'>('info')
    const [approvalData, setApprovalData] = useState({
        approved_total: '',
        batch: '',
        period_from: '',
        period_to: '',
        admin_note: ''
    })
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [rejectNote, setRejectNote] = useState('')

    useEffect(() => {
        if (isOpen && requestId) {
            loadRequest()
            setViewMode('info')
            setRejectNote('')
        }
    }, [isOpen, requestId])

    const loadRequest = async () => {
        if (!requestId) return

        setLoading(true)
        try {
            const data = await apiClient.getLicenseRequest(requestId)
            setRequest(data)

            // Pre-fill approval data
            setApprovalData({
                approved_total: data.requested_total.toString(),
                batch: data.batch,
                period_from: data.period_from.split('T')[0],
                period_to: data.period_to.split('T')[0],
                admin_note: ''
            })
        } catch (error: any) {
            toast.error('Failed to load request details')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!request || !requestId) return

        if (!approvalData.approved_total || !approvalData.batch || !approvalData.period_from || !approvalData.period_to) {
            toast.error('Please fill in all required fields')
            return
        }

        const approvedTotal = parseInt(approvalData.approved_total)
        if (isNaN(approvedTotal) || approvedTotal <= 0) {
            toast.error('Approved licenses must be greater than 0')
            return
        }

        if (new Date(approvalData.period_from) >= new Date(approvalData.period_to)) {
            toast.error('End date must be after start date')
            return
        }

        setIsApproving(true)
        try {
            await apiClient.approveLicenseRequest(requestId, {
                approved_total: approvedTotal,
                batch: approvalData.batch.trim(),
                period_from: new Date(approvalData.period_from).toISOString(),
                period_to: new Date(approvalData.period_to).toISOString(),
                admin_note: approvalData.admin_note.trim() || undefined
            })

            toast.success('License request approved')
            onClose()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to approve request'
            toast.error(errorMessage)
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        if (!request || !requestId) return

        if (!rejectNote.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }

        setIsRejecting(true)
        try {
            await apiClient.rejectLicenseRequest(requestId, {
                admin_note: rejectNote.trim()
            })

            toast.success('License request rejected')
            onClose()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to reject request'
            toast.error(errorMessage)
        } finally {
            setIsRejecting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusBadge = () => {
        if (!request) return null

        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[request.status as keyof typeof colors] || colors.pending}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
        )
    }

    if (!isOpen) return null

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
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
                                <p className="text-gray-600 dark:text-gray-400">Loading request details...</p>
                            </div>
                        ) : request ? (
                            <>
                                {/* Header */}
                                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 border-b border-primary-200 dark:border-primary-700 flex-shrink-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                                {viewMode === 'info' ? 'License Request Details' :
                                                    viewMode === 'approve' ? 'Approve Request' : 'Reject Request'}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                {request.university_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {viewMode === 'info' && getStatusBadge()}
                                            <button
                                                onClick={onClose}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 overflow-y-auto flex-1">
                                    {viewMode === 'info' && (
                                        <div className="space-y-6">
                                            {/* Quick Info Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Requested</p>
                                                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                                                                {request.requested_total} Licenses
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Batch</p>
                                                            <p className="font-medium text-gray-900 dark:text-white text-lg">
                                                                {request.batch}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {formatDate(request.period_from)} - {formatDate(request.period_to)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* University Details */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-primary-500" />
                                                    University Details
                                                </h3>
                                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <Building2 className="w-4 h-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.university_name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.university_email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message */}
                                            {request.message && (
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                        <Info className="w-5 h-5 text-primary-500" />
                                                        Message from University
                                                    </h3>
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 p-4">
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                            {request.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Admin Note (if rejected) */}
                                            {request.admin_note && request.status === 'rejected' && (
                                                <div>
                                                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5" />
                                                        Rejection Reason
                                                    </h3>
                                                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800 p-4">
                                                        <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                                                            {request.admin_note}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {viewMode === 'approve' && (
                                        <div className="space-y-6">
                                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-green-800 dark:text-green-200">
                                                    You are about to approve this license request. You can modify the details before confirming.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Approved Licenses <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={approvalData.approved_total}
                                                            onChange={(e) => setApprovalData(prev => ({ ...prev, approved_total: e.target.value }))}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Batch <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="text"
                                                            value={approvalData.batch}
                                                            onChange={(e) => setApprovalData(prev => ({ ...prev, batch: e.target.value }))}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Start Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="date"
                                                            value={approvalData.period_from}
                                                            onChange={(e) => setApprovalData(prev => ({ ...prev, period_from: e.target.value }))}
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
                                                            value={approvalData.period_to}
                                                            onChange={(e) => setApprovalData(prev => ({ ...prev, period_to: e.target.value }))}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Admin Note (Optional)
                                                </label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <textarea
                                                        value={approvalData.admin_note}
                                                        onChange={(e) => setApprovalData(prev => ({ ...prev, admin_note: e.target.value }))}
                                                        placeholder="Add a note for the university..."
                                                        rows={3}
                                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {viewMode === 'reject' && (
                                        <div className="space-y-6">
                                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-red-800 dark:text-red-200">
                                                    You are about to reject this license request. Please provide a reason for the rejection.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Rejection Reason <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={rejectNote}
                                                    onChange={(e) => setRejectNote(e.target.value)}
                                                    placeholder="Please provide a detailed reason for rejection..."
                                                    rows={5}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                                    {viewMode === 'info' ? (
                                        <>
                                            <Button variant="outline" onClick={onClose}>Close</Button>
                                            {request.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => setViewMode('reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        onClick={() => setViewMode('approve')}
                                                        className="bg-primary-600 hover:bg-primary-700 text-white"
                                                    >
                                                        Approve
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => setViewMode('info')}
                                                disabled={isApproving || isRejecting}
                                            >
                                                Back
                                            </Button>
                                            {viewMode === 'approve' ? (
                                                <Button
                                                    onClick={handleApprove}
                                                    disabled={isApproving}
                                                    loading={isApproving}
                                                    className="bg-primary-600 hover:bg-primary-700 text-white"
                                                >
                                                    Confirm Approval
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleReject}
                                                    disabled={isRejecting}
                                                    loading={isRejecting}
                                                >
                                                    Confirm Rejection
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
