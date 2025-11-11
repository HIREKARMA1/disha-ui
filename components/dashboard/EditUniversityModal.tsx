"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { X, Building2, Mail, Phone, MapPin, Globe, User, Calendar, GraduationCap, AlertCircle, Edit } from 'lucide-react'
import { UpdateUniversityRequest, UniversityProfile } from '@/types/university'
import { getErrorMessage } from '@/lib/error-handler'

interface EditUniversityModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (universityId: string, data: UpdateUniversityRequest) => Promise<UniversityProfile>
    university: UniversityProfile | null
}

export function EditUniversityModal({
    isOpen,
    onClose,
    onSubmit,
    university
}: EditUniversityModalProps) {
    const [formData, setFormData] = useState<UpdateUniversityRequest>({
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
    const [error, setError] = useState<string | null>(null)

    const instituteTypes = [
        'Engineering College',
        'Arts College',
        'Science College',
        'Medical College',
        'Law College',
        'Business School',
        'University',
        'Research Institute',
        'Polytechnic',
        'Other'
    ]

    // Populate form when university data changes
    useEffect(() => {
        if (university && isOpen) {
            setFormData({
                university_name: university.university_name || '',
                email: university.email || '',
                phone: university.phone || '',
                institute_type: university.institute_type || '',
                address: university.address || '',
                website_url: university.website_url || '',
                contact_person_name: university.contact_person_name || '',
                contact_designation: university.contact_designation || '',
                established_year: university.established_year,
                courses_offered: university.courses_offered || ''
            })
            setError(null)
        }
    }, [university, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!university) return

        // Validate required fields
        if (!formData.university_name || !formData.email || !formData.institute_type) {
            setError('Please fill in all required fields: University Name, Email, and Institute Type')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await onSubmit(university.id, formData)
            onClose()
        } catch (err) {
            console.error('❌ Error updating university:', err)
            setError(getErrorMessage(err as any))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: keyof UpdateUniversityRequest, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    if (!isOpen || !university) return null

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
                                    Edit University
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Update university information
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
                                    {/* University Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            University Name *
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.university_name}
                                                onChange={(e) => handleInputChange('university_name', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter university name"
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
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    {/* Institute Type */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Institute Type *
                                        </label>
                                        <select
                                            value={formData.institute_type}
                                            onChange={(e) => handleInputChange('institute_type', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            value={formData.contact_person_name || ''}
                                            onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
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
                                            placeholder="Enter university address"
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
                                                placeholder="https://university.edu"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Academic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Established Year */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Established Year
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={formData.established_year || ''}
                                                onChange={(e) => handleInputChange('established_year', parseInt(e.target.value) || undefined)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Courses Offered
                                        </label>
                                        <textarea
                                            value={formData.courses_offered || ''}
                                            onChange={(e) => handleInputChange('courses_offered', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="List the courses offered (comma-separated)"
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
                                            Update University
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

