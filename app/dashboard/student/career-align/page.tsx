"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Target, TrendingUp, CheckCircle, AlertCircle, Loader2, Star, BarChart3, Search, Filter, MapPin, Briefcase, Clock, DollarSign, Users, Building, Eye, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
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
}

interface JobMatch {
    id: string
    title: string
    location?: string
    job_type?: string
    application_end_date?: string
    required_skills: string[]
    match_score: number
    company_name?: string
    salary_min?: number
    salary_max?: number
    experience_min?: number
    experience_max?: number
    industry?: string
    views_count?: number
    applications_count?: number
}

interface ResumeScore {
    needs_ats_formatting: boolean
    keywords: string[]
    overall_score: number
    suggestions: string[]
}

interface SkillGap {
    skills: string[]
    message: string
    priority: string
}

interface CareerAlignResponse {
    job_match_score: number
    top_recommended_jobs: JobMatch[]
    resume_score: ResumeScore
    skill_gap: SkillGap
    user_id: string
}

function CareerAlignPageContent() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<CareerAlignResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [currentApplicationJob, setCurrentApplicationJob] = useState<Job | null>(null)
    const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set())
    const [applicationStatus, setApplicationStatus] = useState<Map<string, string>>(new Map())

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [jobsPerPage] = useState(9)
    const [totalPages, setTotalPages] = useState(1)

    // Search state
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please select a PDF file')
                return
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size must be less than 10MB')
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    const handleAnalyze = async () => {
        if (!selectedFile) {
            toast.error('Please select a PDF file first')
            return
        }

        setIsAnalyzing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('resume', selectedFile)

            const result: CareerAlignResponse = await apiClient.analyzeResume(formData)
            setAnalysisResult(result)
            setCurrentPage(1)
            setTotalPages(Math.ceil(result.top_recommended_jobs.length / jobsPerPage))
            toast.success('Resume analysis completed successfully!')
        } catch (err: any) {
            console.error('Analysis error:', err)
            const errorMessage = err.response?.data?.detail || 'Failed to analyze resume. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleApplyClick = (job: Job) => {
        setCurrentApplicationJob(job)
        setShowApplicationModal(true)
    }

    const applyForJob = async (jobId: string, applicationData: any) => {
        try {
            setApplyingJobs(prev => new Set(prev).add(jobId))

            await apiClient.applyForJob(jobId, {
                job_id: jobId,
                cover_letter: applicationData.cover_letter || `I am interested in this position and believe my skills and experience make me a great fit.`,
                expected_salary: applicationData.expected_salary || null,
                availability_date: applicationData.availability_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })

            setApplicationStatus(prev => {
                const newStatus = new Map(prev).set(jobId, 'applied')
                const currentStatus = Object.fromEntries(newStatus)
                localStorage.setItem('appliedJobs', JSON.stringify(currentStatus))
                return newStatus
            })

            toast.success('Application submitted successfully!')
            setShowApplicationModal(false)
            setCurrentApplicationJob(null)
        } catch (error: any) {
            console.error('Application error:', error)
            toast.error(error.response?.data?.detail || 'Failed to submit application')
        } finally {
            setApplyingJobs(prev => {
                const newSet = new Set(prev)
                newSet.delete(jobId)
                return newSet
            })
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400'
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-50 dark:bg-green-900/20'
        if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20'
        return 'bg-red-50 dark:bg-red-900/20'
    }

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    }

    // Convert job matches to job objects for display
    const convertJobMatchesToJobs = (jobMatches: JobMatch[]): Job[] => {
        return jobMatches.map((jobMatch, index) => ({
            id: jobMatch.id,
            title: jobMatch.title,
            description: `Match Score: ${jobMatch.match_score}% - ${jobMatch.required_skills.join(', ')}`,
            job_type: jobMatch.job_type || 'full_time',
            status: 'active',
            location: jobMatch.location || 'Remote',
            remote_work: true,
            travel_required: false,
            salary_min: jobMatch.salary_min || 800000,
            salary_max: jobMatch.salary_max || 1500000,
            salary_currency: 'INR',
            experience_min: jobMatch.experience_min || 2,
            experience_max: jobMatch.experience_max || 5,
            education_level: 'Bachelor\'s Degree',
            max_applications: 100,
            current_applications: jobMatch.applications_count || Math.floor(Math.random() * 50),
            views_count: jobMatch.views_count || Math.floor(Math.random() * 200),
            applications_count: jobMatch.applications_count || Math.floor(Math.random() * 50),
            created_at: new Date().toISOString(),
            corporate_id: 'corporate-1',
            corporate_name: jobMatch.company_name || 'TechCorp Solutions',
            is_active: true,
            can_apply: true,
            skills_required: jobMatch.required_skills,
            industry: jobMatch.industry || 'Technology',
            application_deadline: jobMatch.application_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }))
    }

    // Get current page jobs
    const getCurrentPageJobs = () => {
        if (!analysisResult) return []
        const jobsToUse = filteredJobs.length > 0 ? filteredJobs : convertJobMatchesToJobs(analysisResult.top_recommended_jobs)
        const startIndex = (currentPage - 1) * jobsPerPage
        const endIndex = startIndex + jobsPerPage
        return jobsToUse.slice(startIndex, endIndex)
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
    }

    // Filter jobs based on search term
    const filterJobs = (jobs: Job[], search: string) => {
        if (!search.trim()) return jobs
        const searchLower = search.toLowerCase()
        return jobs.filter(job =>
            job.title.toLowerCase().includes(searchLower) ||
            job.corporate_name?.toLowerCase().includes(searchLower) ||
            job.location.toLowerCase().includes(searchLower) ||
            job.skills_required?.some(skill => skill.toLowerCase().includes(searchLower)) ||
            job.description.toLowerCase().includes(searchLower)
        )
    }

    // Handle search
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (analysisResult) {
            const allJobs = convertJobMatchesToJobs(analysisResult.top_recommended_jobs)
            const filtered = filterJobs(allJobs, searchTerm)
            setFilteredJobs(filtered)
            setCurrentPage(1)
            setTotalPages(Math.ceil(filtered.length / jobsPerPage))
        }
    }

    // Clear search
    const clearSearch = () => {
        setSearchTerm('')
        if (analysisResult) {
            setFilteredJobs([])
            setCurrentPage(1)
            setTotalPages(Math.ceil(analysisResult.top_recommended_jobs.length / jobsPerPage))
        }
    }

    return (
        <StudentDashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                {/* Header - Exact match to Video Search and Jobs */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Career Align 🎯
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Upload your resume and get personalized job recommendations ✨
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

                {/* Resume Upload Section - Compact */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        Resume Analysis
                    </h2>

                    <div className="space-y-3">
                        {/* File Upload */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-gray-300 mb-1 text-sm">
                                Upload your resume in PDF format
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Maximum file size: 10MB
                            </p>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label
                                htmlFor="resume-upload"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm"
                            >
                                Choose File
                            </label>
                        </div>

                        {/* Selected File Display */}
                        {selectedFile && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-green-600" />
                                    <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                                        {selectedFile.name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Analyze Button */}
                        <Button
                            onClick={handleAnalyze}
                            disabled={!selectedFile || isAnalyzing}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Analyzing Resume...
                                </>
                            ) : (
                                <>
                                    <Target className="w-4 h-4 mr-2" />
                                    Analyze Resume
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Analysis Results */}
                {analysisResult && (
                    <>
                        {/* Analysis Summary - Dashboard Color Scheme */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Overall Match Score - Blue (like Total Jobs) */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Overall Match Score
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {analysisResult.job_match_score}%
                                </div>
                            </div>

                            {/* Resume Score - Light Green (like Applied Jobs) */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Resume Score
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {analysisResult.resume_score.overall_score}%
                                </div>
                            </div>

                            {/* Skills Found - Purple (like Selected) */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                        Skills Found
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {analysisResult.resume_score.keywords.length}
                                </div>
                            </div>
                        </div>

                        {/* Resume Suggestions - Orange/Amber Theme */}
                        {analysisResult.resume_score.suggestions.length > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-700 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">
                                    Resume Improvement Suggestions
                                </h3>
                                <div className="space-y-2">
                                    {analysisResult.resume_score.suggestions.map((suggestion, index) => (
                                        <div key={index} className="flex items-start gap-2 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-600">
                                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                                            <span className="text-orange-800 dark:text-orange-200 text-sm">
                                                {suggestion}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skill Gaps - Red Theme (like Rejected) */}
                        {analysisResult.skill_gap.skills.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-700 p-6 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
                                        Skill Gaps to Address
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.skill_gap.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-600"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Jobs - Teal/Cyan Theme */}
                        <div className="bg-cyan-50 dark:bg-cyan-900/10 rounded-xl border border-cyan-200 dark:border-cyan-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-cyan-600" />
                                <h2 className="text-xl font-semibold text-cyan-800 dark:text-cyan-200">
                                    Recommended Jobs
                                </h2>
                            </div>
                            <p className="text-cyan-700 dark:text-cyan-300 mb-6">
                                Based on your resume analysis
                            </p>

                            {/* Search and Filters - Exact match to Job Opportunities */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 p-6">
                                {/* Search Bar */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search jobs by title, skills, or company..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSearch}
                                        disabled={!searchTerm.trim()}
                                        className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Search
                                    </Button>

                                    {searchTerm && (
                                        <Button
                                            variant="outline"
                                            onClick={clearSearch}
                                            className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 h-10 w-full sm:w-auto"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                                        <span className="flex items-center gap-2">
                                            📊 <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, (filteredJobs.length > 0 ? filteredJobs.length : analysisResult.top_recommended_jobs.length))} of {filteredJobs.length > 0 ? filteredJobs.length : analysisResult.top_recommended_jobs.length} jobs
                                            </span>
                                        </span>
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                                            📄 Page {currentPage} of {totalPages} • {jobsPerPage} jobs per page
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Jobs Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getCurrentPageJobs().map((job, index) => {
                                    const jobApplicationStatus = applicationStatus.get(job.id)
                                    // Extract match score from job description
                                    const matchScoreMatch = job.description.match(/Match Score: (\d+(?:\.\d+)?)%/)
                                    const matchScore = matchScoreMatch ? parseFloat(matchScoreMatch[1]) : 0

                                    return (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onViewDescription={() => setSelectedJob(job)}
                                            onApply={() => handleApplyClick(job)}
                                            isApplying={applyingJobs.has(job.id)}
                                            applicationStatus={jobApplicationStatus}
                                            cardIndex={index}
                                            showMatchScore={true}
                                            matchScore={matchScore}
                                        />
                                    )
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                                        <div className="flex items-center gap-2">
                                            {/* Previous Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage <= 1}
                                                className="px-3 py-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ←
                                            </Button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    const pageNum = i + 1
                                                    const isCurrentPage = pageNum === currentPage
                                                    const isNearCurrent = Math.abs(pageNum - currentPage) <= 1
                                                    const isFirstOrLast = pageNum === 1 || pageNum === totalPages

                                                    if (isFirstOrLast || isNearCurrent) {
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={isCurrentPage ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handlePageChange(pageNum)}
                                                                className={`min-w-[32px] h-8 ${isCurrentPage
                                                                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
                                                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        )
                                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                        return <span key={pageNum} className="px-2 text-primary-400 dark:text-primary-300">...</span>
                                                    }
                                                    return null
                                                })}
                                            </div>

                                            {/* Next Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages}
                                                className="px-3 py-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                →
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800 dark:text-red-200">
                                {error}
                            </span>
                        </div>
                    </div>
                )}

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
            </motion.div>
        </StudentDashboardLayout>
    )
}

export default function CareerAlignPage() {
    return (
        <ErrorBoundary>
            <CareerAlignPageContent />
        </ErrorBoundary>
    )
}
