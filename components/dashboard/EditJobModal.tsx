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

// Industry options
const industryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Media & Entertainment', label: 'Media & Entertainment' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Aerospace', label: 'Aerospace' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Government', label: 'Government' },
    { value: 'Non-Profit', label: 'Non-Profit' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Banking', label: 'Banking' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Other', label: 'Other' }
]

// Degree options (same as student modal)
const degreeOptions = [
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
    { value: 'Any', label: 'Any' }
]

// Branch options (same as student modal)
const branchOptions = [
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
    { value: 'All', label: 'All Branches' }
]

interface Job {
    id: string
    title: string
    description: string
    requirements?: string
    responsibilities?: string
    job_type: string
    status: string
    location: string | string[]
    remote_work: boolean
    travel_required: boolean
    onsite_office?: boolean
    mode_of_work?: string
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    education_level?: string | string[]
    education_degree?: string | string[]
    education_branch?: string | string[]
    skills_required?: string[]
    application_deadline?: string
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
    // Additional fields
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    service_agreement_details?: string
    expiration_date?: string
    ctc_with_probation?: string
    ctc_after_probation?: string
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
    education_degree: string[]
    education_branch: string[]
    skills_required: string[]
    application_deadline: string
    industry: string
    selection_process: string
    campus_drive_date: string
    status: string
    // Additional fields
    number_of_openings: string
    perks_and_benefits: string
    eligibility_criteria: string
    service_agreement_details: string
    expiration_date: string
    ctc_with_probation: string
    ctc_after_probation: string
}

