"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Calendar, Users, MessageSquare, CheckCircle2, XCircle, X, Shield } from 'lucide-react'

interface License {
    id: string
    university_id: string
    university_name: string
    batch: string
    total_licenses: number
    remaining_licenses: number
    period_from: string
    period_to: string
    status: string
    note?: string
}

interface EditLicenseModalProps {
    isOpen: boolean
    onClose: () => void
    license: License | null
    onSuccess: () => void
}

export function EditLicenseModal({ isOpen, onClose, license, onSuccess }: EditLicenseModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        total_licenses: '',
        period_from: '',
        period_to: '',
        status: '',
        note: ''
    })

    useEffect(() => {
        if (license) {
            setFormData({
                total_licenses: license.total_licenses.toString(),
                period_from: new Date(license.period_from).toISOString().split('T')[0],
                period_to: new Date(license.period_to).toISOString().split('T')[0],
                status: license.status,
                note: license.note || ''
            })
        }
    }, [license])

    const handleSubmit = async () => {
        if (!license) return

        if (!formData.total_licenses || !formData.period_from || !formData.period_to) {
            toast.error('Please fill in all required fields')
            return
        }

        const total = parseInt(formData.total_licenses)
        if (isNaN(total) || total <= 0) {
            toast.error('Total licenses must be greater than 0')
            return
        }

        if (new Date(formData.period_from) >= new Date(formData.period_to)) {
            toast.error('End date must be after start date')
            return
        }

        setLoading(true)
        try {
            await apiClient.updateLicense(license.id, {
                total_licenses: total,
                period_from: new Date(formData.period_from).toISOString(),
                period_to: new Date(formData.period_to).toISOString(),
                status: formData.status,
                note: formData.note
            })

            toast.success('License updated successfully')
            onSuccess()
            onClose()
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to update license'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
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
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 border-b border-primary-200 dark:border-primary-700 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        Edit License
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Modify license details for {license?.university_name}
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
                                {/* License Details Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary-500" />
                                        License Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Total Licenses <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={formData.total_licenses}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, total_licenses: e.target.value }))}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Status <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                {formData.status === 'active' ? (
                                                    <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                                                )}
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
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
                                    </div>
                                </div>

                                {/* Admin Note Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-primary-500" />
                                        Additional Information
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Admin Note
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <textarea
                                                value={formData.note}
                                                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                                placeholder="Add a note..."
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
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                loading={loading}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
