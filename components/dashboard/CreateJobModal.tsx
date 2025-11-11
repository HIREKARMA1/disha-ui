"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Calendar, MapPin, DollarSign, Users, Briefcase, Clock, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { FileUpload } from '@/components/ui/file-upload'
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
    // Company information fields (for university-created jobs)
    company_name: string
    company_logo: string
    company_website: string
    company_address: string
    company_size: string
    company_type: string
    company_founded: string
    company_description: string
    contact_person: string
    contact_designation: string
}

export function CreateJobModal({ isOpen, onClose, onJobCreated, userType = 'corporate' }: CreateJobModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [currentSkill, setCurrentSkill] = useState('')
    const [currentLocation, setCurrentLocation] = useState('')
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
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
        ctc_after_probation: '',
        // Company information fields (for university-created jobs)
        company_name: '',
        company_logo: '',
        company_website: '',
        company_address: '',
        company_size: '',
        company_type: '',
        company_founded: '',
        company_description: '',
        contact_person: '',
        contact_designation: ''
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

    const handleLogoUpload = async (file: File) => {
        setUploadingLogo(true)
        try {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB')
                setUploadingLogo(false)
                return
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                setUploadingLogo(false)
                return
            }

            // Upload the file - use company logo endpoint for university users, regular image upload for others
            let result
            if (userType === 'university') {
                // University users: upload to corporate folder structure
                result = await apiClient.uploadCompanyLogo(file)
            } else {
                // Corporate users: use regular image upload (though they shouldn't be using this for company logos)
                result = await apiClient.uploadImage(file)
            }
            
            // Update form data with the uploaded logo URL
            handleInputChange('company_logo', result.file_url)
            
            // Create preview URL for display
            const previewUrl = URL.createObjectURL(file)
            setLogoPreview(previewUrl)
            
            toast.success('Company logo uploaded successfully!')
        } catch (error: any) {
            console.error('Logo upload error:', error)
            toast.error(error.response?.data?.detail || 'Failed to upload logo. Please try again.')
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleLogoRemove = () => {
        handleInputChange('company_logo', '')
        setLogoPreview(null)
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview)
        }
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

        // Validate company information fields for university-created jobs
        if (userType === 'university') {
            if (!formData.company_name.trim()) {
                errors.company_name = 'Company name is required'
            }
            if (formData.company_website && formData.company_website.trim()) {
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
                if (!urlPattern.test(formData.company_website.trim())) {
                    errors.company_website = 'Please enter a valid website URL'
                }
            }
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
            const jobData: any = {
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

            // Add company information fields for university-created jobs
            if (userType === 'university') {
                jobData.company_name = formData.company_name.trim() || null
                jobData.company_logo = formData.company_logo.trim() || null
                jobData.company_website = formData.company_website.trim() || null
                jobData.company_address = formData.company_address.trim() || null
                jobData.company_size = formData.company_size.trim() || null
                jobData.company_type = formData.company_type.trim() || null
                jobData.company_founded = formData.company_founded ? parseInt(formData.company_founded) : null
                jobData.company_description = formData.company_description.trim() || null
                jobData.contact_person = formData.contact_person.trim() || null
                jobData.contact_designation = formData.contact_designation.trim() || null
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
                ctc_after_probation: '',
                // Company information fields (for university-created jobs)
                company_name: '',
                company_logo: '',
                company_website: '',
                company_address: '',
                company_size: '',
                company_type: '',
                company_founded: '',
                company_description: '',
                contact_person: '',
                contact_designation: ''
            })
            // Reset logo preview
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview)
            }
            setLogoPreview(null)
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

                            {/* Company Information Section - Only for University */}
                            {userType === 'university' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Company Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Name *
                                            </label>
                                            <Input
                                                value={formData.company_name}
                                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                                                placeholder={validationErrors.company_name || "e.g., TechCorp Inc."}
                                                className={validationErrors.company_name ? "border-red-500 placeholder-red-500" : ""}
                                            />
                                            {validationErrors.company_name && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.company_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Logo
                                            </label>
                                            <FileUpload
                                                onFileSelect={handleLogoUpload}
                                                onFileRemove={handleLogoRemove}
                                                currentFile={formData.company_logo || logoPreview || null}
                                                type="image"
                                                maxSize={5}
                                                disabled={uploadingLogo}
                                                placeholder="Upload company logo"
                                                className="w-full"
                                            />
                                            {uploadingLogo && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                    Uploading logo...
                                                </p>
                                            )}
                                        </div>
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Founded Year
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.company_founded}
                                                onChange={(e) => handleInputChange('company_founded', e.target.value)}
                                                placeholder="e.g., 2000"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Website
                                        </label>
                                        <Input
                                            value={formData.company_website}
                                            onChange={(e) => handleInputChange('company_website', e.target.value)}
                                            placeholder={validationErrors.company_website || "https://www.example.com"}
                                            className={validationErrors.company_website ? "border-red-500 placeholder-red-500" : ""}
                                        />
                                        {validationErrors.company_website && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.company_website}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Address
                                        </label>
                                        <Input
                                            value={formData.company_address}
                                            onChange={(e) => handleInputChange('company_address', e.target.value)}
                                            placeholder="e.g., 123 Main St, City, State, ZIP"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Size
                                            </label>
                                            <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select company size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1-10">1-10</SelectItem>
                                                    <SelectItem value="11-50">11-50</SelectItem>
                                                    <SelectItem value="51-200">51-200</SelectItem>
                                                    <SelectItem value="201-500">201-500</SelectItem>
                                                    <SelectItem value="501-1000">501-1000</SelectItem>
                                                    <SelectItem value="1001-5000">1001-5000</SelectItem>
                                                    <SelectItem value="5001-10000">5001-10000</SelectItem>
                                                    <SelectItem value="10000+">10000+</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Type
                                            </label>
                                            <Select value={formData.company_type} onValueChange={(value) => handleInputChange('company_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select company type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Startup">Startup</SelectItem>
                                                    <SelectItem value="Small Business">Small Business</SelectItem>
                                                    <SelectItem value="Medium Enterprise">Medium Enterprise</SelectItem>
                                                    <SelectItem value="Large Enterprise">Large Enterprise</SelectItem>
                                                    <SelectItem value="Multinational">Multinational</SelectItem>
                                                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                                                    <SelectItem value="Government">Government</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            About Company
                                        </label>
                                        <Textarea
                                            value={formData.company_description}
                                            onChange={(e) => handleInputChange('company_description', e.target.value)}
                                            placeholder="Describe the company, its mission, values, and what makes it special..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Contact Person
                                            </label>
                                            <Input
                                                value={formData.contact_person}
                                                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                                placeholder="e.g., John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Designation
                                            </label>
                                            <Input
                                                value={formData.contact_designation}
                                                onChange={(e) => handleInputChange('contact_designation', e.target.value)}
                                                placeholder="e.g., HR Manager"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

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
