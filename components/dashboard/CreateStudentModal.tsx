"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, GraduationCap, Calendar, AlertCircle } from 'lucide-react'
import { CreateStudentRequest } from '@/types/university'
import { getErrorMessage } from '@/lib/error-handler'

interface CreateStudentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateStudentRequest) => void
}

export function CreateStudentModal({
    isOpen,
    onClose,
    onSubmit
}: CreateStudentModalProps) {
    const [formData, setFormData] = useState<CreateStudentRequest>({
        name: '',
        email: '',
        phone: '',
        degree: undefined,
        branch: undefined,
        graduation_year: undefined
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [createdStudent, setCreatedStudent] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        console.log('🚀 Form submitted!', formData)
        console.log('🚀 Event:', e)
        console.log('🚀 Form data keys:', Object.keys(formData))
        console.log('🚀 Form data values:', Object.values(formData))

        // Validate required fields
        if (!formData.name || !formData.email || !formData.phone) {
            console.error('❌ Missing required fields:', { name: formData.name, email: formData.email, phone: formData.phone })
            alert('Please fill in all required fields: Name, Email, and Phone')
            return
        }

        console.log('✅ All required fields are present, proceeding with submission')
        setIsSubmitting(true)
        setError(null) // Clear any previous errors

        try {
            console.log('📞 Calling onSubmit with data:', formData)
            console.log('📞 Form data validation:', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                degree: formData.degree,
                branch: formData.branch,
                graduation_year: formData.graduation_year
            })
            const result = await onSubmit(formData)
            console.log('✅ onSubmit returned:', result)
            setCreatedStudent(result)
            setShowSuccess(true)
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                degree: undefined,
                branch: undefined,
                graduation_year: undefined
            })
        } catch (error: any) {
            console.error('❌ Error creating student:', error)
            const errorMessage = getErrorMessage(error, 'Failed to create student')
            setError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: keyof CreateStudentRequest, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        // Clear error when user starts typing
        if (error) {
            setError(null)
        }
    }



    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={(e) => {
                                console.log('🖱️ Background overlay clicked, closing modal')
                                onClose()
                            }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 border-gray-300 dark:border-slate-600"
                            onClick={(e) => {
                                console.log('🖱️ Modal container clicked, stopping propagation')
                                e.stopPropagation()
                            }}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b-2 border-gray-200 dark:border-slate-600">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Add New Student
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {showSuccess ? (
                                <div className="px-6 py-4 bg-white dark:bg-slate-800">
                                    <div className="text-center py-8">
                                        <div className="mb-6">
                                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
                                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                                                Student Created Successfully!
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                The student account has been created and a welcome email has been sent.
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                Login Credentials:
                                            </h4>
                                            <div className="space-y-2 text-left">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">Email:</span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{createdStudent?.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">Password:</span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Password@123</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSuccess(false)
                                                    setCreatedStudent(null)
                                                    onClose()
                                                }}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSuccess(false)
                                                    setCreatedStudent(null)
                                                }}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                                            >
                                                Add Another Student
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="px-6 py-4 bg-white dark:bg-slate-800" onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        console.log('⌨️ Enter key pressed in form')
                                    }
                                }} onClick={(e) => {
                                    console.log('🖱️ Form clicked, preventing bubble')
                                    e.stopPropagation()
                                }} onMouseDown={(e) => {
                                    console.log('🖱️ Form mouse down, preventing bubble')
                                    e.stopPropagation()
                                }}>
                                    {/* Error Display */}
                                    {error && (
                                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                                                        Error
                                                    </h4>
                                                    <p className="text-sm text-red-800 dark:text-red-200">
                                                        {error}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    id="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                                    placeholder="Enter student's full name"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                                    placeholder="Enter student's email address"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                                    placeholder="Enter student's phone number"
                                                />
                                            </div>
                                        </div>

                                        {/* Degree */}
                                        <div>
                                            <label htmlFor="degree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Degree
                                            </label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    id="degree"
                                                    value={formData.degree || ''}
                                                    onChange={(e) => handleInputChange('degree', e.target.value || undefined)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                                    placeholder="e.g., Bachelor of Technology"
                                                />
                                            </div>
                                        </div>

                                        {/* Branch */}
                                        <div>
                                            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Branch
                                            </label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    id="branch"
                                                    value={formData.branch || ''}
                                                    onChange={(e) => handleInputChange('branch', e.target.value || undefined)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                                    placeholder="e.g., Computer Science"
                                                />
                                            </div>
                                        </div>

                                        {/* Graduation Year */}
                                        <div>
                                            <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Graduation Year
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    id="graduation_year"
                                                    min="2000"
                                                    max="2030"
                                                    value={formData.graduation_year || ''}
                                                    onChange={(e) => handleInputChange('graduation_year', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                                    placeholder="e.g., 2025"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                console.log('❌ Cancel button clicked!')
                                                e.preventDefault()
                                                e.stopPropagation()
                                                onClose()
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            onClick={(e) => {
                                                console.log('🔘 Submit button clicked!')
                                                e.stopPropagation()
                                                // Let the form handle the submission
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create Student'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
