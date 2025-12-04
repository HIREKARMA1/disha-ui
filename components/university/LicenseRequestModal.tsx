"use client"

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/MultiSelectDropdown'
import { degreeOptions, branchOptions } from '@/components/dashboard/CreateStudentModal'

interface LicenseRequestModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function LicenseRequestModal({ isOpen, onClose, onSuccess }: LicenseRequestModalProps) {
    const [formData, setFormData] = useState({
        requested_total: '',
        batch: '',
        degree: '',
        branches: [] as string[],
        period_from: '',
        period_to: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const branchDropdownOptions: MultiSelectOption[] = useMemo(() => (
        branchOptions.map(option => ({
            id: option.value,
            value: option.value,
            label: option.label
        }))
    ), [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.requested_total || !formData.batch || !formData.period_from || !formData.period_to) {
            toast.error('Please fill in all required fields')
            return
        }

        const requestedTotal = parseInt(formData.requested_total)
        if (isNaN(requestedTotal) || requestedTotal <= 0) {
            toast.error('Number of licenses must be greater than 0')
            return
        }

        if (new Date(formData.period_from) >= new Date(formData.period_to)) {
            toast.error('End date must be after start date')
            return
        }

        const degreeValue = formData.degree.trim()
        const branchesList = formData.branches

        setIsSubmitting(true)
        try {
            await apiClient.createLicenseRequest({
                requested_total: requestedTotal,
                batch: formData.batch.trim(),
                degree: degreeValue || undefined,
                branches: branchesList.length ? branchesList : undefined,
                period_from: new Date(formData.period_from).toISOString(),
                period_to: new Date(formData.period_to).toISOString(),
                message: formData.message.trim() || undefined
            })
            
            toast.success('License request submitted successfully')
            setFormData({
                requested_total: '',
                batch: '',
                degree: '',
                branches: [],
                period_from: '',
                period_to: '',
                message: ''
            })
            onClose()
            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit license request'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Request License"
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 pointer-events-auto">
                <div className="pointer-events-auto">
                    <label htmlFor="requested_total" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Number of Licenses <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="requested_total"
                        type="number"
                        min="1"
                        value={formData.requested_total}
                        onChange={(e) => handleChange('requested_total', e.target.value)}
                        placeholder="e.g., 100"
                        required
                        disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Number of student licenses you need for this batch
                    </p>
                </div>

                <div>
                    <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Batch Identifier <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="batch"
                        type="text"
                        value={formData.batch}
                        onChange={(e) => handleChange('batch', e.target.value)}
                        placeholder="e.g., 2026, 2025-A"
                        required
                        disabled={isSubmitting}
                        pattern="[a-zA-Z0-9_-]+"
                        title="Only alphanumeric characters, dashes, and underscores allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Batch identifier (e.g., graduation year or batch code)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Degree (Optional)
                        </label>
                        <Select
                            value={formData.degree || undefined}
                            onValueChange={(value) => handleChange('degree', value === '__clear__' ? '' : value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__clear__">Clear selection</SelectItem>
                                {degreeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <MultiSelectDropdown
                            label="Branches (Optional)"
                            options={branchDropdownOptions}
                            selectedValues={formData.branches}
                            onSelectionChange={(values) => handleChange('branches', values)}
                            placeholder="Select branches"
                            disabled={isSubmitting}
                            allOptionLabel="All branches"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="period_from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="period_from"
                            type="date"
                            value={formData.period_from}
                            onChange={(e) => handleChange('period_from', e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="period_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="period_to"
                            type="date"
                            value={formData.period_to}
                            onChange={(e) => handleChange('period_to', e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message (Optional)
                    </label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Any additional information for the admin..."
                        rows={4}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        Submit Request
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