// Helper function to clean malformed JSON strings
const cleanJsonString = (str: string): string => {
    if (!str || typeof str !== 'string') return str
    
    const original = str
    let cleaned = str.trim()
    
    // Handle various malformed patterns
    // Remove leading { and trailing }
    cleaned = cleaned.replace(/^\{/, '').replace(/\}$/, '')
    
    // Remove leading and trailing quotes
    cleaned = cleaned.replace(/^"/, '').replace(/"$/, '')
    
    // Remove excessive JSON escaping
    cleaned = cleaned.replace(/\\"/g, '"') // Replace \" with "
    cleaned = cleaned.replace(/\\\\/g, '\\') // Replace \\ with \
    
    // Remove any remaining JSON array markers
    cleaned = cleaned.replace(/^\[/, '').replace(/\]$/, '')
    
    // Clean up any remaining quotes and braces
    cleaned = cleaned.replace(/^\{/, '').replace(/\}$/, '')
    cleaned = cleaned.replace(/^"/, '').replace(/"$/, '')
    
    // Final trim
    cleaned = cleaned.trim()
    
    // Debug logging for problematic strings
    if (original !== cleaned) {
        console.log('🧹 Cleaned string:', { original, cleaned })
    }
    
    return cleaned
}

// Helper function to parse education fields safely
const parseEducationField = (field: string | string[]): string[] => {
    if (Array.isArray(field)) {
        return field.map(item => cleanJsonString(item)).filter(item => item)
    }
    
    if (typeof field === 'string' && field) {
        // First clean the string, then split by comma
        const cleaned = cleanJsonString(field)
        return cleaned.split(',').map(item => item.trim()).filter(item => item)
    }
    
    return []
}

export function EditJobModal({ isOpen, onClose, onJobUpdated, job, isAdmin = false }: EditJobModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentSkill, setCurrentSkill] = useState('')
    const [currentLocation, setCurrentLocation] = useState('')
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
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
        education_degree: [],
        education_branch: [],
        skills_required: [],
        application_deadline: '',
        industry: '',
        selection_process: '',
        campus_drive_date: '',
        status: 'active',
        // Additional fields
        number_of_openings: '',
        perks_and_benefits: '',
        eligibility_criteria: '',
        service_agreement_details: '',
        expiration_date: '',
        ctc_with_probation: '',
        ctc_after_probation: ''
    })

    // Populate form data when job changes
    useEffect(() => {
        if (job) {

            // Handle location - could be string or array
            const locationArray = Array.isArray(job.location) ? job.location : 
                                 (typeof job.location === 'string' && job.location) ? job.location.split(',').map(l => l.trim()) : []
            
            // Handle education fields - use the safe parsing function
            console.log('🔍 Education fields before parsing:', {
                education_level: job.education_level,
                education_degree: job.education_degree,
                education_branch: job.education_branch
            })
            
            const educationLevelArray = parseEducationField(job.education_level || [])
            const educationDegreeArray = parseEducationField(job.education_degree || [])
            const educationBranchArray = parseEducationField(job.education_branch || [])
            
            console.log('🔍 Education fields after parsing:', {
                educationLevelArray,
                educationDegreeArray,
                educationBranchArray
            })

            setFormData({
                title: job.title || '',
                description: job.description || '',
                requirements: job.requirements || '',
                responsibilities: job.responsibilities || '',
                job_type: job.job_type || '',
                location: locationArray,
                remote_work: job.remote_work || false,
                travel_required: job.travel_required || false,
                onsite_office: job.onsite_office || (job.mode_of_work === 'onsite') || false,
                salary_min: job.salary_min ? job.salary_min.toString() : '',
                salary_max: job.salary_max ? job.salary_max.toString() : '',
                salary_currency: job.salary_currency || 'INR',
                experience_min: job.experience_min ? job.experience_min.toString() : '',
                experience_max: job.experience_max ? job.experience_max.toString() : '',
                education_level: educationLevelArray,
                education_degree: educationDegreeArray,
                education_branch: educationBranchArray,
                skills_required: job.skills_required || [],
                application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().slice(0, 10) : '',
                industry: job.industry || '',
                selection_process: job.selection_process || '',
                campus_drive_date: job.campus_drive_date ? new Date(job.campus_drive_date).toISOString().slice(0, 10) : '',
                status: job.status || 'active',
                // Additional fields
                number_of_openings: job.number_of_openings ? job.number_of_openings.toString() : '',
                perks_and_benefits: job.perks_and_benefits || '',
                eligibility_criteria: job.eligibility_criteria || '',
                service_agreement_details: job.service_agreement_details || '',
                expiration_date: job.expiration_date ? new Date(job.expiration_date).toISOString().slice(0, 10) : '',
                ctc_with_probation: job.ctc_with_probation || '',
                ctc_after_probation: job.ctc_after_probation || ''
            })

        }
    }, [job])


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

    const addLocation = () => {
        if (currentLocation.trim() && !formData.location.includes(currentLocation.trim())) {
            setFormData(prev => ({
                ...prev,
                location: [...prev.location, currentLocation.trim()]
            }))
            setCurrentLocation('')
        }
    }

    const removeLocation = (locationToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            location: prev.location.filter(location => location !== locationToRemove)
        }))
    }

    const handleMultiSelectChange = (field: 'education_degree' | 'education_branch' | 'education_level', value: string) => {
        setFormData(prev => {
            const currentValues = prev[field] as string[]
            if (currentValues.includes(value)) {
                return {
                    ...prev,
                    [field]: currentValues.filter(v => v !== value)
                }
            } else {
                return {
                    ...prev,
                    [field]: [...currentValues, value]
                }
            }
        })
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!formData.title.trim()) errors.title = 'Job title is required'
        if (!formData.description.trim()) errors.description = 'Job description is required'
        if (!formData.job_type) errors.job_type = 'Job type is required'
        if (formData.location.length === 0) errors.location = 'At least one location is required'

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
                location: formData.location.length > 0 ? formData.location.join(', ') : null,
                remote_work: formData.remote_work,
                travel_required: formData.travel_required,
                onsite_office: formData.onsite_office,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                salary_currency: formData.salary_currency,
                experience_min: formData.experience_min ? parseInt(formData.experience_min) : null,
                experience_max: formData.experience_max ? parseInt(formData.experience_max) : null,
                education_level: formData.education_level.length > 0 ? formData.education_level : null,
                education_degree: formData.education_degree.length > 0 ? formData.education_degree : null,
                education_branch: formData.education_branch.length > 0 ? formData.education_branch : null,
                skills_required: formData.skills_required.length > 0 ? formData.skills_required : null,
                application_deadline: formData.application_deadline ? formData.application_deadline : null,
                industry: formData.industry || null,
                selection_process: formData.selection_process || null,
                campus_drive_date: formData.campus_drive_date ? formData.campus_drive_date : null,
                status: formData.status,
                // Additional fields
                number_of_openings: formData.number_of_openings ? parseInt(formData.number_of_openings) : null,
                perks_and_benefits: formData.perks_and_benefits || null,
                eligibility_criteria: formData.eligibility_criteria || null,
                service_agreement_details: formData.service_agreement_details || null,
                expiration_date: formData.expiration_date ? formData.expiration_date : null,
                ctc_with_probation: formData.ctc_with_probation || null,
                ctc_after_probation: formData.ctc_after_probation || null
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
                                        <Select
                                            key={`job-type-${formData.job_type}-${job?.id}`}
                                            value={formData.job_type || undefined}
                                            onValueChange={(value) => {
                                                console.log('Job type changed to:', value)
                                                handleInputChange('job_type', value)
                                            }}
                                        >
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
                                        <div className="flex gap-2">
                                            <Input
                                                value={currentLocation}
                                                onChange={(e) => setCurrentLocation(e.target.value)}
                                                placeholder={validationErrors.location || "Add a location (e.g., Bangalore, Pan India, Mumbai)"}
                                                className={validationErrors.location ? "border-red-500 placeholder-red-500" : ""}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                                            />
                                            <Button type="button" onClick={addLocation} variant="outline">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {validationErrors.location && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>
                                        )}
                                    </div>

                                    {formData.location.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.location.map((location, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                >
                                                    {location}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLocation(location)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Industry
                                        </label>
                                        <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {industryOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
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
                                            placeholder="e.g., 800000"
                                        />
                                    </div>

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
                                            Minimum Experience (years)
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
                                            Maximum Experience (years)
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
                                        <div className="space-y-2">
                                            <Select onValueChange={(value) => handleMultiSelectChange('education_degree', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select degree(s)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {degreeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formData.education_degree.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.education_degree.map((degree, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                                        >
                                                            {degreeOptions.find(opt => opt.value === degree)?.label || degree}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMultiSelectChange('education_degree', degree)}
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Education Branch
                                        </label>
                                        <div className="space-y-2">
                                            <Select onValueChange={(value) => handleMultiSelectChange('education_branch', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select branch(es)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {branchOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formData.education_branch.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.education_branch.map((branch, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                                        >
                                                            {branchOptions.find(opt => opt.value === branch)?.label || branch}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMultiSelectChange('education_branch', branch)}
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

