"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Calendar, MapPin, DollarSign, Users, Briefcase, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { MultiSelectDropdown } from '@/components/ui/MultiSelectDropdown'
import { apiClient } from '@/lib/api'
import { useIndustries, useLocationPreferences, useSkills, useDegrees, useBranches } from '@/hooks/useLookup'
import { toast } from 'react-hot-toast'

interface CreateJobModalProps {
    isOpen: boolean
    onClose: () => void
    onJobCreated: () => void
    userType?: 'corporate' | 'university' // Added to determine which API endpoint to use
}

interface JobFormData {
    title: string
    description: string
    requirements: string
    responsibilities: string
    job_type: string
    location: string[]
    remote_work: boolean
    travel_required: boolean
    onsite_office: boolean
    salary_min: string
    salary_max: string
    salary_currency: string
    experience_min: string
    experience_max: string
    education_level: string[]
    skills_required: string[]
    application_deadline: string
    industry: string
    selection_process: string
    campus_drive_date: string
    status: string
    // New fields from JD template
    number_of_openings: string
    perks_and_benefits: string
    eligibility_criteria: string
    education_degree: string[]
    education_branch: string[]
    service_agreement_details: string
    expiration_date: string
    ctc_with_probation: string
    ctc_after_probation: string
}

export function CreateJobModal({ isOpen, onClose, onJobCreated, userType = 'corporate' }: CreateJobModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    
    // Fetch industries, location preferences, skills, degrees, and branches from backend API
    const { data: industriesData, loading: loadingIndustries } = useIndustries({ limit: 1000 })
    const { data: locationPreferencesData, loading: loadingLocations } = useLocationPreferences({ limit: 1000 })
    const { data: skillsData, loading: loadingSkills } = useSkills({ limit: 1000 })
    const { data: degreesData, loading: loadingDegrees } = useDegrees({ limit: 1000 })
    const { data: branchesData, loading: loadingBranches } = useBranches({ limit: 1000 })
    
    // Transform industries data to match select dropdown format
    const industryOptions = industriesData.map((industry) => ({
        id: industry.id,
        value: industry.name,
        label: industry.name
    }))
    
    // Transform location preferences data to match MultiSelectDropdown format
    const locationOptions = locationPreferencesData.map((location) => ({
        id: location.id,
        value: location.name,
        label: location.name
    }))
    
    // Transform skills data to match MultiSelectDropdown format
    const skillOptions = skillsData.map((skill) => ({
        id: skill.id,
        value: skill.name,
        label: skill.name
    }))
    
    // Transform degrees data to match MultiSelectDropdown format
    const degreeOptions = degreesData.map((degree) => ({
        id: degree.id,
        value: degree.name,
        label: degree.name
    }))
    
    // Transform branches data to match MultiSelectDropdown format
    const branchOptions = branchesData.map((branch) => ({
        id: branch.id,
        value: branch.name,
        label: branch.name
    }))
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        job_type: '',
        location: [],
        remote_work: false,
        travel_required: false,
        onsite_office: false,
        salary_min: '',
        salary_max: '',
        salary_currency: 'INR',
        experience_min: '',
        experience_max: '',
        education_level: [],
        skills_required: [],
        application_deadline: '',
        industry: '',
        selection_process: '',
        campus_drive_date: '',
        status: 'active',
        // New fields from JD template
        number_of_openings: '',
        perks_and_benefits: '',
        eligibility_criteria: '',
        education_degree: [],
        education_branch: [],
        service_agreement_details: '',
        expiration_date: '',
        ctc_with_probation: '',
        ctc_after_probation: ''
    })

    const handleInputChange = (field: keyof JobFormData, value: string | boolean | string[]) => {
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

    const handleMultiSelectChange = (field: 'education_degree' | 'education_branch' | 'education_level', value: string) => {
        setFormData(prev => {
            const currentValues = prev[field] as string[]
            const isSelected = currentValues.includes(value)

            if (isSelected) {
                // Remove the value
                return {
                    ...prev,
                    [field]: currentValues.filter(v => v !== value)
                }
            } else {
                // Add the value
                return {
                    ...prev,
                    [field]: [...currentValues, value]
                }
            }
        })
    }

    const handleEducationDegreeChange = (selectedDegrees: string[]) => {
        setFormData(prev => ({
            ...prev,
            education_degree: selectedDegrees
        }))
    }

    const handleEducationBranchChange = (selectedBranches: string[]) => {
        setFormData(prev => ({
            ...prev,
            education_branch: selectedBranches
        }))
    }

    const handleLocationChange = (selectedLocations: string[]) => {
        setFormData(prev => ({
            ...prev,
            location: selectedLocations
        }))
        
        // Clear validation error for location when user selects
        if (validationErrors.location) {
            setValidationErrors(prev => ({
                ...prev,
                location: ''
            }))
        }
    }

    const handleSkillsChange = (selectedSkills: string[]) => {
        setFormData(prev => ({
            ...prev,
            skills_required: selectedSkills
        }))
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
        if (formData.location.length === 0) {
            errors.location = 'At least one location is required'
        }

        // If there are validation errors, show them and return
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        setIsLoading(true)

        try {
            // Determine mode_of_work based on checkbox states
            console.log('🔍 Create job - Form data checkboxes:', {
                onsite_office: formData.onsite_office,
                remote_work: formData.remote_work,
                travel_required: formData.travel_required
            })
            
            let modeOfWork = null
            if (formData.onsite_office && formData.remote_work) {
                modeOfWork = 'hybrid'
            } else if (formData.onsite_office) {
                modeOfWork = 'onsite'
            } else if (formData.remote_work) {
                modeOfWork = 'remote'
            }
            
            console.log('🔍 Create job - Derived mode_of_work:', modeOfWork)

            // Prepare data for API - match backend schema exactly
            const jobData = {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements || null,
                responsibilities: formData.responsibilities || null,
                job_type: formData.job_type,
                location: formData.location.length > 0 ? formData.location.join(', ') : null,
                remote_work: formData.remote_work,
                travel_required: formData.travel_required,
                mode_of_work: modeOfWork,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                salary_currency: formData.salary_currency,
                experience_min: formData.experience_min ? parseInt(formData.experience_min) : null,
                experience_max: formData.experience_max ? parseInt(formData.experience_max) : null,
                education_level: formData.education_level.length > 0 ? formData.education_level : null,
                skills_required: formData.skills_required.length > 0 ? formData.skills_required : null,
                application_deadline: formData.application_deadline ? formData.application_deadline : null,
                industry: formData.industry || null,
                selection_process: formData.selection_process || null,
                campus_drive_date: formData.campus_drive_date ? formData.campus_drive_date : null,
                status: formData.status,
                // New fields from JD template
                number_of_openings: formData.number_of_openings ? parseInt(formData.number_of_openings) : null,
                perks_and_benefits: formData.perks_and_benefits || null,
                eligibility_criteria: formData.eligibility_criteria || null,
                education_degree: formData.education_degree.length > 0 ? formData.education_degree : null,
                education_branch: formData.education_branch.length > 0 ? formData.education_branch : null,
                service_agreement_details: formData.service_agreement_details || null,
                expiration_date: formData.expiration_date ? formData.expiration_date : null,
                ctc_with_probation: formData.ctc_with_probation || null,
                ctc_after_probation: formData.ctc_after_probation || null
            }

            // Use appropriate API endpoint based on userType
            if (userType === 'university') {
                await apiClient.createUniversityJob(jobData)
            } else {
                await apiClient.createJob(jobData)
            }

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
                location: [],
                remote_work: false,
                travel_required: false,
                onsite_office: false,
                salary_min: '',
                salary_max: '',
                salary_currency: 'INR',
                experience_min: '',
                experience_max: '',
                education_level: [],
                skills_required: [],
                application_deadline: '',
                industry: '',
                selection_process: '',
                campus_drive_date: '',
                status: 'active',
                // New fields from JD template
                number_of_openings: '',
                perks_and_benefits: '',
                eligibility_criteria: '',
                education_degree: [],
                education_branch: [],
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

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Location *
                                        </label>
                                        
                                        {/* Display selected location tags */}
                                        {formData.location.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.location.map((location, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                    >
                                                        {location}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newLocations = formData.location.filter(loc => loc !== location)
                                                                handleLocationChange(newLocations)
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <MultiSelectDropdown
                                            options={locationOptions}
                                            selectedValues={formData.location}
                                            onSelectionChange={handleLocationChange}
                                            placeholder={loadingLocations ? "Loading locations..." : validationErrors.location || "Select location(s)"}
                                            disabled={loadingLocations}
                                            isLoading={loadingLocations}
                                            showAllOption={false}
                                            hideSelectedTags={true}
                                            className="w-full"
                                        />
                                        {validationErrors.location && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Industry
                                        </label>
                                        <Select 
                                            value={formData.industry} 
                                            onValueChange={(value) => handleInputChange('industry', value)}
                                            disabled={loadingIndustries}
                                        >
                                            <SelectTrigger disabled={loadingIndustries}>
                                                <SelectValue placeholder={loadingIndustries ? "Loading industries..." : "Select industry"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {industryOptions.map((option) => (
                                                    <SelectItem key={option.id} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6 flex-wrap gap-4">
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

                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.onsite_office}
                                            onChange={(e) => handleInputChange('onsite_office', e.target.checked)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Onsite office</span>
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
                                        <div className="space-y-2">
                                            <Select onValueChange={(value) => handleMultiSelectChange('education_level', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select education level(s)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="high_school">High School</SelectItem>
                                                    <SelectItem value="diploma">Diploma</SelectItem>
                                                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                                    <SelectItem value="master">Master's Degree</SelectItem>
                                                    <SelectItem value="phd">PhD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formData.education_level.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.education_level.map((level, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                                        >
                                                            {level === 'high_school' ? 'High School' :
                                                                level === 'diploma' ? 'Diploma' :
                                                                    level === 'bachelor' ? "Bachelor's Degree" :
                                                                        level === 'master' ? "Master's Degree" :
                                                                            level === 'phd' ? 'PhD' : level}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMultiSelectChange('education_level', level)}
                                                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Probation Salary Details */}
                                <div className="space-y-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Probation Salary Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Stipend During Probation
                                            </label>
                                            <Input
                                                value={formData.ctc_with_probation}
                                                onChange={(e) => handleInputChange('ctc_with_probation', e.target.value)}
                                                placeholder="e.g., 4k-10k per month"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Probation Time
                                            </label>
                                            <Input
                                                value={formData.ctc_after_probation}
                                                onChange={(e) => handleInputChange('ctc_after_probation', e.target.value)}
                                                placeholder="e.g., 3Months-6Months"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Required Skills
                                </h3>

                                {/* Display selected skill tags */}
                                {formData.skills_required.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
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

                                {/* Unified dropdown with create functionality */}
                                <MultiSelectDropdown
                                    options={skillOptions}
                                    selectedValues={formData.skills_required}
                                    onSelectionChange={handleSkillsChange}
                                    placeholder={loadingSkills ? "Loading skills..." : "Select skills from list or type to add custom"}
                                    disabled={loadingSkills}
                                    isLoading={loadingSkills}
                                    showAllOption={false}
                                    hideSelectedTags={true}
                                    allowCreate={true}
                                    onCreateOption={(value) => {
                                        if (!formData.skills_required.includes(value)) {
                                            handleSkillsChange([...formData.skills_required, value])
                                        }
                                    }}
                                    className="w-full"
                                />
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
                                        placeholder="Round 1: Online Test, Round 2: Technical Interview, Round 3: HR Round"
                                        rows={2}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Use format: Round 1: Description, Round 2: Description, etc.
                                    </p>
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
                                            Education Degree
                                        </label>
                                        
                                        {/* Display selected degree tags */}
                                        {formData.education_degree.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.education_degree.map((degree, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                                    >
                                                        {degreeOptions.find(opt => opt.value === degree)?.label || degree}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newDegrees = formData.education_degree.filter(d => d !== degree)
                                                                handleEducationDegreeChange(newDegrees)
                                                            }}
                                                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <MultiSelectDropdown
                                            options={degreeOptions}
                                            selectedValues={formData.education_degree}
                                            onSelectionChange={handleEducationDegreeChange}
                                            placeholder={loadingDegrees ? "Loading degrees..." : "Select degree(s) or type to add custom"}
                                            disabled={loadingDegrees}
                                            isLoading={loadingDegrees}
                                            showAllOption={false}
                                            hideSelectedTags={true}
                                            allowCreate={true}
                                            onCreateOption={(value) => {
                                                if (!formData.education_degree.includes(value)) {
                                                    handleEducationDegreeChange([...formData.education_degree, value])
                                                }
                                            }}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Education Branch
                                        </label>
                                        
                                        {/* Display selected branch tags */}
                                        {formData.education_branch.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.education_branch.map((branch, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                                    >
                                                        {branchOptions.find(opt => opt.value === branch)?.label || branch}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newBranches = formData.education_branch.filter(b => b !== branch)
                                                                handleEducationBranchChange(newBranches)
                                                            }}
                                                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <MultiSelectDropdown
                                            options={branchOptions}
                                            selectedValues={formData.education_branch}
                                            onSelectionChange={handleEducationBranchChange}
                                            placeholder={loadingBranches ? "Loading branches..." : "Select branch(es) or type to add custom"}
                                            disabled={loadingBranches}
                                            isLoading={loadingBranches}
                                            showAllOption={false}
                                            hideSelectedTags={true}
                                            allowCreate={true}
                                            onCreateOption={(value) => {
                                                if (!formData.education_branch.includes(value)) {
                                                    handleEducationBranchChange([...formData.education_branch, value])
                                                }
                                            }}
                                            className="w-full"
                                        />
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

