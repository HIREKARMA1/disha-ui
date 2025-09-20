"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Briefcase, Clock, DollarSign, Users, Building, Calendar, Globe, Car, GraduationCap, Award, FileText, CheckCircle, ExternalLink, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useState, useEffect } from 'react'
import { downloadJobDescriptionPDF } from '@/lib/pdfGenerator'
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

interface CorporateProfile {
    id: string
    company_name: string
    website_url?: string
    industry?: string
    company_size?: string
    founded_year?: number
    description?: string
    company_type?: string
    company_logo?: string
    verified: boolean
    contact_person?: string
    contact_designation?: string
    address?: string
}

interface JobDescriptionModalProps {
    job: Job
    onClose: () => void
    onApply: () => void
    isApplying?: boolean
    showApplyButton?: boolean // New prop to control apply button visibility
    applicationStatus?: string // Add application status prop
}

export function JobDescriptionModal({ job, onClose, onApply, isApplying = false, showApplyButton = true, applicationStatus }: JobDescriptionModalProps) {
    const [corporateProfile, setCorporateProfile] = useState<CorporateProfile | null>(null)
    const [loadingCorporate, setLoadingCorporate] = useState(false)
    const [corporateError, setCorporateError] = useState<string | null>(null)
    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

    useEffect(() => {
        const fetchCorporateProfile = async () => {
            if (!job.corporate_id) return

            setLoadingCorporate(true)
            setCorporateError(null)

            try {
                const profile = await apiClient.getPublicCorporateProfile(job.corporate_id)
                setCorporateProfile(profile)
            } catch (error) {
                console.error('Failed to fetch corporate profile:', error)
                setCorporateError('Failed to load company information')
            } finally {
                setLoadingCorporate(false)
            }
        }

        fetchCorporateProfile()
    }, [job.corporate_id])

    const handleDownloadPDF = async () => {
        setIsDownloadingPDF(true)
        try {
            const success = await downloadJobDescriptionPDF(job, corporateProfile || undefined)
            if (success) {
                toast.success('Job description PDF downloaded successfully!')
            } else {
                toast.error('Failed to generate PDF. Please try again.')
            }
        } catch (error) {
            console.error('Error downloading PDF:', error)
            toast.error('Failed to generate PDF. Please try again.')
        } finally {
            setIsDownloadingPDF(false)
        }
    }

    const formatSalary = (currency: string, min?: number, max?: number) => {
        if (!min && !max) return 'Not specified'
        if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
        if (min) return `${currency} ${min.toLocaleString()}+`
        if (max) return `${currency} Up to ${max.toLocaleString()}`
        return 'Not specified'
    }

    const formatExperience = (min?: number, max?: number) => {
        if (!min && !max) return 'Not specified'
        if (min && max) return `${min}-${max} years`
        if (min) return `${min}+ years`
        if (max) return `Up to ${max} years`
        return 'Not specified'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getJobTypeLabel = (jobType: string) => {
        const labels = {
            full_time: 'Full Time',
            part_time: 'Part Time',
            contract: 'Contract',
            internship: 'Internship',
            freelance: 'Freelance'
        }
        return labels[jobType as keyof typeof labels] || jobType
    }

    const isDeadlineExpired = () => {
        if (!job.application_deadline) return false
        const deadline = new Date(job.application_deadline)
        const now = new Date()
        return deadline < now
    }

    const canApply = () => {
        return applicationStatus !== 'applied' && !isDeadlineExpired() && job.can_apply
    }

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
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-2 border-b border-primary-200 dark:border-primary-700">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h2>
                                {job.corporate_name && (
                                    <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        {job.corporate_name}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                                        <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{job.location}</p>
                                        {job.remote_work && (
                                            <span className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                                                Remote Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Salary Range</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatSalary(job.salary_currency, job.salary_min, job.salary_max)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatExperience(job.experience_min, job.experience_max)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Job Type</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {getJobTypeLabel(job.job_type)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                                        <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(job.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Building className="w-5 h-5 text-primary-500" />
                                Company Information
                                {corporateProfile?.verified && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </h3>

                            {loadingCorporate ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ) : corporateError ? (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <p className="text-red-800 dark:text-red-200">{corporateError}</p>
                                </div>
                            ) : corporateProfile ? (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-start gap-4">
                                        {corporateProfile.company_logo && (
                                            <img
                                                src={corporateProfile.company_logo}
                                                alt={corporateProfile.company_name}
                                                className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {corporateProfile.company_name}
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                {corporateProfile.industry && (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                                                        <span className="text-gray-900 dark:text-white font-medium">{corporateProfile.industry}</span>
                                                    </div>
                                                )}

                                                {corporateProfile.company_size && (
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Size:</span>
                                                        <span className="text-gray-900 dark:text-white font-medium">{corporateProfile.company_size}</span>
                                                    </div>
                                                )}

                                                {corporateProfile.founded_year && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Founded:</span>
                                                        <span className="text-gray-900 dark:text-white font-medium">{corporateProfile.founded_year}</span>
                                                    </div>
                                                )}

                                                {corporateProfile.company_type && (
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                                        <span className="text-gray-900 dark:text-white font-medium capitalize">{corporateProfile.company_type}</span>
                                                    </div>
                                                )}

                                                {corporateProfile.website_url && (
                                                    <div className="flex items-center gap-2 md:col-span-2">
                                                        <Globe className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Website:</span>
                                                        <a
                                                            href={corporateProfile.website_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1"
                                                        >
                                                            Visit Website
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                )}

                                                {corporateProfile.address && (
                                                    <div className="flex items-start gap-2 md:col-span-2">
                                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                                            <p className="text-gray-900 dark:text-white font-medium">{corporateProfile.address}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {corporateProfile.description && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">About {corporateProfile.company_name}</h5>
                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                                        {corporateProfile.description}
                                                    </p>
                                                </div>
                                            )}

                                            {corporateProfile.contact_person && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h5>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        <p><span className="font-medium">Contact Person:</span> {corporateProfile.contact_person}</p>
                                                        {corporateProfile.contact_designation && (
                                                            <p><span className="font-medium">Designation:</span> {corporateProfile.contact_designation}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <p className="text-gray-500 dark:text-gray-400">Company information not available</p>
                                </div>
                            )}
                        </div>

                        {/* Job Description */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                Job Description
                            </h3>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary-500" />
                                    Requirements
                                </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {job.requirements}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Responsibilities */}
                        {job.responsibilities && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary-500" />
                                    Responsibilities
                                </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {job.responsibilities}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Skills Required */}
                        {job.skills_required && job.skills_required.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary-500" />
                                    Skills Required
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills_required.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-lg font-medium border border-primary-200 dark:border-primary-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Education & Experience */}
                            <div className="space-y-4">
                                {job.education_level && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-primary-500" />
                                            Education Level
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300">{job.education_level}</p>
                                    </div>
                                )}

                                {job.industry && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-primary-500" />
                                            Industry
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300">{job.industry}</p>
                                    </div>
                                )}
                            </div>

                            {/* Work Details */}
                            <div className="space-y-4">
                                {job.remote_work && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-primary-500" />
                                            Remote Work
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300">Available</p>
                                    </div>
                                )}

                                {job.travel_required && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <Car className="w-4 h-4 text-primary-500" />
                                            Travel Required
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300">Yes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection Process */}
                        {job.selection_process && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary-500" />
                                    Selection Process
                                </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {job.selection_process}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Application Deadline */}
                        {job.application_deadline && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-500" />
                                    Application Deadline
                                </h3>
                                <div className={cn(
                                    "rounded-xl p-4 border",
                                    isDeadlineExpired()
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                )}>
                                    <p className={cn(
                                        "font-medium",
                                        isDeadlineExpired()
                                            ? "text-red-800 dark:text-red-200"
                                            : "text-gray-700 dark:text-gray-300"
                                    )}>
                                        {formatDate(job.application_deadline)}
                                        {isDeadlineExpired() && (
                                            <span className="ml-2 text-red-600 dark:text-red-400">
                                                (Expired)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Campus Drive Info */}
                        {job.campus_drive_date && (
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary-500" />
                                    Campus Drive
                                </h3>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                                        Campus Drive Date: {formatDate(job.campus_drive_date)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloadingPDF}
                                    className="border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md text-blue-600 dark:text-blue-400"
                                >
                                    {isDownloadingPDF ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                                >
                                    Close
                                </Button>
                                {showApplyButton && (
                                    <Button
                                        onClick={onApply}
                                        disabled={!canApply() || isApplying}
                                        className={cn(
                                            "bg-primary-500 hover:bg-primary-600 text-white",
                                            !canApply() && "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                        )}
                                    >
                                        {isApplying ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Applying...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {applicationStatus === 'applied' ? 'Already Applied' : isDeadlineExpired() ? 'Expired' : 'Apply Now'}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

