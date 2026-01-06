"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, GraduationCap, Calendar, AlertCircle, ShieldAlert } from 'lucide-react'
import { CreateStudentRequest } from '@/types/university'
import { getErrorMessage } from '@/lib/error-handler'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import apiClient from '@/lib/api'
import toast from 'react-hot-toast'

// Degree options (Full list for fallback)
export const degreeOptions = [
    { value: 'Bachelor of Technology', label: 'Bachelor of Technology (B.Tech)' },
    { value: 'Bachelor of Engineering', label: 'Bachelor of Engineering (B.E.)' },
    { value: 'Bachelor of Science', label: 'Bachelor of Science (B.Sc)' },
    { value: 'Bachelor of Computer Applications', label: 'Bachelor of Computer Applications (BCA)' },
    { value: 'Bachelor of Business Administration', label: 'Bachelor of Business Administration (BBA)' },
    { value: 'Bachelor of Commerce', label: 'Bachelor of Commerce (B.Com)' },
    { value: 'Bachelor of Arts', label: 'Bachelor of Arts (B.A.)' },
    { value: 'Master of Technology', label: 'Master of Technology (M.Tech)' },
    { value: 'Master of Engineering', label: 'Master of Engineering (M.E.)' },
    { value: 'Master of Science', label: 'Master of Science (M.Sc)' },
    { value: 'Master of Computer Applications', label: 'Master of Computer Applications (MCA)' },
    { value: 'Master of Business Administration', label: 'Master of Business Administration (MBA)' },
    { value: 'Master of Commerce', label: 'Master of Commerce (M.Com)' },
    { value: 'Master of Arts', label: 'Master of Arts (M.A.)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Post Graduate Diploma', label: 'Post Graduate Diploma (PGD)' },
    { value: 'Doctor of Philosophy', label: 'Doctor of Philosophy (Ph.D)' },
    { value: 'Other', label: 'Other' }
]

