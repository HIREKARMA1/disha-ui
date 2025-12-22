"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/navbar'
import { 
    Loader2, 
    AlertCircle, 
    MapPin, 
    Briefcase, 
    Clock, 
    DollarSign, 
    Calendar,
    Building2,
    Users,
    Share2,
    CheckCircle,
    ExternalLink,
    Globe,
    Mail,
    Phone
} from 'lucide-react'

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
    salary_min?: number
    salary_max?: number
    salary_currency: string
    experience_min?: number
    experience_max?: number
    skills_required?: string[]
    application_deadline?: string
    max_applications: number
    current_applications: number
    views_count: number
    applications_count: number
    corporate_name?: string
    corporate_id?: string
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
    industry?: string
    mode_of_work?: string
    number_of_openings?: number
    perks_and_benefits?: string
    eligibility_criteria?: string
    is_active: boolean
    can_apply: boolean
    created_at?: string
    education_level?: string | string[]
    assigned_university_ids?: string[]  // List of university IDs this job is assigned to
    [key: string]: any
}

export default function PublicJobPage() {
    const params = useParams()
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const publicLinkToken = params?.public_link_token as string

    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isApplying, setIsApplying] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [activeTab, setActiveTab] = useState<'description' | 'company'>('description')
    const [corporateProfile, setCorporateProfile] = useState<any>(null)
    const [studentUniversityId, setStudentUniversityId] = useState<string | null>(null)

    useEffect(() => {
        if (publicLinkToken) {
            fetchPublicJob()
        }
    }, [publicLinkToken])

    useEffect(() => {
        // Check if user just logged in and should be redirected here
        if (isAuthenticated && user?.user_type === 'student') {
            const redirectUrl = localStorage.getItem('redirect_after_login')
            if (redirectUrl && redirectUrl.includes(publicLinkToken)) {
                // Clear the redirect URL since we're already here
                localStorage.removeItem('redirect_after_login')
                // Check application status after redirect
                if (job?.id) {
                    checkApplicationStatus()
                }
            }
        }
    }, [isAuthenticated, user, publicLinkToken, job?.id])

    useEffect(() => {
        if (job?.corporate_id) {
            fetchCorporateProfile()
        }
    }, [job?.corporate_id])

    useEffect(() => {
        // Check if user has already applied for this job
        if (isAuthenticated && user?.user_type === 'student' && job?.id) {
            checkApplicationStatus()
        }
    }, [isAuthenticated, user, job?.id])

    useEffect(() => {
        // Fetch student profile to get university_id
        const fetchStudentProfile = async () => {
            if (isAuthenticated && user?.user_type === 'student') {
                try {
                    const profile = await apiClient.getStudentProfile()
                    setStudentUniversityId(profile.university_id || null)
                } catch (err) {
                    console.warn('Could not fetch student profile:', err)
                }
            }
        }
        fetchStudentProfile()
    }, [isAuthenticated, user])

    const fetchPublicJob = async () => {
        try {
            setLoading(true)
            setError(null)
            console.log('Fetching public job with token:', publicLinkToken)
            const response = await apiClient.getPublicJob(publicLinkToken)
            console.log('Public job response:', response)
            if (response) {
                setJob(response)
            } else {
                setError('Job not found or not publicly accessible')
            }
        } catch (err: any) {
            console.error('Error fetching public job:', err)
            console.error('Error response:', err.response)
            const errorMessage = err.response?.data?.detail || err.message || 'Job not found or not publicly accessible'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const fetchCorporateProfile = async () => {
        if (!job?.corporate_id) return
        try {
            const profile = await apiClient.getPublicCorporateProfile(job.corporate_id)
            setCorporateProfile(profile)
        } catch (err) {
            console.warn('Could not fetch corporate profile:', err)
        }
    }

    const checkApplicationStatus = async () => {
        if (!job?.id || !isAuthenticated || user?.user_type !== 'student') return
        try {
            const response = await apiClient.client.get('/applications/student/applications')
            // Check if there's an application for this job
            if (response.data) {
                let applications = []
                if (Array.isArray(response.data)) {
                    applications = response.data
                } else if (response.data.applications && Array.isArray(response.data.applications)) {
                    applications = response.data.applications
                }
                const hasApplication = applications.some((app: any) => app.job_id === job.id)
                setHasApplied(hasApplication)
            }
        } catch (err) {
            console.warn('Could not check application status:', err)
            // If error, assume not applied
            setHasApplied(false)
        }
    }

    const canStudentApply = () => {
        // Check if job is assigned to any universities
        if (!job?.assigned_university_ids || job.assigned_university_ids.length === 0) {
            return {
                canApply: false,
                reason: 'This job is not available for applications.'
            }
        }

        // If student is not authenticated, they can't apply yet (will be redirected to login)
        if (!isAuthenticated || user?.user_type !== 'student') {
            return { canApply: true, reason: null }
        }

        // Check if student has a university_id
        if (!studentUniversityId) {
            return {
                canApply: false,
                reason: 'This job is only available to students from assigned universities. Please contact your university administrator.'
            }
        }

        // Check if student's university is in the assigned universities list
        if (!job.assigned_university_ids.includes(studentUniversityId)) {
            return {
                canApply: false,
                reason: 'This job is not available for your college.'
            }
        }

        return { canApply: true, reason: null }
    }

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            if (job) {
                localStorage.setItem('redirect_after_login', `/jobs/public/${publicLinkToken}`)
            }
            router.push(`/auth/login?redirect=/jobs/public/${publicLinkToken}&type=student`)
            return
        }

        if (user?.user_type !== 'student') {
            toast.error('Only students can apply for jobs')
            return
        }

        // Check university assignment before applying
        const eligibility = canStudentApply()
        if (!eligibility.canApply) {
            toast.error(eligibility.reason || 'You are not eligible to apply for this job')
            return
        }

        handleApply()
    }

    const handleApply = async () => {
        if (!job) return

        setIsApplying(true)
        try {
            await apiClient.client.post(`/applications/apply/${job.id}`, {
                job_id: job.id,
                cover_letter: `I am interested in this position and believe my skills and experience make me a great fit.`,
                expected_salary: null,
                availability_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })

            setHasApplied(true)
            toast.success('Successfully applied for this job!')
        } catch (error: any) {
            console.error('Error applying for job:', error)
            toast.error(error.response?.data?.detail || 'Failed to submit application')
        } finally {
            setIsApplying(false)
        }
    }

    const formatSalary = () => {
        if (!job?.salary_min && !job?.salary_max) return 'Not disclosed'
        if (job.salary_min && job.salary_max) {
            return `${job.salary_currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
        }
        if (job.salary_min) return `${job.salary_currency} ${job.salary_min.toLocaleString()}+`
        return `Up to ${job.salary_currency} ${job.salary_max?.toLocaleString()}`
    }

    const formatExperience = () => {
        if (!job?.experience_min && !job?.experience_max) return 'Not specified'
        if (job.experience_min && job.experience_max) {
            return `${job.experience_min}-${job.experience_max} years`
        }
        if (job.experience_min) return `${job.experience_min}+ years`
        return `Up to ${job.experience_max} years`
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return 'Not specified'
        }
    }

    const getWorkMode = () => {
        if (job?.mode_of_work) {
            return job.mode_of_work.charAt(0).toUpperCase() + job.mode_of_work.slice(1)
        }
        if (job?.remote_work) return 'Remote'
        return 'On-site'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar variant="transparent" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading job details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar variant="transparent" />
                <div className="flex items-center justify-center min-h-[60vh] pt-24 px-4">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Job Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {error || 'This job is not publicly accessible or has been removed.'}
                        </p>
                        <Button onClick={() => router.push('/auth/login')}>
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const companyName = job.company_name || job.corporate_name || 'Company'
    const companyLogo = job.company_logo || corporateProfile?.company_logo

    // Check eligibility once
    const eligibility = canStudentApply()
    const isEligibleToApply = eligibility.canApply

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="transparent" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                                {companyLogo ? (
                                    <div className="relative">
                                        <img
                                            src={companyLogo}
                                            alt={companyName}
                                            className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30">
                                        {companyName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 w-full text-center md:text-left">
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                                        {job.title}
                                    </h1>
                                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-4 font-medium">
                                        {companyName}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            <span className="font-medium">{Array.isArray(job.location) ? job.location.join(', ') : job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="text-primary-600 dark:text-primary-400 font-semibold">•</span>
                                            <span className="font-medium">{getWorkMode()}</span>
                                        </div>
                                        {job.created_at && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                <span className="font-medium">Updated {formatDate(job.created_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Job Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Salary</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatSalary()}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Experience</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatExperience()}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Job Type</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                            {job.job_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl hover:shadow-md transition-shadow">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                                        <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Openings</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {job.number_of_openings || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex space-x-1 px-6">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`relative py-4 px-6 font-semibold text-sm transition-all duration-200 ${
                                            activeTab === 'description'
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        Job Description
                                        {activeTab === 'description' && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"></span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('company')}
                                        className={`relative py-4 px-6 font-semibold text-sm transition-all duration-200 ${
                                            activeTab === 'company'
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        Company Information
                                        {activeTab === 'company' && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"></span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {activeTab === 'description' && (
                                    <div className="space-y-8">
                                        {job.description && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                                    About the Role
                                                </h3>
                                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {job.description}
                                                </div>
                                            </div>
                                        )}

                                        {job.responsibilities && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                                    Responsibilities
                                                </h3>
                                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {job.responsibilities}
                                                </div>
                                            </div>
                                        )}

                                        {job.requirements && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                                    Requirements
                                                </h3>
                                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {job.requirements}
                                                </div>
                                            </div>
                                        )}

                                        {job.skills_required && job.skills_required.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                                    Required Skills
                                                </h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {job.skills_required.map((skill: string, index: number) => (
                                                        <span
                                                            key={index}
                                                            className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-semibold border border-primary-200 dark:border-primary-800 shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {job.perks_and_benefits && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                                    Perks & Benefits
                                                </h3>
                                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {job.perks_and_benefits}
                                                </div>
                                            </div>
                                        )}

                                        {job.eligibility_criteria && (
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                                    Eligibility Criteria
                                                </h3>
                                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {job.eligibility_criteria}
                                                </div>
                                            </div>
                                        )}

                                        {job.application_deadline && (
                                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-5 shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                                                        <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                                                            Application Deadline
                                                        </p>
                                                        <p className="text-base font-semibold text-yellow-800 dark:text-yellow-300">
                                                            {formatDate(job.application_deadline)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'company' && (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            {companyLogo ? (
                                                <img
                                                    src={companyLogo}
                                                    alt={companyName}
                                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                                                    {companyName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                    {companyName}
                                                </h3>
                                                {job.industry && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-3">{job.industry}</p>
                                                )}
                                                {job.company_description && (
                                                    <p className="text-gray-700 dark:text-gray-300">{job.company_description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {job.company_founded && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Founded</p>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.company_founded}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {job.company_size && (
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Company Size</p>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.company_size}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {job.company_type && (
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Company Type</p>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.company_type}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {job.company_address && (
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.company_address}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {job.company_website && (
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                                                        <a
                                                            href={job.company_website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                                        >
                                                            Visit Website
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6">
                        {/* Action Buttons Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-6 hover:shadow-2xl transition-shadow duration-300">
                            <div className="space-y-4">
                                {hasApplied ? (
                                    <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-5 text-center shadow-md">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="text-base font-bold text-green-900 dark:text-green-200 mb-1">
                                            Successfully Applied!
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            You have successfully applied for this job
                                        </p>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleApplyClick}
                                        disabled={!job.can_apply || isApplying || hasApplied}
                                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                        size="lg"
                                        title={
                                            hasApplied 
                                                ? 'You have already applied for this job'
                                                : !job.can_apply 
                                                    ? 'Applications are not currently open for this job'
                                                    : !isEligibleToApply
                                                        ? eligibility.reason || 'You are not eligible to apply for this job'
                                                        : ''
                                        }
                                    >
                                        {isApplying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Apply Now
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full border-2 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        toast.success('Link copied to clipboard!')
                                    }}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        {/* Eligibility Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
                                Eligibility
                            </h3>
                            <div className="space-y-3">
                                {job.experience_min || job.experience_max ? (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {formatExperience()} experience
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Open to all</p>
                                )}
                                {job.education_level && (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {Array.isArray(job.education_level) 
                                                ? job.education_level.join(', ')
                                                : job.education_level}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
