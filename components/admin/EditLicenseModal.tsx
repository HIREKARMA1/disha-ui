"use client"

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { FileText, Calendar, Users, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'

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

    if (!license) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit License"
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        disabled={loading}
                        loading={loading}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
