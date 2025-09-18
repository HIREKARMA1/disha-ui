"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Briefcase, Clock, DollarSign, Users, Building, Eye, FileText, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { JobCard } from '@/components/dashboard/JobCard'
import { JobDescriptionModal } from '@/components/dashboard/JobDescriptionModal'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'

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
    application_status?: string
}

interface JobSearchResponse {
    jobs: Job[]
    total_count: number
    page: number
    limit: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

// Narrow, explicit types for params and application payloads
interface JobSearchParams {
    page?: number
    limit?: number
    title?: string
    skills?: string[]
    location?: string
    industry?: string
    job_type?: string
    experience_min?: string | number
    experience_max?: string | number
    salary_min?: string | number
    salary_max?: string | number
    remote_work?: string | boolean
    date_posted?: string
}

interface ApplicationData {
    cover_letter?: string
    expected_salary?: number | null
    availability_date?: string | null
}

function JobOpportunitiesPageContent() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        location: '',
        industry: '',
        job_type: '',
        experience_min: '',
        experience_max: '',
        salary_min: '',
        salary_max: '',
        remote_work: '',
        date_posted: ''
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9, // Changed from 12 to 9 cards per page
        total: 0,
        total_pages: 0
    })
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set())
    const [applicationStatus, setApplicationStatus] = useState<Map<string, string>>(new Map()) // Track application status
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [currentApplicationJob, setCurrentApplicationJob] = useState<Job | null>(null)
    const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'open' | 'closed'>('open') // New filter for job status

    // Fetch jobs from API
    const fetchJobs = async (
        page: number = 1,
        searchParams: JobSearchParams = {},
        useClientSideSearch: boolean = false
    ): Promise<void> => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', String(pagination.limit))
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') return
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, String(v)))
                } else {
                    params.set(key, String(value))
                }
            })

            const response = await apiClient.client.get(`/jobs/?${params}`)
            const data: JobSearchResponse = response.data

            console.log('Raw API response:', data) // Debug log

            // Immediate check for validation errors in the response
            const hasValidationErrors = (obj: any): boolean => {
                if (!obj || typeof obj !== 'object') return false
                if (Array.isArray(obj)) {
                    return obj.some(hasValidationErrors)
                }

                // Check if this is a validation error object
                if ('type' in obj && 'loc' in obj && 'msg' in obj) {
                    console.error('CRITICAL: Validation error object found in API response:', obj)
                    return true
                }

                // Recursively check all properties
                for (const [key, value] of Object.entries(obj)) {
                    if (hasValidationErrors(value)) {
                        return true
                    }
                }
                return false
            }

            if (hasValidationErrors(data)) {
                console.error('CRITICAL: API response contains validation errors. Blocking data processing.')
                toast.error('Server returned invalid data. Please try again or contact support.')
                setJobs([])
                setPagination({
                    page: 1,
                    limit: 9,
                    total: 0,
                    total_pages: 0
                })
                setLoading(false)
                return
            }

            // Check for validation error objects in the response
            if (data.jobs && Array.isArray(data.jobs)) {
                data.jobs.forEach((job, index) => {
                    if (job && typeof job === 'object') {
                        Object.entries(job).forEach(([key, value]) => {
                            if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                                console.error(`Validation error object found in job ${index}, field ${key}:`, value)
                            }
                        })
                    }
                })
            }

            // Deep clean the data to remove any validation error objects
            const deepCleanObject = (obj: any): any => {
                if (obj === null || obj === undefined) return obj
                if (typeof obj !== 'object') return obj
                if (Array.isArray(obj)) return obj.map(deepCleanObject)

                // Check if this is a validation error object
                if ('type' in obj && 'loc' in obj && 'msg' in obj) {
                    console.error('Deep cleaning: Found validation error object:', obj)
                    return null
                }

                const cleaned: any = {}
                for (const [key, value] of Object.entries(obj)) {
                    if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                        console.error(`Deep cleaning: Found validation error object in field ${key}:`, value)
                        cleaned[key] = null // Replace with null
                    } else if (value && typeof value === 'object') {
                        cleaned[key] = deepCleanObject(value)
                    } else {
                        cleaned[key] = value
                    }
                }
                return cleaned
            }

            // More aggressive cleaning - remove entire jobs that contain validation errors
            const aggressiveCleanJobs = (jobs: any[]): any[] => {
                return jobs.filter(job => {
                    if (!job || typeof job !== 'object') return false

                    // Check if any field contains validation error objects
                    for (const [key, value] of Object.entries(job)) {
                        if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                            console.error(`Aggressive cleaning: Removing job with validation error in field ${key}:`, value)
                            return false // Remove this entire job
                        }
                    }
                    return true
                })
            }

            // Deep clean the entire response
            const cleanedData = deepCleanObject(data)
            console.log('Deep cleaned data:', cleanedData)

            // Apply aggressive cleaning to jobs
            if (cleanedData.jobs && Array.isArray(cleanedData.jobs)) {
                cleanedData.jobs = aggressiveCleanJobs(cleanedData.jobs)
                console.log('Aggressively cleaned jobs:', cleanedData.jobs)
            }

            // Validate and clean job data to prevent runtime errors
            let validatedJobs: any[] = []
            try {
                validatedJobs = (cleanedData.jobs || []).map((job: any) => {
                    // Log any problematic data for debugging
                    if (typeof job === 'object' && job !== null) {
                        Object.entries(job).forEach(([key, value]) => {
                            if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                                console.warn(`Warning: Job ${job.id} has object value for ${key}:`, value)

                                // Check if this is a validation error object
                                if ('type' in value && 'loc' in value && 'msg' in value) {
                                    console.error(`Validation error object detected in job ${job.id}, field ${key}:`, value)
                                    // Remove this field to prevent rendering issues
                                    delete job[key]
                                }
                            }
                        })
                    }

                    return {
                        ...job,
                        title: String(job.title || ''),
                        description: String(job.description || ''),
                        requirements: job.requirements ? String(job.requirements) : undefined,
                        responsibilities: job.responsibilities ? String(job.responsibilities) : undefined,
                        job_type: String(job.job_type || ''),
                        status: String(job.status || ''),
                        location: String(job.location || ''),
                        remote_work: Boolean(job.remote_work),
                        travel_required: Boolean(job.travel_required),
                        salary_min: job.salary_min ? Number(job.salary_min) : undefined,
                        salary_max: job.salary_max ? Number(job.salary_max) : undefined,
                        salary_currency: String(job.salary_currency || 'INR'),
                        experience_min: job.experience_min ? Number(job.experience_min) : undefined,
                        experience_max: job.experience_max ? Number(job.experience_max) : undefined,
                        education_level: job.education_level ? String(job.education_level) : undefined,
                        skills_required: Array.isArray(job.skills_required) ? job.skills_required.map((skill: any) => {
                            if (typeof skill === 'object' && skill !== null) {
                                console.warn(`Warning: Skill is an object:`, skill)
                                return String(skill)
                            }
                            return String(skill)
                        }) : [],
                        application_deadline: job.application_deadline ? String(job.application_deadline) : undefined,
                        max_applications: Number(job.max_applications || 0),
                        current_applications: Number(job.current_applications || 0),
                        industry: job.industry ? String(job.industry) : undefined,
                        selection_process: job.selection_process ? String(job.selection_process) : undefined,
                        campus_drive_date: job.campus_drive_date ? String(job.campus_drive_date) : undefined,
                        views_count: Number(job.views_count || 0),
                        applications_count: Number(job.applications_count || 0),
                        created_at: String(job.created_at || ''),
                        corporate_id: String(job.corporate_id || ''),
                        corporate_name: job.corporate_name ? String(job.corporate_name) : undefined,
                        is_active: Boolean(job.is_active),
                        can_apply: Boolean(job.can_apply)
                    }
                })
            } catch (validationError) {
                console.error('Error validating job data:', validationError)
                console.error('Problematic data:', data)
                // Fallback to empty array if validation fails
                validatedJobs = []
                toast.error('Error processing job data. Please try again.')
            }

            // Only set jobs if validation was successful
            if (validatedJobs.length > 0 || data.jobs === undefined) {
                // Final safety check - filter out any jobs that might still have validation error objects
                const finalJobs = validatedJobs.filter(job => {
                    if (!job || typeof job !== 'object') return false

                    // Check if any field contains validation error objects
                    for (const [key, value] of Object.entries(job)) {
                        if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                            console.error(`Final check: Validation error object still present in job ${job.id}, field ${key}:`, value)
                            return false // Filter out this job
                        }
                    }
                    return true
                })

                console.log('Final validated jobs:', finalJobs)

                // Nuclear option - completely sanitize all data before setting state
                const nuclearCleanJobs = finalJobs.map(job => {
                    if (!job || typeof job !== 'object') return null

                    const cleanJob: any = {}
                    for (const [key, value] of Object.entries(job)) {
                        if (value === null || value === undefined) {
                            cleanJob[key] = value
                        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                            cleanJob[key] = value
                        } else if (Array.isArray(value)) {
                            // Clean array items - only allow primitives
                            cleanJob[key] = value.filter(item =>
                                item === null || item === undefined ||
                                typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                            ).map(item => {
                                if (typeof item === 'object' && item !== null) {
                                    console.warn(`Nuclear cleaning: Converting object array item to string:`, item)
                                    return String(item)
                                }
                                return item
                            })
                        } else {
                            // Any object becomes null
                            console.warn(`Nuclear cleaning: Converting object field ${key} to null:`, value)
                            cleanJob[key] = null
                        }
                    }
                    return cleanJob
                }).filter(Boolean)

                // Ultra-aggressive cleaning - convert everything to safe types
                const ultraCleanJobs = nuclearCleanJobs.map(job => {
                    if (!job || typeof job !== 'object') return null

                    const ultraCleanJob: any = {}
                    for (const [key, value] of Object.entries(job)) {
                        if (value === null || value === undefined) {
                            ultraCleanJob[key] = value
                        } else if (typeof value === 'string') {
                            ultraCleanJob[key] = value
                        } else if (typeof value === 'number') {
                            ultraCleanJob[key] = isNaN(value) ? 0 : value
                        } else if (typeof value === 'boolean') {
                            ultraCleanJob[key] = value
                        } else if (Array.isArray(value)) {
                            ultraCleanJob[key] = value.map(item => {
                                if (item === null || item === undefined) return item
                                if (typeof item === 'string') return item
                                if (typeof item === 'number') return isNaN(item) ? 0 : item
                                if (typeof item === 'boolean') return item
                                return String(item)
                            })
                        } else {
                            ultraCleanJob[key] = null
                        }
                    }
                    return ultraCleanJob
                }).filter(Boolean)

                console.log('Nuclear cleaned jobs:', nuclearCleanJobs)
                console.log('Ultra cleaned jobs:', ultraCleanJobs)

                // Final validation - ensure no objects remain
                const finalValidation = ultraCleanJobs.every(job => {
                    if (!job || typeof job !== 'object') return false
                    for (const [key, value] of Object.entries(job)) {
                        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                            console.error(`CRITICAL: Object still present after ultra cleaning in ${key}:`, value)
                            return false
                        }
                    }
                    return true
                })

                if (!finalValidation) {
                    console.error('CRITICAL: Ultra cleaning failed. Setting empty state.')
                    setJobs([])
                    setPagination({
                        page: 1,
                        limit: 9,
                        total: 0,
                        total_pages: 0
                    })
                    toast.error('Data validation failed. Please try again or contact support.')
                    return
                }

                // Apply client-side search if needed
                let searchFilteredJobs = ultraCleanJobs
                if (useClientSideSearch && searchTerm) {
                    console.log(`Applying client-side search to ${ultraCleanJobs.length} jobs`)
                    console.log('Sample job data:', ultraCleanJobs[0])
                    searchFilteredJobs = performClientSideSearch(ultraCleanJobs, searchTerm)
                    console.log(`Client-side search: ${ultraCleanJobs.length} -> ${searchFilteredJobs.length} jobs`)
                }

                setJobs(searchFilteredJobs)
                setPagination({
                    page: data.page || 1,
                    limit: data.limit || 9,
                    total: useClientSideSearch ? searchFilteredJobs.length : (data.total_count || 0),
                    total_pages: useClientSideSearch ? Math.ceil(searchFilteredJobs.length / (data.limit || 9)) : (data.total_pages || 0)
                })

                // Update application status for jobs
                checkApplicationStatus()
            } else {
                // If validation failed and no jobs, set empty state
                setJobs([])
                setPagination({
                    page: 1,
                    limit: 9,
                    total: 0,
                    total_pages: 0
                })
            }
        } catch (error: any) {
            console.error('Error fetching jobs:', error)

            // Handle validation errors from backend
            if (error.response?.status === 422) {
                console.error('422 Validation Error in fetchJobs:', error.response.data)

                // Check if response contains validation error objects
                const hasValidationErrors = (obj: any): boolean => {
                    if (!obj || typeof obj !== 'object') return false
                    if (Array.isArray(obj)) {
                        return obj.some(hasValidationErrors)
                    }

                    // Check if this is a validation error object
                    if ('type' in obj && 'loc' in obj && 'msg' in obj) {
                        console.error('CRITICAL: Validation error object in fetchJobs response:', obj)
                        return true
                    }

                    // Recursively check all properties
                    for (const [key, value] of Object.entries(obj)) {
                        if (hasValidationErrors(value)) {
                            return true
                        }
                    }
                    return false
                }

                if (hasValidationErrors(error.response.data)) {
                    console.error('CRITICAL: fetchJobs response contains validation errors. Setting empty state.')
                    setJobs([])
                    setPagination({
                        page: 1,
                        limit: 9,
                        total: 0,
                        total_pages: 0
                    })
                    toast.error('Server returned invalid data. Please try again or contact support.')
                    return
                }
            }

            toast.error('Failed to fetch jobs')
        } finally {
            setLoading(false)
        }
    }

    // Handle job application initiation
    const handleApplyClick = (job: Job) => {
        if (!job.can_apply) {
            toast.error('Applications are not currently open for this position')
            return
        }

        // Check if already applied
        if (applicationStatus.get(job.id) === 'applied') {
            toast('You have already applied for this position')
            return
        }

        setCurrentApplicationJob(job)
        setShowApplicationModal(true)
    }

    // Apply for a job with enhanced data
    const applyForJob = async (jobId: string, applicationData: any) => {
        try {
            setApplyingJobs(prev => new Set(prev).add(jobId))

            const response = await apiClient.client.post(`/applications/apply/${jobId}`, {
                job_id: jobId, // Add the missing job_id field
                cover_letter: applicationData.cover_letter || `I am interested in this position and believe my skills and experience make me a great fit.`,
                expected_salary: applicationData.expected_salary || null,
                availability_date: applicationData.availability_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })

            // Update application status
            setApplicationStatus(prev => {
                const newStatus = new Map(prev).set(jobId, 'applied')

                // Save to localStorage for persistence
                const currentStatus = Object.fromEntries(newStatus)
                localStorage.setItem('appliedJobs', JSON.stringify(currentStatus))

                console.log(`Application status updated for job ${jobId}:`, newStatus.get(jobId))
                console.log('All application statuses:', Object.fromEntries(newStatus))

                return newStatus
            })

            toast.success('Application submitted successfully!')

            // Close modal
            setShowApplicationModal(false)
            setCurrentApplicationJob(null)

            // Refresh jobs to update application status
            fetchJobs(pagination.page, buildSearchParams())
        } catch (error: any) {
            console.error('Error applying for job:', error)

            // Handle validation errors from backend
            let message = 'Failed to apply for job'

            if (error.response?.status === 422) {
                console.error('422 Validation Error Response:', error.response.data)

                // Check if response contains validation error objects
                const hasValidationErrors = (obj: any): boolean => {
                    if (!obj || typeof obj !== 'object') return false
                    if (Array.isArray(obj)) {
                        return obj.some(hasValidationErrors)
                    }

                    // Check if this is a validation error object
                    if ('type' in obj && 'loc' in obj && 'msg' in obj) {
                        console.error('CRITICAL: Validation error object in application response:', obj)
                        return true
                    }

                    // Recursively check all properties
                    for (const [key, value] of Object.entries(obj)) {
                        if (hasValidationErrors(value)) {
                            return true
                        }
                    }
                    return false
                }

                if (hasValidationErrors(error.response.data)) {
                    console.error('CRITICAL: Application response contains validation errors. Blocking processing.')
                    message = 'Server returned invalid data. Please try again or contact support.'

                    // Don't process any data that contains validation errors
                    setApplyingJobs(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(jobId)
                        return newSet
                    })
                    toast.error(message)
                    return
                }

                // Extract user-friendly error message
                if (error.response.data?.detail) {
                    if (Array.isArray(error.response.data.detail)) {
                        // Create more specific error messages for common validation errors
                        const errorMessages = error.response.data.detail.map((err: any) => {
                            if (err.type === 'missing') {
                                const field = err.loc[err.loc.length - 1] // Get the field name
                                return `Missing required field: ${field}`
                            } else if (err.type === 'value_error') {
                                return `Invalid value for ${err.loc[err.loc.length - 1]}: ${err.msg}`
                            } else {
                                return err.msg || 'Validation error'
                            }
                        })
                        message = errorMessages.join(', ')
                    } else {
                        message = error.response.data.detail
                    }
                } else if (error.response.data?.message) {
                    message = error.response.data.message
                }
            } else if (error.response?.data?.detail) {
                message = error.response.data.detail
            }

            toast.error(message)
        } finally {
            setApplyingJobs(prev => {
                const newSet = new Set(prev)
                newSet.delete(jobId)
                return newSet
            })
        }
    }

    // Build search parameters from filters
    const buildSearchParams = () => {
        const params: any = {}

        if (searchTerm) {
            // Enhanced search logic to handle different types of search terms
            const searchTermLower = searchTerm.toLowerCase().trim()

            // Check if search term looks like a skill (common tech skills)
            const commonSkills = [
                'python', 'javascript', 'react', 'node', 'java', 'aws', 'docker', 'kubernetes',
                'sql', 'mongodb', 'postgresql', 'redis', 'git', 'linux', 'html', 'css',
                'typescript', 'angular', 'vue', 'php', 'ruby', 'go', 'rust', 'swift',
                'android', 'ios', 'flutter', 'react native', 'machine learning', 'ai',
                'data science', 'analytics', 'devops', 'ci/cd', 'terraform', 'ansible',
                'jenkins', 'graphql', 'rest api', 'microservices', 'blockchain', 'crypto',
                'spring', 'django', 'flask', 'express', 'laravel', 'rails', 'asp.net',
                'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib',
                'elasticsearch', 'kafka', 'rabbitmq', 'nginx', 'apache', 'tomcat'
            ]

            // Check if search term contains skill keywords
            const isSkillSearch = commonSkills.some(skill =>
                searchTermLower.includes(skill) || skill.includes(searchTermLower)
            )

            if (isSkillSearch) {
                // If it looks like a skill, search in skills
                params.skills = [searchTerm]
            } else {
                // For company names, job titles, or other terms, search in title
                // The backend will search in job titles which may include company names
                params.title = searchTerm
            }
        }

        if (filters.location) params.location = filters.location
        if (filters.industry) params.industry = filters.industry
        if (filters.job_type) params.job_type = filters.job_type
        if (filters.experience_min) params.experience_min = filters.experience_min
        if (filters.experience_max) params.experience_max = filters.experience_max
        if (filters.salary_min) params.salary_min = filters.salary_min
        if (filters.salary_max) params.salary_max = filters.salary_max
        if (filters.remote_work !== '') params.remote_work = filters.remote_work
        if (filters.date_posted) params.date_posted = filters.date_posted

        return params
    }

    // Client-side search function for company names and other fields
    const performClientSideSearch = (jobs: Job[], searchTerm: string): Job[] => {
        if (!searchTerm.trim()) return jobs

        const searchTermLower = searchTerm.toLowerCase().trim()
        console.log(`Client-side search: Looking for "${searchTermLower}" in ${jobs.length} jobs`)

        const filteredJobs = jobs.filter(job => {
            // Search in job title
            if (job.title.toLowerCase().includes(searchTermLower)) {
                console.log(`Found match in title: ${job.title}`)
                return true
            }

            // Search in company name
            if (job.corporate_name && job.corporate_name.toLowerCase().includes(searchTermLower)) {
                console.log(`Found match in company name: ${job.corporate_name}`)
                return true
            }

            // Search in job description
            if (job.description && job.description.toLowerCase().includes(searchTermLower)) {
                console.log(`Found match in description: ${job.title}`)
                return true
            }

            // Search in skills
            if (job.skills_required && job.skills_required.some(skill =>
                skill.toLowerCase().includes(searchTermLower)
            )) {
                console.log(`Found match in skills: ${job.title}`)
                return true
            }

            // Search in location
            if (job.location && job.location.toLowerCase().includes(searchTermLower)) {
                console.log(`Found match in location: ${job.title}`)
                return true
            }

            return false
        })

        console.log(`Client-side search result: ${filteredJobs.length} jobs found`)
        return filteredJobs
    }

    // Handle search with hybrid approach
    const handleSearch = async () => {
        setPagination(prev => ({ ...prev, page: 1 }))

        // First, try the backend search
        const searchParams = buildSearchParams()
        console.log('Search params:', searchParams)

        // Try backend search first
        await fetchJobs(1, searchParams)

        // If we have a search term, also try a broader search with client-side filtering
        if (searchTerm) {
            console.log('Search term detected, also trying broader search with client-side filtering...')

            // Get all jobs without search filters, then apply client-side search
            const allJobsParams = buildSearchParams()
            delete allJobsParams.title // Remove title search to get all jobs
            delete allJobsParams.skills // Remove skills search to get all jobs

            console.log('Fallback search params:', allJobsParams)
            await fetchJobs(1, allJobsParams, true) // Use client-side search
        }
    }

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    // Handle pagination
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
        fetchJobs(page, buildSearchParams())
    }

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            location: '',
            industry: '',
            job_type: '',
            experience_min: '',
            experience_max: '',
            salary_min: '',
            salary_max: '',
            remote_work: '',
            date_posted: ''
        })
        setSearchTerm('')
        setJobStatusFilter('open')
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchJobs(1, {})
    }

    // Check application status for jobs
    const checkApplicationStatus = async () => {
        try {
            // First, try to fetch applied jobs from server
            try {
                const response = await apiClient.getStudentAppliedJobs()
                if (response && response.applications) {
                    const appliedJobsMap = new Map()
                    response.applications.forEach((app: any) => {
                        appliedJobsMap.set(app.job_id, 'applied')
                    })
                    console.log('Loaded application status from server:', Object.fromEntries(appliedJobsMap))
                    setApplicationStatus(appliedJobsMap)

                    // Update localStorage with server data
                    localStorage.setItem('appliedJobs', JSON.stringify(Object.fromEntries(appliedJobsMap)))
                    return
                }
            } catch (serverError) {
                console.log('Server fetch failed, falling back to localStorage:', serverError)
            }

            // Fallback to localStorage if server fetch fails
            const appliedJobs = localStorage.getItem('appliedJobs')
            if (appliedJobs) {
                const parsed = JSON.parse(appliedJobs)
                console.log('Loading application status from localStorage:', parsed)
                setApplicationStatus(new Map(Object.entries(parsed)))
            } else {
                console.log('No application status found in localStorage')
            }
        } catch (error) {
            console.error('Error checking application status:', error)
        }
    }

    // Helper function to check if a job is expired
    const isJobExpired = (job: Job) => {
        if (!job.application_deadline) return false
        const deadline = new Date(job.application_deadline)
        const now = new Date()
        return deadline < now
    }

    // Helper function to check if a job is open (available for application)
    const isJobOpen = (job: Job) => {
        const status = applicationStatus.get(job.id)
        return status !== 'applied' && !isJobExpired(job) && job.can_apply
    }

    // Helper function to check if a job is closed (applied, expired, or not available)
    const isJobClosed = (job: Job) => {
        const status = applicationStatus.get(job.id)
        return status === 'applied' || isJobExpired(job) || !job.can_apply
    }

    // Filter jobs based on job status filter
    const filterJobsByStatus = (jobs: Job[]) => {
        if (jobStatusFilter === 'all') return jobs
        if (jobStatusFilter === 'open') return jobs.filter(isJobOpen)
        if (jobStatusFilter === 'closed') return jobs.filter(isJobClosed)
        return jobs
    }

    // Global validation error handler
    const handleValidationError = (data: any, context: string) => {
        console.error(`CRITICAL: Validation error detected in ${context}:`, data)

        // Check if this contains validation error objects
        const hasValidationErrors = (obj: any): boolean => {
            if (!obj || typeof obj !== 'object') return false
            if (Array.isArray(obj)) {
                return obj.some(hasValidationErrors)
            }

            // Check if this is a validation error object
            if ('type' in obj && 'loc' in obj && 'msg' in obj) {
                console.error(`Validation error object found in ${context}:`, obj)
                return true
            }

            // Recursively check all properties
            for (const [key, value] of Object.entries(obj)) {
                if (hasValidationErrors(value)) {
                    return true
                }
            }
            return false
        }

        if (hasValidationErrors(data)) {
            console.error(`CRITICAL: ${context} contains validation errors. Blocking processing.`)
            toast.error('Server returned invalid data. Please try again or contact support.')
            return true // Indicates validation errors were found
        }

        return false // No validation errors
    }

    // Load initial data
    useEffect(() => {
        fetchJobs(1, {})
        checkApplicationStatus()
    }, [])

    // Global error boundary for validation errors
    useEffect(() => {
        const handleGlobalError = (event: ErrorEvent) => {
            if (event.error && event.error.message && event.error.message.includes('Objects are not valid as a React child')) {
                console.error('CRITICAL: Global React error detected:', event.error)

                // Check if this is a validation error
                if (event.error.message.includes('{type, loc, msg, input}')) {
                    console.error('CRITICAL: Validation error object being rendered. This should not happen with our defense system.')
                    toast.error('Critical error detected. Please refresh the page.')

                    // Force a page refresh to recover
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                }
            }
        }

        window.addEventListener('error', handleGlobalError)

        return () => {
            window.removeEventListener('error', handleGlobalError)
        }
    }, [])

    return (
        <StudentDashboardLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Job Opportunities 💼
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Discover and apply for exciting career opportunities ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                📈 Career Growth
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                🚀 New Opportunities
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 p-6">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search jobs by title, skills, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                    <select
                        value={jobStatusFilter}
                        onChange={(e) => setJobStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800 text-sm h-10"
                    >
                        <option value="all">All Jobs</option>
                        <option value="open">Open Jobs</option>
                        <option value="closed">Closed Jobs</option>
                    </select>
                    <Button
                        onClick={handleSearch}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        Search
                    </Button>
                </div>


                {/* Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📍 Location
                            </label>
                            <Input
                                placeholder="City, State"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                🏭 Industry
                            </label>
                            <select
                                value={filters.industry}
                                onChange={(e) => handleFilterChange('industry', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All Industries</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Retail">Retail</option>
                                <option value="Consulting">Consulting</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                💼 Job Type
                            </label>
                            <select
                                value={filters.job_type}
                                onChange={(e) => handleFilterChange('job_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All Types</option>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                🏠 Remote Work
                            </label>
                            <select
                                value={filters.remote_work}
                                onChange={(e) => handleFilterChange('remote_work', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-800"
                            >
                                <option value="">All</option>
                                <option value="true">Remote Only</option>
                                <option value="false">On-site Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ⏰ Min Experience (years)
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={filters.experience_min}
                                onChange={(e) => handleFilterChange('experience_min', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ⏰ Max Experience (years)
                            </label>
                            <Input
                                type="number"
                                placeholder="10"
                                value={filters.experience_max}
                                onChange={(e) => handleFilterChange('experience_max', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                💰 Min Salary (INR)
                            </label>
                            <Input
                                type="number"
                                placeholder="300000"
                                value={filters.salary_min}
                                onChange={(e) => handleFilterChange('salary_min', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                💰 Max Salary (INR)
                            </label>
                            <Input
                                type="number"
                                placeholder="2000000"
                                value={filters.salary_max}
                                onChange={(e) => handleFilterChange('salary_max', e.target.value)}
                                className="border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col sm:flex-row items-center gap-3">
                            <Button
                                onClick={handleSearch}
                                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                            >
                                ✨ Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2 w-full sm:w-auto"
                            >
                                🗑️ Clear All
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Main Content */}
            <div>
                {/* Results Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-gray-600 dark:text-gray-300 text-sm">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                    Loading jobs...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    📊 <span className="font-semibold text-primary-600 dark:text-primary-400">
                                        Showing {filterJobsByStatus(jobs).length} of {jobs.length} jobs
                                    </span>
                                </span>
                            )}
                        </div>
                        {pagination.total > 0 && (
                            <div className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                                📄 Page {pagination.page} of {pagination.total_pages} • {pagination.limit} jobs per page
                            </div>
                        )}
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterJobsByStatus(jobs).map((job, index) => {
                                // Final safety check before rendering
                                if (!job || typeof job !== 'object') {
                                    console.error('Attempting to render invalid job:', job)
                                    return null
                                }

                                // Check for validation error objects
                                for (const [key, value] of Object.entries(job)) {
                                    if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                                        console.error(`Validation error object found during render in job ${job.id}, field ${key}:`, value)
                                        return null // Don't render this job
                                    }
                                }

                                return (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        onViewDescription={() => setSelectedJob(job)}
                                        onApply={() => handleApplyClick(job)}
                                        isApplying={applyingJobs.has(job.id)}
                                        cardIndex={index}
                                    />
                                )
                            }).filter(Boolean)}

                            {/* Show message if no jobs were rendered due to validation errors */}
                            {jobs.length > 0 && jobs.filter(job => {
                                if (!job || typeof job !== 'object') return false
                                for (const [key, value] of Object.entries(job)) {
                                    if (value && typeof value === 'object' && 'type' in value && 'loc' in value && 'msg' in value) {
                                        return false
                                    }
                                }
                                return true
                            }).length === 0 && (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            <p className="text-lg font-medium mb-2">Data Validation Issue</p>
                                            <p className="text-sm">Some job data contains validation errors and cannot be displayed.</p>
                                            <p className="text-sm mt-1">Please check the console for details or contact support.</p>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Simple Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="mt-8 flex items-center justify-center">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center gap-2">
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ←
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.total_pages)].map((_, i) => {
                                                const pageNum = i + 1
                                                const isCurrentPage = pageNum === pagination.page
                                                const isNearCurrent = Math.abs(pageNum - pagination.page) <= 1
                                                const isFirstOrLast = pageNum === 1 || pageNum === pagination.total_pages

                                                if (isFirstOrLast || isNearCurrent) {
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={isCurrentPage ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`min-w-[32px] h-8 ${isCurrentPage
                                                                ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                                                    return <span key={pageNum} className="px-2 text-primary-400 dark:text-primary-300">...</span>
                                                }
                                                return null
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.total_pages}
                                            className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            →
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No jobs found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Try adjusting your search criteria or filters
                        </p>
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2"
                        >
                            🔄 Clear Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Job Description Modal */}
            {selectedJob && (
                <JobDescriptionModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onApply={() => {
                        handleApplyClick(selectedJob)
                        setSelectedJob(null)
                    }}
                    isApplying={applyingJobs.has(selectedJob.id)}
                    applicationStatus={applicationStatus.get(selectedJob.id)}
                />
            )}

            {/* Application Modal */}
            {showApplicationModal && currentApplicationJob && (
                <ApplicationModal
                    job={currentApplicationJob}
                    onClose={() => {
                        setShowApplicationModal(false)
                        setCurrentApplicationJob(null)
                    }}
                    onSubmit={(applicationData) => applyForJob(currentApplicationJob.id, applicationData)}
                    isApplying={applyingJobs.has(currentApplicationJob.id)}
                />
            )}
        </StudentDashboardLayout>
    )
}

export default function JobOpportunitiesPage() {
    return (
        <ErrorBoundary>
            <JobOpportunitiesPageContent />
        </ErrorBoundary>
    )
}
