"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Calendar, MapPin, DollarSign, Users, Briefcase, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface CreateJobModalProps {
    isOpen: boolean
    onClose: () => void
    onJobCreated: () => void
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
    status: string
    // New fields from JD template
    number_of_openings: string
    joining_location: string
    mode_of_work: string
    perks_and_benefits: string
    eligibility_criteria: string
    education_degree: string
    education_branch: string
    service_agreement_details: string
    expiration_date: string
    ctc_with_probation: string
    ctc_after_probation: string
}

export function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
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
        campus_drive_date: '',
        status: 'active',
        // New fields from JD template
        number_of_openings: '',
        joining_location: '',
        mode_of_work: '',
        perks_and_benefits: '',
        eligibility_criteria: '',
        education_degree: '',
        education_branch: '',
        service_agreement_details: '',
        expiration_date: '',
        ctc_with_probation: '',
        ctc_after_probation: ''
    })

    const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
        console.log('📝 handleInputChange called:', { field, value })

        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear validation error for this field when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }))
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('🚨 Form submitted! Event:', e)
        console.log('🚨 Form target:', e.target)
        console.log('🚨 Form data:', formData)

        // Clear previous validation errors
        setValidationErrors({})

        // Validate required fields and set inline errors
        const errors: Record<string, string> = {}

        if (!formData.title.trim()) {
            errors.title = 'Job title is required'
        }
        if (!formData.description.trim()) {
            errors.description = 'Job description is required'
        } else if (formData.description.length < 10) {
            errors.description = 'Job description must be at least 10 characters long'
        }
        if (!formData.job_type) {
            errors.job_type = 'Job type is required'
        }
        if (!formData.location.trim()) {
            errors.location = 'Location is required'
        }

        // If there are validation errors, show them and return
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        setIsLoading(true)

        try {
            // Prepare data for API - match backend schema exactly
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
                campus_drive_date: formData.campus_drive_date ? formData.campus_drive_date : null,
                status: formData.status,
                // New fields from JD template
                number_of_openings: formData.number_of_openings ? parseInt(formData.number_of_openings) : null,
                joining_location: formData.joining_location || null,
                mode_of_work: formData.mode_of_work || null,
                perks_and_benefits: formData.perks_and_benefits || null,
                eligibility_criteria: formData.eligibility_criteria || null,
                education_degree: formData.education_degree || null,
                education_branch: formData.education_branch || null,
                service_agreement_details: formData.service_agreement_details || null,
                expiration_date: formData.expiration_date ? formData.expiration_date : null,
                ctc_with_probation: formData.ctc_with_probation || null,
                ctc_after_probation: formData.ctc_after_probation || null
            }

            await apiClient.createJob(jobData)

            const successMessages = {
                active: 'Job posted successfully!',
                inactive: 'Job created and set to inactive!'
            }

            const message = successMessages[formData.status as keyof typeof successMessages] || 'Job created successfully!'
            toast.success(message)
            onJobCreated()
            onClose()

            // Reset form
            setFormData({
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
                campus_drive_date: '',
                status: 'active',
                // New fields from JD template
                number_of_openings: '',
                joining_location: '',
                mode_of_work: '',
                perks_and_benefits: '',
                eligibility_criteria: '',
                education_degree: '',
                education_branch: '',
                service_agreement_details: '',
                expiration_date: '',
                ctc_with_probation: '',
                ctc_after_probation: ''
            })
        } catch (error: any) {
            console.error('Failed to create job:', error)
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to create job. Please try again.'
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create job. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-primary-200 dark:border-primary-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Create New Job Posting 💼
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    Fill in the details to post a new job opportunity
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Title *
                                        </label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder={validationErrors.title || "e.g., Senior Software Engineer"}
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
                                        <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                                            <SelectTrigger className={validationErrors.job_type ? "border-red-500" : ""}>
                                                <SelectValue placeholder={validationErrors.job_type || "Select job type"} />
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
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Job Description *
                                    </label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder={validationErrors.description || "Describe the role, company culture, and what makes this opportunity special..."}
                                        rows={4}
                                        className={validationErrors.description ? "border-red-500 placeholder-red-500" : ""}
                                    />
                                    {validationErrors.description && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Requirements
                                        </label>
                                        <Textarea
                                            value={formData.requirements}
                                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                                            placeholder="List the required qualifications, skills, and experience..."
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
                                </div>

                                {/* Status Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Status *
                                        </label>
                                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select job status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active - Job is live and accepting applications</SelectItem>
                                                <SelectItem value="inactive">Inactive - Hidden from public view</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Choose how you want to publish this job posting
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Work Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Location & Work Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Location *
                                        </label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder={validationErrors.location || "e.g., Bangalore, Karnataka"}
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
                                            placeholder="e.g., Technology, Finance, Healthcare"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.remote_work}
                                            onChange={(e) => handleInputChange('remote_work', e.target.checked)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Remote work allowed</span>
                                    </label>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.travel_required}
                                            onChange={(e) => handleInputChange('travel_required', e.target.checked)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Travel required</span>
                                    </label>
                                </div>
                            </div>

                            {/* Compensation */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Compensation & Experience
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Minimum Salary
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
                                            Maximum Salary
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.salary_max}
                                            onChange={(e) => handleInputChange('salary_max', e.target.value)}
                                            placeholder="e.g., 1000000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Currency
                                        </label>
                                        <Select value={formData.salary_currency} onValueChange={(value) => handleInputChange('salary_currency', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <Select value={formData.education_level} onValueChange={(value) => handleInputChange('education_level', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select education level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high_school">High School</SelectItem>
                                                <SelectItem value="diploma">Diploma</SelectItem>
                                                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                                <SelectItem value="master">Master's Degree</SelectItem>
                                                <SelectItem value="phd">PhD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Required Skills
                                </h3>

                                <div className="flex gap-2">
                                    <Input
                                        value={currentSkill}
                                        onChange={(e) => setCurrentSkill(e.target.value)}
                                        placeholder="Add a skill (e.g., Python, React, AWS)"
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
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill)}
                                                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Application Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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
                                            autoClose={true}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Applications
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.max_applications}
                                            onChange={(e) => handleInputChange('max_applications', e.target.value)}
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Number of Openings
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.number_of_openings}
                                            onChange={(e) => handleInputChange('number_of_openings', e.target.value)}
                                            placeholder="e.g., 3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Expiration Date
                                        </label>
                                        <DateTimePicker
                                            value={formData.expiration_date}
                                            onChange={(value) => handleInputChange('expiration_date', value)}
                                            placeholder="Select expiration date"
                                            autoClose={true}
                                        />
                                    </div>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campus Drive Date (if applicable)
                                    </label>
                                    <DateTimePicker
                                        value={formData.campus_drive_date}
                                        onChange={(value) => handleInputChange('campus_drive_date', value)}
                                        placeholder="Select campus drive date"
                                        autoClose={true}
                                    />
                                </div>
                            </div>

                            {/* Additional Job Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Additional Job Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Joining Location
                                        </label>
                                        <Input
                                            value={formData.joining_location}
                                            onChange={(e) => handleInputChange('joining_location', e.target.value)}
                                            placeholder="e.g., Ahmedabad, Gujarat"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mode of Work
                                        </label>
                                        <Select value={formData.mode_of_work} onValueChange={(value) => handleInputChange('mode_of_work', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select mode of work" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="onsite">Onsite</SelectItem>
                                                <SelectItem value="remote">Remote</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Education Degree
                                        </label>
                                        <Select value={formData.education_degree} onValueChange={(value) => handleInputChange('education_degree', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select degree" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="B.Tech">B.Tech</SelectItem>
                                                <SelectItem value="MCA">MCA</SelectItem>
                                                <SelectItem value="B.E">B.E</SelectItem>
                                                <SelectItem value="M.Tech">M.Tech</SelectItem>
                                                <SelectItem value="B.Sc">B.Sc</SelectItem>
                                                <SelectItem value="M.Sc">M.Sc</SelectItem>
                                                <SelectItem value="BBA">BBA</SelectItem>
                                                <SelectItem value="MBA">MBA</SelectItem>
                                                <SelectItem value="Any">Any</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Education Branch
                                        </label>
                                        <Select value={formData.education_branch} onValueChange={(value) => handleInputChange('education_branch', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Branches</SelectItem>
                                                <SelectItem value="CSE">Computer Science</SelectItem>
                                                <SelectItem value="ECE">Electronics & Communication</SelectItem>
                                                <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                                                <SelectItem value="ME">Mechanical</SelectItem>
                                                <SelectItem value="CE">Civil</SelectItem>
                                                <SelectItem value="IT">Information Technology</SelectItem>
                                                <SelectItem value="CS">Computer Science</SelectItem>
                                                <SelectItem value="MCA">MCA</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Eligibility Criteria
                                    </label>
                                    <Textarea
                                        value={formData.eligibility_criteria}
                                        onChange={(e) => handleInputChange('eligibility_criteria', e.target.value)}
                                        placeholder="e.g., B.Tech, MCA"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Perks and Benefits
                                    </label>
                                    <Textarea
                                        value={formData.perks_and_benefits}
                                        onChange={(e) => handleInputChange('perks_and_benefits', e.target.value)}
                                        placeholder="e.g., Unlimited growth opportunities, Highly competitive pay, Learning and development"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Service Agreement Details
                                    </label>
                                    <Textarea
                                        value={formData.service_agreement_details}
                                        onChange={(e) => handleInputChange('service_agreement_details', e.target.value)}
                                        placeholder="Enter service agreement details if applicable"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Probation Salary Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Probation Salary Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            CTC During Probation
                                        </label>
                                        <Input
                                            value={formData.ctc_with_probation}
                                            onChange={(e) => handleInputChange('ctc_with_probation', e.target.value)}
                                            placeholder="e.g., 4k-10k per month"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            CTC After Probation
                                        </label>
                                        <Input
                                            value={formData.ctc_after_probation}
                                            onChange={(e) => handleInputChange('ctc_after_probation', e.target.value)}
                                            placeholder="e.g., 2LPA-3LPA"
                                        />
                                    </div>
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
                                        Creating Job...
                                    </>
                                ) : (
                                    'Create Job Posting'
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
