"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X, Building2, Mail, Phone, MapPin, Globe, User, Calendar, Briefcase, AlertCircle, Edit } from 'lucide-react'
import { UpdateCorporateRequest, CorporateProfile } from '@/types/corporate'
import { getErrorMessage } from '@/lib/error-handler'

interface EditCorporateModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (corporateId: string, data: UpdateCorporateRequest) => Promise<CorporateProfile>
    corporate: CorporateProfile | null
}

export function EditCorporateModal({
    isOpen,
    onClose,
    onSubmit,
    corporate
}: EditCorporateModalProps) {
    const [formData, setFormData] = useState<UpdateCorporateRequest>({
        company_name: '',
        email: '',
        phone: '',
        industry: '',
        address: '',
        website_url: '',
        contact_person: '',
        contact_designation: '',
        company_size: '',
        company_type: '',
        founded_year: undefined,
        description: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Populate form when corporate data changes
    useEffect(() => {
        if (corporate && isOpen) {
            setFormData({
                company_name: corporate.company_name || '',
                email: corporate.email || '',
                phone: corporate.phone || '',
                industry: corporate.industry || '',
                address: corporate.address || '',
                website_url: corporate.website_url || '',
                contact_person: corporate.contact_person || '',
                contact_designation: corporate.contact_designation || '',
                company_size: corporate.company_size || '',
                company_type: corporate.company_type || '',
                founded_year: corporate.founded_year,
                description: corporate.description || ''
            })
            setError(null)
        }
    }, [corporate, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!corporate) return

        // Validate required fields
        if (!formData.company_name || !formData.email || !formData.phone) {
            setError('Please fill in all required fields: Company Name, Email, and Phone')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await onSubmit(corporate.id, formData)
            onClose()
        } catch (err) {
            console.error('❌ Error updating corporate:', err)
            setError(getErrorMessage(err as any))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: keyof UpdateCorporateRequest, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const companySizes = [
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '501-1000',
        '1001-5000',
        '5000+'
    ]

    const companyTypes = [
        'Startup',
        'SME',
        'Enterprise',
        'MNC',
        'Government',
        'NGO'
    ]

    const industries = [
        'Technology',
        'Finance',
        'Healthcare',
        'Education',
        'Manufacturing',
        'Retail',
        'Consulting',
        'Real Estate',
        'Media & Entertainment',
        'Telecommunications',
        'Energy',
        'Transportation',
        'Hospitality',
        'Other'
    ]

    if (!isOpen || !corporate) return null

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Edit Corporate
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Update corporate information
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            disabled={isSubmitting}
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                </motion.div>
                            )}

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Company Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Company Name *
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.company_name}
                                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter company name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Industry */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Industry
                                        </label>
                                        <select
                                            value={formData.industry || ''}
                                            onChange={(e) => handleInputChange('industry', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select industry</option>
                                            {industries.map((industry) => (
                                                <option key={industry} value={industry}>
                                                    {industry}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Contact Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Contact Person Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Contact Person Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contact_person || ''}
                                            onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter contact person name"
                                        />
                                    </div>

                                    {/* Contact Designation */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Contact Designation
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contact_designation || ''}
                                            onChange={(e) => handleInputChange('contact_designation', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter designation"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location & Website */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Location & Website
                                </h3>

                                <div className="space-y-4">
                                    {/* Address */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Address
                                        </label>
                                        <textarea
                                            value={formData.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter company address"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Website URL */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Website URL
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="url"
                                                value={formData.website_url || ''}
                                                onChange={(e) => handleInputChange('website_url', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="https://company.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Company Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Company Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Company Size */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Company Size
                                        </label>
                                        <select
                                            value={formData.company_size || ''}
                                            onChange={(e) => handleInputChange('company_size', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select company size</option>
                                            {companySizes.map((size) => (
                                                <option key={size} value={size}>
                                                    {size} employees
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Company Type */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Company Type
                                        </label>
                                        <select
                                            value={formData.company_type || ''}
                                            onChange={(e) => handleInputChange('company_type', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select company type</option>
                                            {companyTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Founded Year */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Founded Year
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={formData.founded_year || ''}
                                                onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value) || undefined)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., 2010"
                                                min="1800"
                                                max={new Date().getFullYear()}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter company description"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4" />
                                            Update Corporate
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}

