"use client"

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { Building2, Mail, FileText, Calendar, Users, Clock, Info } from 'lucide-react'

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

    if (!request && !loading) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            maxWidth="2xl"
        >
            {loading ? (
                <div className="py-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            ) : request ? (
                <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {viewMode === 'info' ? 'License Request Details' :
                                    viewMode === 'approve' ? 'Approve Request' : 'Reject Request'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Request ID: {request.id.slice(0, 8)}...
                            </p>
                        </div>
                        {viewMode === 'info' && getStatusBadge()}
                    </div>

                    {/* Info View */}
                    {viewMode === 'info' && (
                        <div className="space-y-5">
                            {/* University Information */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    University Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">University Name</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{request.university_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Email</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{request.university_email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Request Details
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            Licenses Requested
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{request.requested_total}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Batch</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{request.batch}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Start Date
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(request.period_from)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            End Date
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(request.period_to)}</p>
                                    </div>
                                </div>

                                {request.message && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">University Message</p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200 mt-0.5">{request.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                Submitted on {formatDate(request.created_at)}
                            </div>

                            {/* Action Buttons for Pending */}
                            {request.status === 'pending' && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        variant="destructive"
                                        onClick={() => setViewMode('reject')}
                                    >
                                        Reject Request
                                    </Button>
                                    <Button
                                        onClick={() => setViewMode('approve')}
                                    >
                                        Approve Request
                                    </Button>
                                </div>
                            )}

                            {/* Already Processed */}
                            {request.status !== 'pending' && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        This request has been {request.status}.
                                    </p>
                                    {request.admin_note && request.status === 'rejected' && (
                                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                                            <p className="text-xs font-medium text-red-900 dark:text-red-100">Rejection Reason:</p>
                                            <p className="text-sm text-red-800 dark:text-red-200 mt-1">{request.admin_note}</p>
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="outline" onClick={onClose}>Close</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Approve Form View */}
                    {viewMode === 'approve' && (
                        <div className="space-y-5">
                            {/* Basic Information Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Approval Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Approved Licenses <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={approvalData.approved_total}
                                            onChange={(e) => setApprovalData(prev => ({ ...prev, approved_total: e.target.value }))}
                                            placeholder="12"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Batch <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={approvalData.batch}
                                            onChange={(e) => setApprovalData(prev => ({ ...prev, batch: e.target.value }))}
                                            placeholder="2028"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={approvalData.period_from}
                                            onChange={(e) => setApprovalData(prev => ({ ...prev, period_from: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={approvalData.period_to}
                                            onChange={(e) => setApprovalData(prev => ({ ...prev, period_to: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Admin Note (Optional)
                                    </label>
                                    <textarea
                                        value={approvalData.admin_note}
                                        onChange={(e) => setApprovalData(prev => ({ ...prev, admin_note: e.target.value }))}
                                        placeholder="Optional note..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode('info')}
                                    disabled={isApproving}
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                    loading={isApproving}
                                >
                                    Approve Request
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Reject Form View */}
                    {viewMode === 'reject' && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Rejection Details
                                </h3>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Rejection Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={rejectNote}
                                        onChange={(e) => setRejectNote(e.target.value)}
                                        placeholder="Please provide a detailed reason for rejection..."
                                        rows={5}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode('info')}
                                    disabled={isRejecting}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                    loading={isRejecting}
                                >
                                    Reject Request
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    )
}
