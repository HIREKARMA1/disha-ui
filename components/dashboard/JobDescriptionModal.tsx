"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Briefcase, Clock, DollarSign, Users, Building, Calendar, Globe, Car, GraduationCap, Award, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

interface JobDescriptionModalProps {
    job: Job
    onClose: () => void
    onApply: () => void
    isApplying?: boolean
    showApplyButton?: boolean // New prop to control apply button visibility
}

export function JobDescriptionModal({ job, onClose, onApply, isApplying = false, showApplyButton = true }: JobDescriptionModalProps) {
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
                                    onClick={onClose}
                                    className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                                >
                                    Close
                                </Button>
                                {showApplyButton && (
                                    <Button
                                        onClick={onApply}
                                        disabled={!job.can_apply || isDeadlineExpired() || isApplying}
                                        className={cn(
                                            "bg-primary-500 hover:bg-primary-600 text-white",
                                            (!job.can_apply || isDeadlineExpired()) && "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
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
                                                {!job.can_apply ? 'Already Applied' : isDeadlineExpired() ? 'Deadline Expired' : 'Apply Now'}
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

