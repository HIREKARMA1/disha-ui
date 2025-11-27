"use client"

import { useState, useEffect } from 'react'
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
import { useIndustries } from '@/hooks/useLookup'

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
    mode_of_work?: string  // 'onsite', 'remote', or 'hybrid'
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
    // Company information fields (for university-created jobs)
    company_name?: string
    company_logo?: string
    company_website?: string
    company_address?: string
    company_size?: string
    company_type?: string
    company_founded?: number
    company_description?: string
    contact_person?: string
    contact_designation?: string
}

interface EditJobModalProps {
    isOpen: boolean
    onClose: () => void
    onJobUpdated: () => void
    job: Job | null
    isAdmin?: boolean // Add prop to indicate if this is admin context
    isUniversity?: boolean // Add prop to indicate if this is university context
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

export function EditJobModal({ isOpen, onClose, onJobUpdated, job, isAdmin = false, isUniversity = false }: EditJobModalProps) {
    // Fetch industries from backend
    const { data: industriesData, loading: industriesLoading } = useIndustries({ limit: 1000 })
    
    // Convert LookupItem[] to Select format { value, label }
    // Use industry name as both value and label since that's what's stored in jobs
    const industryOptions = industriesData.map(industry => ({
        value: industry.name,
        label: industry.name
    }))
    
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

    // Populate form data when job changes
    useEffect(() => {
        if (job) {
            console.log('🔍 Full job object loaded:', job)

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

            // Determine checkbox states from mode_of_work
            console.log('🔍 Job data for checkbox derivation:', {
                mode_of_work: job.mode_of_work,
                remote_work: job.remote_work,
                travel_required: job.travel_required,
                number_of_openings: job.number_of_openings
            })
            
            // For existing jobs that might not have mode_of_work set, we need to handle the migration
            let isOnsite = false
            let isRemote = job.remote_work || false
            
            if (job.mode_of_work) {
                // New logic: use mode_of_work if available
                isOnsite = job.mode_of_work === 'onsite' || job.mode_of_work === 'hybrid'
                isRemote = job.mode_of_work === 'remote' || job.mode_of_work === 'hybrid' || job.remote_work
            } else {
                // Fallback for existing jobs: if remote_work is false and no mode_of_work, assume onsite
                // This handles the case where jobs were created before mode_of_work was added
                isOnsite = !job.remote_work
                isRemote = job.remote_work || false
            }
            
            console.log('🔍 Derived checkbox states:', {
                isOnsite,
                isRemote,
                travel_required: job.travel_required || false
            })

            // Helper function to normalize select values (trim and ensure they match SelectItem values)
            const normalizeSelectValue = (value: string | null | undefined, options: { value: string }[]): string => {
                if (!value) return ''
                const trimmed = value.trim()
                if (!trimmed) return ''
                // Check if the trimmed value matches any option value (case-insensitive)
                const matchedOption = options.find(opt => opt.value.toLowerCase() === trimmed.toLowerCase())
                if (matchedOption) {
                    console.log(`✅ Normalized "${trimmed}" to "${matchedOption.value}"`)
                    return matchedOption.value
                }
                console.warn(`⚠️ Value "${trimmed}" does not match any option. Available options:`, options.map(o => o.value))
                return trimmed // Return original if no match found
            }

            // Log company information fields for debugging
            console.log('🔍 Company Information Fields from Job:', {
                industry: job.industry,
                industry_type: typeof job.industry,
                industry_is_null: job.industry === null,
                industry_is_undefined: job.industry === undefined,
                company_size: job.company_size,
                company_type: job.company_type,
                company_name: job.company_name,
                company_website: job.company_website,
                company_address: job.company_address,
                company_founded: job.company_founded,
                company_description: job.company_description,
                contact_person: job.contact_person,
                contact_designation: job.contact_designation,
                full_job_object_keys: Object.keys(job)
            })

            // Normalize select values to match SelectItem values exactly
            // Only normalize if industries are loaded, otherwise use the job value as-is
            console.log('🔍 Before Normalization - job.industry:', job.industry, 'Type:', typeof job.industry, 'Industries loaded:', industryOptions.length)
            const normalizedIndustry = industryOptions.length > 0 
                ? normalizeSelectValue(job.industry, industryOptions)
                : (job.industry || '')
            console.log('🔍 After Normalization - normalizedIndustry:', normalizedIndustry)
            const normalizedCompanySize = normalizeSelectValue(job.company_size, [
                { value: '1-10' },
                { value: '11-50' },
                { value: '51-200' },
                { value: '201-500' },
                { value: '501-1000' },
                { value: '1001-5000' },
                { value: '5001-10000' },
                { value: '10000+' }
            ])
            const normalizedCompanyType = normalizeSelectValue(job.company_type, [
                { value: 'Startup' },
                { value: 'Small Business' },
                { value: 'Medium Enterprise' },
                { value: 'Large Enterprise' },
                { value: 'Multinational' },
                { value: 'Non-Profit' },
                { value: 'Government' }
            ])

            console.log('🔍 Normalized Values:', {
                original_industry: job.industry,
                normalized_industry: normalizedIndustry,
                original_company_size: job.company_size,
                normalized_company_size: normalizedCompanySize,
                original_company_type: job.company_type,
                normalized_company_type: normalizedCompanyType
            })

            console.log('🔍 Setting formData with normalizedIndustry:', normalizedIndustry)
            setFormData({
                title: job.title || '',
                description: job.description || '',
                requirements: job.requirements || '',
                responsibilities: job.responsibilities || '',
                job_type: job.job_type || '',
                location: locationArray,
                remote_work: isRemote,
                travel_required: job.travel_required || false,
                onsite_office: isOnsite,
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
                industry: normalizedIndustry || (job.industry || ''),
                selection_process: job.selection_process || '',
                campus_drive_date: job.campus_drive_date ? new Date(job.campus_drive_date).toISOString().slice(0, 10) : '',
                status: job.status || 'active',
                // Additional fields
                number_of_openings: job.number_of_openings !== null && job.number_of_openings !== undefined ? job.number_of_openings.toString() : '',
                perks_and_benefits: job.perks_and_benefits || '',
                eligibility_criteria: job.eligibility_criteria || '',
                service_agreement_details: job.service_agreement_details || '',
                expiration_date: job.expiration_date ? new Date(job.expiration_date).toISOString().slice(0, 10) : '',
                ctc_with_probation: job.ctc_with_probation || '',
                ctc_after_probation: job.ctc_after_probation || '',
                // Company information fields (for university-created jobs)
                company_name: (job.company_name && job.company_name.trim()) || '',
                company_logo: job.company_logo || '',
                company_website: (job.company_website && job.company_website.trim()) || '',
                company_address: (job.company_address && job.company_address.trim()) || '',
                company_size: normalizedCompanySize,
                company_type: normalizedCompanyType,
                company_founded: job.company_founded ? job.company_founded.toString() : '',
                company_description: job.company_description || '',
                contact_person: (job.contact_person && job.contact_person.trim()) || '',
                contact_designation: (job.contact_designation && job.contact_designation.trim()) || ''
            })
            
            // Log the form data after setting to verify values
            console.log('🔍 Form Data After Setting:', {
                industry: normalizedIndustry,
                company_size: normalizedCompanySize,
                company_type: normalizedCompanyType
            })
            
            // Set logo preview if logo exists
            if (job.company_logo) {
                setLogoPreview(job.company_logo)
            } else {
                setLogoPreview(null)
            }

        }
    }, [job, industryOptions.length]) // Re-run when job changes or industries are loaded

    // Debug: Log formData changes for industry, company_size, and company_type
    useEffect(() => {
        console.log('🔍 FormData Industry/Size/Type Changed:', {
            industry: formData.industry,
            company_size: formData.company_size,
            company_type: formData.company_type,
            jobId: job?.id
        })
    }, [formData.industry, formData.company_size, formData.company_type, job?.id])

    const handleInputChange = (field: keyof JobFormData, value: string | boolean | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Log number of openings changes specifically
        if (field === 'number_of_openings') {
            console.log('🔢 Number of Openings Changed:', {
                field,
                oldValue: formData[field],
                newValue: value,
                jobId: job?.id,
                timestamp: new Date().toISOString()
            })
        }
        
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
            if (isUniversity) {
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
        
        // Validate company information for university-created jobs
        if (isUniversity && !formData.company_name.trim()) {
            errors.company_name = 'Company name is required'
        }
        
        // Validate website URL format if provided
        if (formData.company_website && formData.company_website.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
            if (!urlPattern.test(formData.company_website)) {
                errors.company_website = 'Please enter a valid URL (e.g., https://www.example.com)'
            }
        }
        
        // Validate number_of_openings if provided
        if (formData.number_of_openings && formData.number_of_openings.trim() !== '') {
            const numOpenings = parseInt(formData.number_of_openings)
            if (isNaN(numOpenings) || numOpenings < 1) {
                errors.number_of_openings = 'Number of openings must be a positive integer'
            }
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
            // Determine mode_of_work based on checkbox states
            console.log('🔍 Form data checkboxes before submit:', {
                onsite_office: formData.onsite_office,
                remote_work: formData.remote_work,
                travel_required: formData.travel_required,
                number_of_openings: formData.number_of_openings
            })
            
            let modeOfWork = null
            if (formData.onsite_office && formData.remote_work) {
                modeOfWork = 'hybrid'
            } else if (formData.onsite_office) {
                modeOfWork = 'onsite'
            } else if (formData.remote_work) {
                modeOfWork = 'remote'
            }
            
            console.log('🔍 Derived mode_of_work for submit:', modeOfWork)

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
                education_degree: formData.education_degree.length > 0 ? formData.education_degree : null,
                education_branch: formData.education_branch.length > 0 ? formData.education_branch : null,
                skills_required: formData.skills_required.length > 0 ? formData.skills_required : null,
                application_deadline: formData.application_deadline ? formData.application_deadline : null,
                industry: formData.industry || null,
                selection_process: formData.selection_process || null,
                campus_drive_date: formData.campus_drive_date ? formData.campus_drive_date : null,
                status: formData.status,
                // Additional fields
                number_of_openings: formData.number_of_openings && formData.number_of_openings.trim() !== '' ? parseInt(formData.number_of_openings) : null,
                perks_and_benefits: formData.perks_and_benefits || null,
                eligibility_criteria: formData.eligibility_criteria || null,
                service_agreement_details: formData.service_agreement_details || null,
                expiration_date: formData.expiration_date ? formData.expiration_date : null,
                ctc_with_probation: formData.ctc_with_probation || null,
                ctc_after_probation: formData.ctc_after_probation || null,
                // Company information fields (for university-created jobs)
                company_name: isUniversity ? (formData.company_name || null) : null,
                company_logo: isUniversity ? (formData.company_logo || null) : null,
                company_website: isUniversity ? (formData.company_website || null) : null,
                company_address: isUniversity ? (formData.company_address || null) : null,
                company_size: isUniversity ? (formData.company_size || null) : null,
                company_type: isUniversity ? (formData.company_type || null) : null,
                company_founded: isUniversity && formData.company_founded ? parseInt(formData.company_founded) : null,
                company_description: isUniversity ? (formData.company_description || null) : null,
                contact_person: isUniversity ? (formData.contact_person || null) : null,
                contact_designation: isUniversity ? (formData.contact_designation || null) : null
            }

            // Log the job update request with focus on number_of_openings
            console.log('📝 Job Update Request:', {
                jobId: job.id,
                isAdmin: isAdmin,
                isUniversity: isUniversity,
                number_of_openings: {
                    formValue: formData.number_of_openings,
                    parsedValue: jobData.number_of_openings,
                    originalValue: job.number_of_openings
                },
                timestamp: new Date().toISOString(),
                fullJobData: jobData
            })


            let response
            if (isAdmin) {
                response = await apiClient.updateJobAdmin(job.id, jobData)
            } else if (isUniversity) {
                response = await apiClient.updateJobUniversity(job.id, jobData)
            } else {
                response = await apiClient.updateJob(job.id, jobData)
            }
            
            // Log successful update response
            console.log('✅ Job Update Success:', {
                jobId: job.id,
                isAdmin: isAdmin,
                isUniversity: isUniversity,
                response: response,
                number_of_openings: {
                    requested: jobData.number_of_openings,
                    returned: response?.number_of_openings
                },
                timestamp: new Date().toISOString()
            })
            
            toast.success('Job updated successfully!')
            onJobUpdated()
            onClose()
        } catch (error: any) {
            // Log detailed error information
            console.error('❌ Job Update Failed:', {
                jobId: job.id,
                isAdmin: isAdmin,
                isUniversity: isUniversity,
                error: error,
                errorMessage: error.message,
                errorResponse: error.response?.data,
                errorStatus: error.response?.status,
                number_of_openings: {
                    requested: formData.number_of_openings ? parseInt(formData.number_of_openings) : null,
                    formValue: formData.number_of_openings
                },
                timestamp: new Date().toISOString()
            })
            
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

                            {/* Company Information Section - Only for University */}
                            {isUniversity && (
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
                                            {(() => {
                                                const industryValue = formData.industry && formData.industry.trim() ? formData.industry : undefined
                                                const hasMatch = industryValue && industryOptions.some(opt => opt.value === industryValue)
                                                console.log('🎯 Industry Select Render:', {
                                                    formData_industry: formData.industry,
                                                    industryValue,
                                                    hasMatch,
                                                    industriesLoading,
                                                    industriesCount: industryOptions.length,
                                                    availableOptions: industryOptions.map(o => o.value).slice(0, 5)
                                                })
                                                
                                                if (industriesLoading) {
                                                    return (
                                                        <Select disabled>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Loading industries..." />
                                                            </SelectTrigger>
                                                        </Select>
                                                    )
                                                }
                                                
                                                return (
                                                    <Select 
                                                        key={`industry-${job?.id || 'new'}-${industryValue || 'empty'}`}
                                                        value={industryValue} 
                                                        onValueChange={(value) => handleInputChange('industry', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select industry" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {industryOptions.length > 0 ? (
                                                                industryOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="" disabled>No industries available</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )
                                            })()}
          
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
                                            <Select 
                                                key={`company_size-${job?.id || 'new'}-${formData.company_size || ''}`}
                                                value={formData.company_size || ''} 
                                                onValueChange={(value) => handleInputChange('company_size', value)}
                                            >
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
                                            <Select 
                                                key={`company_type-${job?.id || 'new'}-${formData.company_type || ''}`}
                                                value={formData.company_type || ''} 
                                                onValueChange={(value) => handleInputChange('company_type', value)}
                                            >
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
                                            min="0"
                                            value={formData.salary_min}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                                    handleInputChange('salary_min', value);
                                                }
                                            }}
                                            placeholder="e.g., 500000"
                                            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Maximum Salary
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.salary_max}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                                                    handleInputChange('salary_max', value);
                                                }
                                            }}
                                            placeholder="e.g., 800000"
                                            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
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
                                            min="0"
                                            value={formData.experience_min}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                                                    handleInputChange('experience_min', value);
                                                }
                                            }}
                                            placeholder="e.g., 2"
                                            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Maximum Experience (years)
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.experience_max}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                                                    handleInputChange('experience_max', value);
                                                }
                                            }}
                                            placeholder="e.g., 5"
                                            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
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
                                            className={validationErrors.number_of_openings ? "border-red-500 placeholder-red-500" : ""}
                                        />
                                        {validationErrors.number_of_openings && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.number_of_openings}</p>
                                        )}
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

