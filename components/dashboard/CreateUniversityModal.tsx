"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X, Building2, Mail, Phone, MapPin, Globe, User, Calendar, GraduationCap, AlertCircle } from 'lucide-react'
import { CreateUniversityRequest, CreateUniversityResponse } from '@/types/university'
import { getErrorMessage } from '@/lib/error-handler'

interface CreateUniversityModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateUniversityRequest) => Promise<CreateUniversityResponse>
}

export function CreateUniversityModal({
    isOpen,
    onClose,
    onSubmit
}: CreateUniversityModalProps) {
    const [formData, setFormData] = useState<CreateUniversityRequest>({
        university_name: '',
        email: '',
        phone: '',
        institute_type: '',
        address: '',
        website_url: '',
        contact_person_name: '',
        contact_designation: '',
        established_year: undefined,
        courses_offered: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [createdUniversity, setCreatedUniversity] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        console.log('🚀 Form submitted!', formData)

        // Validate required fields
        if (!formData.university_name || !formData.email || !formData.institute_type) {
            console.error('❌ Missing required fields:', {
                university_name: formData.university_name,
                email: formData.email,
                institute_type: formData.institute_type
            })
            alert('Please fill in all required fields: University Name, Email, and Institute Type')
            return
        }

        console.log('✅ All required fields are present, proceeding with submission')
        setIsSubmitting(true)
        setError(null)

        try {
            const result = await onSubmit(formData)
            setShowSuccess(true)
            setCreatedUniversity({
                ...formData,
                temporary_password: result?.temporary_password
            })

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    university_name: '',
                    email: '',
                    phone: '',
                    institute_type: '',
                    address: '',
                    website_url: '',
                    contact_person_name: '',
                    contact_designation: '',
                    established_year: undefined,
                    courses_offered: ''
                })
                setShowSuccess(false)
                setCreatedUniversity(null)
                onClose()
            }, 2000)
        } catch (err) {
            console.error('❌ Error creating university:', err)
            setError(getErrorMessage(err as any))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: keyof CreateUniversityRequest, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const instituteTypes = [
        'Government',
        'Private',
        'Deemed University',
        'Central University',
        'State University',
        'Autonomous College',
        'Private University',
        'Institute of National Importance'
    ]

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                    className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {showSuccess ? 'University Created Successfully!' : 'Create New University'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {showSuccess ? 'The university has been added to the system' : 'Add a new university to the platform'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {showSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    University Created Successfully!
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    <strong>{createdUniversity?.university_name}</strong> has been added to the system and a welcome email has been sent.
                                </p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        Login Credentials:
                                    </h4>
                                    <div className="space-y-2 text-left">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Email:</span>
                                            <span className="text-sm font-medium text-gray-900">{createdUniversity?.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Password:</span>
                                            <span className="text-sm font-medium text-gray-900">{createdUniversity?.temporary_password || 'Password@123'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSuccess(false)
                                            setCreatedUniversity(null)
                                            onClose()
                                        }}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSuccess(false)
                                            setCreatedUniversity(null)
                                        }}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                                    >
                                        Add Another University
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </motion.div>
                                )}

                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* University Name */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                University Name *
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.university_name}
                                                    onChange={(e) => handleInputChange('university_name', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter university name"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter email address"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone || ''}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        {/* Institute Type */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Institute Type *
                                            </label>
                                            <select
                                                value={formData.institute_type}
                                                onChange={(e) => handleInputChange('institute_type', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select institute type</option>
                                                {instituteTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        Contact Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Contact Person Name */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Contact Person Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contact_person_name || ''}
                                                onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter contact person name"
                                            />
                                        </div>

                                        {/* Contact Designation */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Contact Designation
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contact_designation || ''}
                                                onChange={(e) => handleInputChange('contact_designation', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter designation"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location & Website */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        Location & Website
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Address */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Address
                                            </label>
                                            <textarea
                                                value={formData.address || ''}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter university address"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Website URL */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Website URL
                                            </label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="url"
                                                    value={formData.website_url || ''}
                                                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="https://university.edu"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        Academic Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Established Year */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Established Year
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={formData.established_year || ''}
                                                    onChange={(e) => handleInputChange('established_year', parseInt(e.target.value) || undefined)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="e.g., 1950"
                                                    min="1800"
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Courses Offered */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Courses Offered
                                            </label>
                                            <textarea
                                                value={formData.courses_offered || ''}
                                                onChange={(e) => handleInputChange('courses_offered', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="List the courses offered (comma-separated)"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="w-4 h-4" />
                                                Create University
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