// Branch options (Full list for fallback)
export const branchOptions = [
    { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics and Communication Engineering', label: 'Electronics and Communication Engineering' },
    { value: 'Electrical Engineering', label: 'Electrical Engineering' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Chemical Engineering', label: 'Chemical Engineering' },
    { value: 'Aerospace Engineering', label: 'Aerospace Engineering' },
    { value: 'Biotechnology', label: 'Biotechnology' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'Software Engineering', label: 'Software Engineering' },
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Operations Management', label: 'Operations Management' },
    { value: 'International Business', label: 'International Business' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'English Literature', label: 'English Literature' },
    { value: 'History', label: 'History' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Sociology', label: 'Sociology' },
    { value: 'Political Science', label: 'Political Science' },
    { value: 'Other', label: 'Other' }
]

interface LocalLicense {
    id: string
    batch: string
    degree?: string[]
    branches?: string[]
    is_active: boolean
    remaining_licenses: number
}

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

    // License state
    const [licenses, setLicenses] = useState<LocalLicense[]>([])
    const [isLoadingLicenses, setIsLoadingLicenses] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchLicenses()
        }
    }, [isOpen])

    const fetchLicenses = async () => {
        setIsLoadingLicenses(true)
        setFetchError(null)
        try {
            const response = await apiClient.getUniversityLicenses()
            // Make sure we have an array
            const licenseList = response.licenses || []
            console.log('Fetched licenses:', licenseList)
            setLicenses(licenseList)
        } catch (err: any) {
            console.error('Failed to fetch licenses:', err)
            setFetchError("Failed to load licenses. Please try again.")
        } finally {
            setIsLoadingLicenses(false)
        }
    }

    // Derived state for filtered options
    // We keep this to know if we have ANY active licenses to show the global warning if needed, 
    // or just use it for validation.
    const activeLicenses = useMemo(() => licenses.filter(l => l.is_active && l.remaining_licenses > 0), [licenses])
    const hasActiveLicenses = activeLicenses.length > 0

    // Toast warning if no licenses (Keep strictly if 0 licenses exist)
    useEffect(() => {
        if (isOpen && !isLoadingLicenses && !hasActiveLicenses && !fetchError) {
            const timer = setTimeout(() => {
                toast.error("Active license is required to create students")
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [isOpen, isLoadingLicenses, hasActiveLicenses, fetchError])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Validate required fields
        if (!formData.name || !formData.email || !formData.phone) {
            alert('Please fill in all required fields: Name, Email, and Phone')
            return
        }

        if (!formData.graduation_year || !formData.degree || !formData.branch) {
            setError("Please fill in Graduation Year, Degree, and Branch.")
            return
        }

        // License Verification Logic (Submit Time)
        const yearStr = formData.graduation_year.toString()
        const selectedDegree = formData.degree
        const selectedBranch = formData.branch

        const isLicenseValid = activeLicenses.some(l => {
            // Must match Batch
            if (l.batch !== yearStr) return false

            // Must match Degree (or license allows all degrees)
            const licenseDegrees = (l.degree && Array.isArray(l.degree)) ? l.degree : []
            const degreeMatch = licenseDegrees.length === 0 || licenseDegrees.includes(selectedDegree)
            if (!degreeMatch) return false

            // Must match Branch (or license allows all branches)
            // Note: Some schemas might have branches inside degree, but assuming flattened here or handled by backend logic mirrored here
            const licenseBranches = (l.branches && Array.isArray(l.branches)) ? l.branches : []
            const branchMatch = licenseBranches.length === 0 || licenseBranches.includes(selectedBranch)
            if (!branchMatch) return false

            return true
        })

        if (!isLicenseValid) {
            toast.error("You don't have a valid license for this Batch, Degree, and Branch. Please request a license.")
            setError("You don't have a valid license for this Batch, Degree, and Branch. Please request a license.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await onSubmit(formData)
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
            // Refetch licenses to update remaining counts if needed
            fetchLicenses()
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
            [field]: value as any
        }))
        // Clear error when user starts typing
        if (error) {
            setError(null)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-2 py-4 sm:px-4 sm:py-8 text-center">
                        {/* Background overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={onClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full mx-auto max-w-sm sm:max-w-lg bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform transition-all border-2 border-gray-300 dark:border-slate-600"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 px-4 py-3 sm:px-6 sm:py-4 border-b-2 border-gray-200 dark:border-slate-600">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                                        Add New Student
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {showSuccess ? (
                                <div className="px-4 py-4 sm:px-6 sm:py-6 bg-white dark:bg-slate-800 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    <div className="text-center py-6 sm:py-8">
                                        <div className="mb-4 sm:mb-6">
                                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
                                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                                                Student Created Successfully!
                                            </h3>
                                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-2">
                                                The student account has been created and a welcome email has been sent.
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                                                Login Credentials:
                                            </h4>
                                            <div className="space-y-2 text-left">
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Email:</span>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-all">{createdStudent?.email}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Password:</span>
                                                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Password@123</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSuccess(false)
                                                    setCreatedStudent(null)
                                                    onClose()
                                                }}
                                                className="w-full sm:flex-1 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSuccess(false)
                                                    setCreatedStudent(null)
                                                }}
                                                className="w-full sm:flex-1 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                                            >
                                                Add Another Student
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-6 bg-white dark:bg-slate-800 max-h-[calc(100vh-200px)] overflow-y-auto">
                                    {/* Error Display */}
                                    {error && (
                                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 sm:p-4">
                                            <div className="flex gap-2 sm:gap-3">
                                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-left min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                                                        Error
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 break-words">
                                                        {error}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* License Warning */}
                                    {!isLoadingLicenses && !hasActiveLicenses && !fetchError && (
                                        <div className="mb-4 sm:mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4">
                                            <div className="flex gap-2 sm:gap-3">
                                                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-left min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                                                        No Active Licenses
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 break-words">
                                                        You need an active license to create student accounts. Please request a license from the administration.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 sm:space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    id="name"
                                                    required
                                                    disabled={!hasActiveLicenses}
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="Enter student's full name"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    required
                                                    disabled={!hasActiveLicenses}
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="Enter student's email address"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    required
                                                    disabled={!hasActiveLicenses}
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="Enter student's phone number"
                                                />
                                            </div>
                                        </div>

                                        {/* Graduation Year (Batch) - Independent Input */}
                                        <div>
                                            <label htmlFor="graduation_year" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Graduation Year (Batch) *
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                                <input
                                                    type="text"
                                                    id="graduation_year"
                                                    required
                                                    disabled={!hasActiveLicenses}
                                                    value={formData.graduation_year || ''}
                                                    onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                                                    placeholder="e.g. 2025"
                                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Degree - Independent Select */}
                                        <div>
                                            <label htmlFor="degree" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Degree *
                                            </label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                                <Select
                                                    value={formData.degree || ''}
                                                    onValueChange={(value) => handleInputChange('degree', value)}
                                                    disabled={!hasActiveLicenses}
                                                >
                                                    <SelectTrigger className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50">
                                                        <SelectValue placeholder="Select Degree" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-48 sm:max-h-60">
                                                        {degreeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Branch - Independent Select */}
                                        <div>
                                            <label htmlFor="branch" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Branch *
                                            </label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                                <Select
                                                    value={formData.branch || ''}
                                                    onValueChange={(value) => handleInputChange('branch', value)}
                                                    disabled={!hasActiveLicenses}
                                                >
                                                    <SelectTrigger className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50">
                                                        <SelectValue placeholder="Select Branch" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-48 sm:max-h-60">
                                                        {branchOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>


                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !hasActiveLicenses}
                                            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
