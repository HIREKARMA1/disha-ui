"use client"

import { useState, useEffect, useRef } from 'react'
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
import { lookupService } from '@/services/lookupService'
import { toast } from 'react-hot-toast'

// Note: All lookup options (Industries, Degrees, Branches, Skills, Location Preferences) 
// are now fetched from backend using respective hooks

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
    skills_required?: string[] | string
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
const parseEducationField = (field: string | string[] | null | undefined): string[] => {
    // Handle null/undefined
    if (!field) return []
    
    // Handle array case - backend splits comma-separated strings into arrays
    if (Array.isArray(field)) {
        return field.map(item => {
            if (typeof item === 'string') {
                // Clean JSON strings and trim whitespace
                const cleaned = cleanJsonString(item).trim()
                return cleaned
            }
            return String(item).trim()
        }).filter(item => item.length > 0) // Remove empty strings
    }
    
    // Handle string case
    if (typeof field === 'string' && field.trim()) {
        const cleaned = cleanJsonString(field)
        
        // Try to parse as JSON first (in case it's a JSON stringified array)
        try {
            const parsed = JSON.parse(cleaned)
            if (Array.isArray(parsed)) {
                return parsed.map(item => String(item).trim()).filter(item => item.length > 0)
            }
        } catch {
            // Not JSON, continue with comma splitting
        }
        
        // Split by comma and clean each item
        return cleaned.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    return []
}

// Helper function to normalize values to match option values
const normalizeToOptions = (values: string[], options: Array<{ value: string; label: string }>): string[] => {
    if (!values || values.length === 0) return []
    if (!options || options.length === 0) return values // Return as-is if options not loaded yet
    
    return values.map(val => {
        // Try exact match first
        const exactMatch = options.find(opt => opt.value === val || opt.label === val)
        if (exactMatch) return exactMatch.value
        
        // Try case-insensitive match
        const caseInsensitiveMatch = options.find(opt => 
            opt.value.toLowerCase().trim() === val.toLowerCase().trim() ||
            opt.label.toLowerCase().trim() === val.toLowerCase().trim()
        )
        if (caseInsensitiveMatch) return caseInsensitiveMatch.value
        
        // If no match found, return original value (custom value)
        return val.trim()
    }).filter(val => val.length > 0)
}

export function EditJobModal({ isOpen, onClose, onJobUpdated, job, isAdmin = false, isUniversity = false }: EditJobModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    
    // Track if we've cleared cache for this modal opening to prevent infinite loops
    const hasClearedCacheRef = useRef(false)
    
    // Fetch degrees, branches, and other lookup data from backend API
    const { data: degreesData, loading: loadingDegrees, refetch: refetchDegrees } = useDegrees({ limit: 1000 })
    const { data: branchesData, loading: loadingBranches, refetch: refetchBranches } = useBranches({ limit: 1000 })
    const { data: industriesData, loading: loadingIndustries, refetch: refetchIndustries } = useIndustries({ limit: 1000 })
    const { data: locationPreferencesData, loading: loadingLocations, refetch: refetchLocations } = useLocationPreferences({ limit: 1000 })
    const { data: skillsData, loading: loadingSkills, refetch: refetchSkills } = useSkills({ limit: 1000 })
    
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

    // Refetch lookup data when modal opens to ensure latest data (only once per modal opening)
    useEffect(() => {
        if (isOpen && !hasClearedCacheRef.current) {
            // Clear cache and refetch to get latest lookup data
            lookupService.clearCache('/admin/lookups/degrees')
            lookupService.clearCache('/admin/lookups/branches')
            lookupService.clearCache('/admin/lookups/industries')
            lookupService.clearCache('/admin/lookups/location-preferences')
            lookupService.clearCache('/admin/lookups/skills')
            
            // Refetch all lookup data
            refetchDegrees().catch(() => {})
            refetchBranches().catch(() => {})
            refetchIndustries().catch(() => {})
            refetchLocations().catch(() => {})
            refetchSkills().catch(() => {})
            
            hasClearedCacheRef.current = true
        } else if (!isOpen) {
            // Reset flag when modal closes
            hasClearedCacheRef.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    // Populate form data when job changes
    useEffect(() => {
        console.log('🔵 EditJobModal useEffect triggered - job changed:', {
            jobId: job?.id,
            hasJob: !!job,
            jobKeys: job ? Object.keys(job) : [],
            education_degree: job?.education_degree,
            education_branch: job?.education_branch
        })
        
        if (job) {
            console.log('🔍 Full job object loaded:', job)

            // Handle location - could be string or array
            const locationArray = Array.isArray(job.location) ? job.location : 
                                 (typeof job.location === 'string' && job.location.trim()) ? 
                                 job.location.split(',').map(l => l.trim()).filter(l => l.length > 0) : []
            
            // Handle skills - use the same safe parsing function as education fields
            let skillsArray: string[] = []
            if (Array.isArray(job.skills_required)) {
                skillsArray = job.skills_required.map(item => {
                    if (typeof item === 'string') {
                        return cleanJsonString(item).trim()
                    }
                    return String(item).trim()
                }).filter(item => item.length > 0)
            } else if (job.skills_required && typeof job.skills_required === 'string') {
                const skillsStr = job.skills_required as string
                const cleaned = cleanJsonString(skillsStr)
                
                // Try to parse as JSON first (in case it's a JSON stringified array)
                try {
                    const parsed = JSON.parse(cleaned)
                    if (Array.isArray(parsed)) {
                        skillsArray = parsed.map(item => String(item).trim()).filter(item => item.length > 0)
                    } else {
                        // Not an array, treat as single skill
                        skillsArray = cleaned.trim() ? [cleaned.trim()] : []
                    }
                } catch {
                    // Not JSON, split by comma and clean each item
                    skillsArray = cleaned.split(',').map(item => item.trim()).filter(item => item.length > 0)
                }
            }
            
            console.log('🔍 Skills field before parsing:', {
                original: job.skills_required,
                type: typeof job.skills_required,
                isArray: Array.isArray(job.skills_required)
            })
            
            console.log('🔍 Skills field after parsing:', {
                skillsArray
            })
            
            // Handle education fields - use the safe parsing function
            console.log('🔍 Education fields BEFORE parsing:', {
                education_level: job.education_level,
                education_degree: job.education_degree,
                education_branch: job.education_branch,
                education_level_type: typeof job.education_level,
                education_degree_type: typeof job.education_degree,
                education_branch_type: typeof job.education_branch,
                education_level_isArray: Array.isArray(job.education_level),
                education_degree_isArray: Array.isArray(job.education_degree),
                education_branch_isArray: Array.isArray(job.education_branch),
                education_level_isNull: job.education_level === null,
                education_degree_isNull: job.education_degree === null,
                education_branch_isNull: job.education_branch === null,
                education_level_isUndefined: job.education_level === undefined,
                education_degree_isUndefined: job.education_degree === undefined,
                education_branch_isUndefined: job.education_branch === undefined
            })
            
            // IMPORTANT: Handle undefined/null values - API might return undefined instead of null or []
            const educationLevelArray = parseEducationField(job.education_level ?? null)
            let educationDegreeArray = parseEducationField(job.education_degree ?? null)
            let educationBranchArray = parseEducationField(job.education_branch ?? null)
            
            console.log('🔍 Education fields AFTER parsing (before normalization):', {
                educationLevelArray,
                educationDegreeArray,
                educationBranchArray,
                degreeOptionsLoaded: degreeOptions.length > 0,
                branchOptionsLoaded: branchOptions.length > 0,
                degreeOptionsSample: degreeOptions.slice(0, 3).map(opt => opt.value),
                branchOptionsSample: branchOptions.slice(0, 3).map(opt => opt.value)
            })
            
            // Normalize education degree and branch arrays to match available options
            // This ensures selected values match the option values exactly
            // Only normalize if options are already loaded
            if (degreeOptions.length > 0 && educationDegreeArray.length > 0) {
                const beforeNormalize = [...educationDegreeArray]
                educationDegreeArray = normalizeToOptions(educationDegreeArray, degreeOptions)
                console.log('🔍 Education Degree normalization:', {
                    before: beforeNormalize,
                    after: educationDegreeArray,
                    changed: JSON.stringify(beforeNormalize) !== JSON.stringify(educationDegreeArray)
                })
            }
            if (branchOptions.length > 0 && educationBranchArray.length > 0) {
                const beforeNormalize = [...educationBranchArray]
                educationBranchArray = normalizeToOptions(educationBranchArray, branchOptions)
                console.log('🔍 Education Branch normalization:', {
                    before: beforeNormalize,
                    after: educationBranchArray,
                    changed: JSON.stringify(beforeNormalize) !== JSON.stringify(educationBranchArray)
                })
            }
            
            console.log('🔍 Education fields FINAL (after normalization):', {
                educationLevelArray,
                educationDegreeArray,
                educationBranchArray,
                degreeOptionsCount: degreeOptions.length,
                branchOptionsCount: branchOptions.length
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
                skills_required: skillsArray,
                application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().slice(0, 10) : '',
                industry: job.industry || '',
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
                ctc_after_probation: job.ctc_after_probation || ''
            })

            console.log('✅ FormData SET with education fields:', {
                education_degree: educationDegreeArray,
                education_branch: educationBranchArray,
                education_degree_length: educationDegreeArray.length,
                education_branch_length: educationBranchArray.length,
                education_degree_in_formData: educationDegreeArray,
                education_branch_in_formData: educationBranchArray
            })
            
            // CRITICAL DEBUG: Log what will be set in formData
            console.log('🔍 About to set formData with:', {
                'education_degree array': educationDegreeArray,
                'education_branch array': educationBranchArray,
                'education_degree type': typeof educationDegreeArray,
                'education_branch type': typeof educationBranchArray,
                'education_degree isArray': Array.isArray(educationDegreeArray),
                'education_branch isArray': Array.isArray(educationBranchArray)
            })
            
            // WARNING: If arrays are empty, log a warning
            if (educationDegreeArray.length === 0 && educationBranchArray.length === 0) {
                console.warn('⚠️ WARNING: Both education_degree and education_branch are empty arrays!', {
                    'Original job.education_degree': job.education_degree,
                    'Original job.education_branch': job.education_branch,
                    'Parsed educationDegreeArray': educationDegreeArray,
                    'Parsed educationBranchArray': educationBranchArray,
                    'Note': 'This means the job does not have education data stored in the database.'
                })
            }

        }
    }, [job])

    // Re-normalize education fields when options become available
    // This ensures values match options even if options load after job data
    useEffect(() => {
        if (!job || !degreeOptions.length || !branchOptions.length) return
        
        setFormData(prev => {
            // Only normalize if we have values to normalize
            const hasDegreesToNormalize = prev.education_degree.length > 0
            const hasBranchesToNormalize = prev.education_branch.length > 0
            
            if (!hasDegreesToNormalize && !hasBranchesToNormalize) {
                return prev // No changes needed
            }
            
            const normalizedDegrees = hasDegreesToNormalize 
                ? normalizeToOptions(prev.education_degree, degreeOptions)
                : prev.education_degree
                
            const normalizedBranches = hasBranchesToNormalize
                ? normalizeToOptions(prev.education_branch, branchOptions)
                : prev.education_branch
            
            // Only update if values actually changed
            const degreesChanged = JSON.stringify(normalizedDegrees) !== JSON.stringify(prev.education_degree)
            const branchesChanged = JSON.stringify(normalizedBranches) !== JSON.stringify(prev.education_branch)
            
            if (degreesChanged || branchesChanged) {
                return {
                    ...prev,
                    education_degree: normalizedDegrees,
                    education_branch: normalizedBranches
                }
            }
            
            return prev
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [degreeOptions.length, branchOptions.length, job?.id]) // Re-run when options load or job changes


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

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!formData.title.trim()) errors.title = 'Job title is required'
        if (!formData.description.trim()) errors.description = 'Job description is required'
        if (!formData.job_type) errors.job_type = 'Job type is required'
        if (formData.location.length === 0) errors.location = 'At least one location is required'
        
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
                ctc_after_probation: formData.ctc_after_probation || null
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
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                                    >
                                                        {locationOptions.find(opt => opt.value === location)?.label || location}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newLocations = formData.location.filter(l => l !== location)
                                                                handleLocationChange(newLocations)
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
                                                    onClick={() => {
                                                        const newSkills = formData.skills_required.filter(s => s !== skill)
                                                        handleSkillsChange(newSkills)
                                                    }}
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

