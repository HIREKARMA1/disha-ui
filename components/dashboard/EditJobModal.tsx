"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Calendar, MapPin, DollarSign, Users, Briefcase, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Job {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: string
    status: string
    location: string
    remote_work: boolean
    travel_required: boolean
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    education_level?: string
    skills_required?: string[]
    application_deadline?: string
    max_applications: number
    current_applications: number
    industry?: string
    selection_process?: string
    campus_drive_date?: string
    views_count: number
    applications_count: number
    created_at: string
    corporate_id: string
    corporate_name?: string
    is_active: boolean
    can_apply: boolean
}

interface EditJobModalProps {
    isOpen: boolean
    onClose: () => void
    onJobUpdated: () => void
    job: Job | null
    isAdmin?: boolean // Add prop to indicate if this is admin context
}

interface JobFormData {
    title: string
    description: string
    requirements: string
    responsibilities: string
    job_type: string
    location: string
    remote_work: boolean
    travel_required: boolean
    salary_min: string
    salary_max: string
    salary_currency: string
    experience_min: string
    experience_max: string
    education_level: string
    skills_required: string[]
    application_deadline: string
    max_applications: string
    industry: string
    selection_process: string
    campus_drive_date: string
}

export function EditJobModal({ isOpen, onClose, onJobUpdated, job, isAdmin = false }: EditJobModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentSkill, setCurrentSkill] = useState('')
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        job_type: '',
        location: '',
        remote_work: false,
        travel_required: false,
        salary_min: '',
        salary_max: '',
        salary_currency: 'INR',
        experience_min: '',
        experience_max: '',
        education_level: '',
        skills_required: [],
        application_deadline: '',
        max_applications: '100',
        industry: '',
        selection_process: '',
        campus_drive_date: ''
    })

    // Populate form data when job changes
    useEffect(() => {
        if (job) {
            console.log('🔍 EditJobModal Debug:')
            console.log('Job object:', job)
            console.log('Job type from job:', job.job_type)
            console.log('Job type type:', typeof job.job_type)

            setFormData({
                title: job.title || '',
                description: job.description || '',
                requirements: job.requirements || '',
                responsibilities: job.responsibilities || '',
                job_type: job.job_type || '',
                location: job.location || '',
                remote_work: job.remote_work || false,
                travel_required: job.travel_required || false,
                salary_min: job.salary_min ? job.salary_min.toString() : '',
                salary_max: job.salary_max ? job.salary_max.toString() : '',
                salary_currency: job.salary_currency || 'INR',
                experience_min: job.experience_min ? job.experience_min.toString() : '',
                experience_max: job.experience_max ? job.experience_max.toString() : '',
                education_level: job.education_level || '',
                skills_required: job.skills_required || [],
                application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().slice(0, 10) : '',
                max_applications: job.max_applications ? job.max_applications.toString() : '100',
                industry: job.industry || '',
                selection_process: job.selection_process || '',
                campus_drive_date: job.campus_drive_date ? new Date(job.campus_drive_date).toISOString().slice(0, 10) : ''
            })

            console.log('Form data being set:', {
                job_type: job.job_type || '',
                education_level: job.education_level || ''
            })
        }
    }, [job])

    // Debug formData changes
    useEffect(() => {
        console.log('📝 FormData updated:', {
            job_type: formData.job_type,
            education_level: formData.education_level
        })
    }, [formData.job_type, formData.education_level])

    const handleInputChange = (field: keyof JobFormData, value: string | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const addSkill = () => {
        if (currentSkill.trim() && !formData.skills_required.includes(currentSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills_required: [...prev.skills_required, currentSkill.trim()]
            }))
            setCurrentSkill('')
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
        }))
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!formData.title.trim()) errors.title = 'Job title is required'
        if (!formData.description.trim()) errors.description = 'Job description is required'
        if (!formData.job_type) errors.job_type = 'Job type is required'
        if (!formData.location.trim()) errors.location = 'Location is required'
        if (!formData.max_applications || parseInt(formData.max_applications) <= 0) {
            errors.max_applications = 'Max applications must be greater than 0'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        if (!job) return

        setIsLoading(true)
        try {
            const jobData = {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements || null,
                responsibilities: formData.responsibilities || null,
                job_type: formData.job_type,
                location: formData.location,
                remote_work: formData.remote_work,
                travel_required: formData.travel_required,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                salary_currency: formData.salary_currency,
                experience_min: formData.experience_min ? parseInt(formData.experience_min) : null,
                experience_max: formData.experience_max ? parseInt(formData.experience_max) : null,
                education_level: formData.education_level || null,
                skills_required: formData.skills_required.length > 0 ? formData.skills_required : null,
                application_deadline: formData.application_deadline ? formData.application_deadline : null,
                max_applications: parseInt(formData.max_applications),
                industry: formData.industry || null,
                selection_process: formData.selection_process || null,
                campus_drive_date: formData.campus_drive_date ? formData.campus_drive_date : null
            }

            if (isAdmin) {
                await apiClient.updateJobAdmin(job.id, jobData)
            } else {
                await apiClient.updateJob(job.id, jobData)
            }
            toast.success('Job updated successfully!')
            onJobUpdated()
            onClose()
        } catch (error: any) {
            console.error('Failed to update job:', error)
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to update job. Please try again.'
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update job. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen || !job) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 border-b border-primary-200 dark:border-primary-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Job Posting</h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">Update your job posting details</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Briefcase className="w-5 h-5" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Title *
                                        </label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder={validationErrors.title || "e.g., Software Engineer"}
                                            className={validationErrors.title ? "border-red-500 placeholder-red-500" : ""}
                                        />
                                        {validationErrors.title && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Type *
                                        </label>
                                        <Select
                                            key={`job-type-${formData.job_type}-${job?.id}`}
                                            value={formData.job_type || undefined}
                                            onValueChange={(value) => {
                                                console.log('Job type changed to:', value)
                                                handleInputChange('job_type', value)
                                            }}
                                        >
                                            <SelectTrigger className={validationErrors.job_type ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select job type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full_time">Full Time</SelectItem>
                                                <SelectItem value="part_time">Part Time</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                                <SelectItem value="internship">Internship</SelectItem>
                                                <SelectItem value="freelance">Freelance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.job_type && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.job_type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Location *
                                        </label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder={validationErrors.location || "e.g., Mumbai, India"}
                                            className={validationErrors.location ? "border-red-500 placeholder-red-500" : ""}
                                        />
                                        {validationErrors.location && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Industry
                                        </label>
                                        <Input
                                            value={formData.industry}
                                            onChange={(e) => handleInputChange('industry', e.target.value)}
                                            placeholder="e.g., Technology, Finance"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Job Description *
                                    </label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder={validationErrors.description || "Describe the role, responsibilities, and what makes this opportunity exciting..."}
                                        rows={4}
                                        className={validationErrors.description ? "border-red-500 placeholder-red-500" : ""}
                                    />
                                    {validationErrors.description && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Compensation & Experience */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5" />
                                    Compensation & Experience
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Salary Currency
                                        </label>
                                        <Select value={formData.salary_currency} onValueChange={(value) => handleInputChange('salary_currency', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR (₹)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Min Salary
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.salary_min}
                                            onChange={(e) => handleInputChange('salary_min', e.target.value)}
                                            placeholder="e.g., 500000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Salary
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.salary_max}
                                            onChange={(e) => handleInputChange('salary_max', e.target.value)}
                                            placeholder="e.g., 800000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Min Experience (years)
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.experience_min}
                                            onChange={(e) => handleInputChange('experience_min', e.target.value)}
                                            placeholder="e.g., 2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Experience (years)
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.experience_max}
                                            onChange={(e) => handleInputChange('experience_max', e.target.value)}
                                            placeholder="e.g., 5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Education Level
                                        </label>
                                        <Select
                                            key={`education-${formData.education_level}-${job?.id}`}
                                            value={formData.education_level || undefined}
                                            onValueChange={(value) => handleInputChange('education_level', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select education level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high_school">High School</SelectItem>
                                                <SelectItem value="diploma">Diploma</SelectItem>
                                                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                                <SelectItem value="master">Master's Degree</SelectItem>
                                                <SelectItem value="phd">PhD</SelectItem>
                                                <SelectItem value="any">Any</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5" />
                                    Skills Required
                                </h3>

                                <div className="flex gap-2 mb-4">
                                    <Input
                                        value={currentSkill}
                                        onChange={(e) => setCurrentSkill(e.target.value)}
                                        placeholder="Add a skill (e.g., React, Python)"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    />
                                    <Button type="button" onClick={addSkill} variant="outline">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {formData.skills_required.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills_required.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-full text-sm"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="ml-1 hover:text-primary-600 dark:hover:text-primary-400"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Additional Details */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5" />
                                    Additional Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Requirements
                                        </label>
                                        <Textarea
                                            value={formData.requirements}
                                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                                            placeholder="List the specific requirements for this role..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Responsibilities
                                        </label>
                                        <Textarea
                                            value={formData.responsibilities}
                                            onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                                            placeholder="Describe the key responsibilities and duties..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selection Process
                                        </label>
                                        <Textarea
                                            value={formData.selection_process}
                                            onChange={(e) => handleInputChange('selection_process', e.target.value)}
                                            placeholder="Describe the selection process (e.g., Online test, Technical interview, HR round)"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5" />
                                    Application Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Application Deadline
                                        </label>
                                        <DateTimePicker
                                            value={formData.application_deadline}
                                            onChange={(value) => handleInputChange('application_deadline', value)}
                                            placeholder="Select application deadline"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Applications *
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.max_applications}
                                            onChange={(e) => handleInputChange('max_applications', e.target.value)}
                                            placeholder={validationErrors.max_applications || "e.g., 100"}
                                            className={validationErrors.max_applications ? "border-red-500 placeholder-red-500" : ""}
                                        />
                                        {validationErrors.max_applications && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.max_applications}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campus Drive Date (if applicable)
                                    </label>
                                    <DateTimePicker
                                        value={formData.campus_drive_date}
                                        onChange={(value) => handleInputChange('campus_drive_date', value)}
                                        placeholder="Select campus drive date"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Job'
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

