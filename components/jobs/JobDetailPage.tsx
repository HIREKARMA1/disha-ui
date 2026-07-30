"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Users,
  Building,
  Globe,
  ExternalLink,
  Shield,
  Download,
  Share2,
  CheckCircle,
  ChevronRight,
  Home,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { Button } from '@/components/ui/button'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import { corpHero } from '@/components/corporate/ui/corporate-theme'
import { apiClient } from '@/lib/api'
import { buildJobPath } from '@/lib/jobSlug'
import { formatSalaryRange } from '@/lib/currency'
import { downloadJobDescriptionPDF } from '@/lib/pdfGenerator'
import { formatEducationLabel, parseEducationField } from '@/lib/parseEducationField'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { profileService, type ProfileCompletionResponse } from '@/services/profileService'
import { canApplyForJobs, extractErrorDetail, isProfileCompletionError } from '@/lib/profileCompletion'
import { showProfileCompletionToast } from '@/lib/showProfileCompletionToast'
import type { Job } from '@/components/jobs/AllJobs'

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

interface JobDetailPageProps {
  companySlug: string
  jobSlug: string
}

function CompanyAvatar({
  logo,
  name,
  className = 'w-14 h-14',
}: {
  logo?: string | null
  name: string
  className?: string
}) {
  const initial = (name || '?').charAt(0).toUpperCase()
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className={cn(className, 'rounded-xl object-cover border border-gray-200 dark:border-white/10 bg-white shrink-0')}
      />
    )
  }
  return (
    <div
      className={cn(
        className,
        'rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white font-bold flex items-center justify-center shrink-0 border border-gray-200/50 dark:border-white/10'
      )}
    >
      {initial}
    </div>
  )
}

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
      <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded" />
      <div className={cn(corpHero, 'space-y-4')}>
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-5 w-1/3 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 rounded-[18px] bg-gray-100 dark:bg-white/5" />
      ))}
    </div>
  )
}

export function JobDetailPage({ companySlug, jobSlug }: JobDetailPageProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([])
  const [corporateProfile, setCorporateProfile] = useState<CorporateProfile | null>(null)
  const [loadingCorporate, setLoadingCorporate] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)

  const loadJob = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const data = await apiClient.getPublicJobBySlug(companySlug, jobSlug)
      setJob(data)
    } catch {
      setJob(null)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [companySlug, jobSlug])

  useEffect(() => {
    void loadJob()
  }, [loadJob])

  useEffect(() => {
    const checkAuth = async () => {
      const token = apiClient.getAccessToken()
      if (!token) return
      setIsLoggedIn(true)
      try {
        const completion = await profileService.getProfileCompletion()
        setProfileCompletion(completion)
      } catch {
        // ignore
      }
    }
    void checkAuth()
  }, [])

  useEffect(() => {
    if (!job) return

    const fetchCorporate = async () => {
      const corporateId = job.corporate_id
      const hasValidCorporateId =
        corporateId &&
        corporateId !== 'None' &&
        corporateId !== 'null' &&
        corporateId !== 'undefined' &&
        typeof corporateId === 'string' &&
        corporateId.trim() !== ''

      const isUniversityCreatedJob =
        !hasValidCorporateId &&
        Boolean(
          job.company_name ||
            job.company_logo ||
            job.company_website ||
            job.company_address ||
            job.company_description ||
            job.contact_person
        )

      if (isUniversityCreatedJob) {
        setCorporateProfile({
          id: job.id,
          company_name: job.company_name || job.corporate_name || 'Company',
          website_url: job.company_website,
          industry: job.industry,
          company_size: job.company_size,
          founded_year: job.company_founded,
          description: job.company_description,
          company_type: job.company_type,
          company_logo: job.company_logo,
          verified: false,
          contact_person: job.contact_person,
          contact_designation: job.contact_designation,
          address: job.company_address,
        })
        return
      }

      if (!hasValidCorporateId) {
        setCorporateProfile(null)
        return
      }

      setLoadingCorporate(true)
      try {
        const profile = await apiClient.getPublicCorporateProfile(corporateId as string)
        setCorporateProfile(profile)
      } catch {
        setCorporateProfile(null)
      } finally {
        setLoadingCorporate(false)
      }
    }

    void fetchCorporate()
  }, [job])

  useEffect(() => {
    if (!job) return
    let cancelled = false

    const fetchRelated = async () => {
      try {
        const response = await apiClient.client.get('/public/jobs/?limit=6&page=1&sort_by=created_at&sort_order=desc')
        const list: Job[] = response.data?.jobs || []
        if (!cancelled) {
          setRelatedJobs(list.filter((j) => j.id !== job.id).slice(0, 6))
        }
      } catch {
        if (!cancelled) setRelatedJobs([])
      }
    }

    void fetchRelated()
    return () => {
      cancelled = true
    }
  }, [job])

  const formatExperience = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return 'Not specified'
    if (min !== undefined && max !== undefined) return `${min}-${max} years`
    if (min !== undefined) return `${min}+ years`
    if (max !== undefined) return `Up to ${max} years`
    return 'Not specified'
  }

  const isDeadlineExpired = () => {
    if (!job?.application_deadline) return false
    return new Date(job.application_deadline) < new Date()
  }

  const canApply = () => {
    if (!job) return false
    return job.application_status !== 'applied' && !isDeadlineExpired() && job.can_apply
  }

  const handleApplyClick = () => {
    if (!job) return
    if (!isLoggedIn) {
      const returnUrl = encodeURIComponent(window.location.pathname)
      router.push(`/auth/login?redirect=${returnUrl}`)
      return
    }
    if (profileCompletion && !canApplyForJobs(profileCompletion)) {
      showProfileCompletionToast()
      return
    }
    if (!job.can_apply) {
      toast.error('Applications are closed for this job.')
      return
    }
    setShowApplicationModal(true)
  }

  const handleApplySubmit = async (data: {
    cover_letter?: string
    expected_salary?: string | number
    availability_date?: string
  }) => {
    if (!job) return
    try {
      setIsApplying(true)
      await apiClient.applyForJob(job.id, {
        job_id: job.id,
        cover_letter: data.cover_letter,
        expected_salary: data.expected_salary ? Number(data.expected_salary) : null,
        availability_date: data.availability_date,
      })
      toast.success('Application submitted successfully!')
      setShowApplicationModal(false)
      setJob((prev) =>
        prev ? { ...prev, application_status: 'applied', can_apply: false } : prev
      )
    } catch (error: unknown) {
      const detail = extractErrorDetail(error)
      if (isProfileCompletionError(detail)) {
        showProfileCompletionToast()
        return
      }
      toast.error(detail || 'Failed to submit application')
    } finally {
      setIsApplying(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!job) return
    setIsDownloadingPDF(true)
    try {
      const formatEducationForPDF = (data: string | string[] | undefined): string => {
        if (!data) return ''
        return parseEducationField(data).map((item) => formatEducationLabel(item)).join(', ')
      }

      const jobData = {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        job_type: job.job_type,
        location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
        remote_work: job.remote_work,
        travel_required: job.travel_required,
        onsite_office: job.mode_of_work
          ? job.mode_of_work === 'onsite' || job.mode_of_work === 'hybrid'
          : !job.remote_work,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_currency: job.salary_currency,
        experience_min: job.experience_min,
        experience_max: job.experience_max,
        education_level: formatEducationForPDF(job.education_level),
        education_degree: formatEducationForPDF(job.education_degree),
        education_branch: formatEducationForPDF(job.education_branch),
        skills_required: job.skills_required,
        application_deadline: job.application_deadline,
        industry: job.industry,
        selection_process: job.selection_process,
        campus_drive_date: job.campus_drive_date,
        corporate_name: job.corporate_name,
        corporate_id: job.corporate_id || undefined,
        created_at: job.created_at,
        number_of_openings: job.number_of_openings,
        perks_and_benefits: job.perks_and_benefits,
        eligibility_criteria: job.eligibility_criteria,
        service_agreement_details: job.service_agreement_details,
        expiration_date: job.expiration_date,
        status: job.status,
        ctc_with_probation: job.ctc_with_probation,
        ctc_after_probation: job.ctc_after_probation,
      }

      const success = await downloadJobDescriptionPDF(jobData, corporateProfile || undefined)
      if (success) toast.success('Job description PDF downloaded successfully!')
      else toast.error('Failed to generate PDF. Please try again.')
    } catch {
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = job ? `${job.title} at ${job.company_name || job.corporate_name}` : 'Job on DISHA'
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      }
    } catch {
      // user cancelled share
    }
  }

  const companyName = job?.company_name || job?.corporate_name || corporateProfile?.company_name || companySlug.replace(/-/g, ' ')
  const companyLogo = job?.company_logo || corporateProfile?.company_logo

  const renderContent = () => {
    if (loading) return <JobDetailSkeleton />

    if (notFound || !job) {
      return (
        <div className="max-w-lg mx-auto text-center py-16 px-4">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Job not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This job may have been removed or the link is incorrect.
          </p>
          <Button asChild>
            <Link href="/jobs">Browse Live Jobs</Link>
          </Button>
        </div>
      )
    }

    const locations = Array.isArray(job.location) ? job.location : job.location ? [job.location] : []
    const skills = job.skills_required || []

    return (
      <div className="max-w-5xl mx-auto pb-28 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/jobs" className="hover:text-blue-500 transition-colors">
            Jobs
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-none">{companyName}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[160px] sm:max-w-none">
            {job.title}
          </span>
        </nav>

        {/* Hero */}
        <div className={cn(corpHero, 'mb-6')}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <CompanyAvatar logo={companyLogo} name={companyName} className="w-16 h-16 sm:w-20 sm:h-20" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {job.title}
                </h1>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border',
                    job.status === 'active' || job.is_active
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10'
                  )}
                >
                  {job.status || (job.is_active ? 'Active' : 'Inactive')}
                </span>
              </div>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Building className="w-4 h-4 shrink-0" />
                {companyName}
              </p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <IndianRupee className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{formatExperience(job.experience_min, job.experience_max)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    {job.number_of_openings
                      ? `${job.number_of_openings} opening${job.number_of_openings > 1 ? 's' : ''}`
                      : 'Openings N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="truncate">
                    {locations.length > 0 ? locations.join(', ') : 'Location TBA'}
                  </span>
                </div>
              </div>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={`${skill}-${i}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 hidden sm:flex flex-wrap gap-2">
                <Button
                  onClick={handleApplyClick}
                  disabled={!canApply() || isApplying}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {job.application_status === 'applied'
                        ? 'Already Applied'
                        : isDeadlineExpired()
                          ? 'Expired'
                          : 'Apply Now'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
                  {isDownloadingPDF ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Company */}
        <CorporateGlassCard title="About the Company" className="mb-6">
          {loadingCorporate ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
            </div>
          ) : corporateProfile ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <CompanyAvatar
                logo={corporateProfile.company_logo}
                name={corporateProfile.company_name}
                className="w-16 h-16"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {corporateProfile.company_name}
                  </h2>
                  {corporateProfile.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {corporateProfile.industry && (
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Industry: </span>
                      <span className="text-gray-900 dark:text-white">{corporateProfile.industry}</span>
                    </p>
                  )}
                  {corporateProfile.company_size && (
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Company Size: </span>
                      <span className="text-gray-900 dark:text-white">{corporateProfile.company_size}</span>
                    </p>
                  )}
                  {corporateProfile.founded_year && (
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Founded: </span>
                      <span className="text-gray-900 dark:text-white">{corporateProfile.founded_year}</span>
                    </p>
                  )}
                  {corporateProfile.website_url && (
                    <p className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      <a
                        href={corporateProfile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  )}
                  {corporateProfile.address && (
                    <p className="sm:col-span-2 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-gray-900 dark:text-white">{corporateProfile.address}</span>
                    </p>
                  )}
                </div>
                {corporateProfile.description && (
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {corporateProfile.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Company information not available.</p>
          )}
        </CorporateGlassCard>

        {/* Job sections */}
        <div className="space-y-6">
          <CorporateGlassCard title="Job Description">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {job.description || 'No description provided.'}
            </p>
          </CorporateGlassCard>

          {job.responsibilities && (
            <CorporateGlassCard title="Responsibilities">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {job.responsibilities}
              </p>
            </CorporateGlassCard>
          )}

          {job.requirements && (
            <CorporateGlassCard title="Requirements">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </p>
            </CorporateGlassCard>
          )}

          {job.perks_and_benefits && (
            <CorporateGlassCard title="Benefits">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {job.perks_and_benefits}
              </p>
            </CorporateGlassCard>
          )}

          {job.selection_process && (
            <CorporateGlassCard title="Application Process">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {job.selection_process}
              </p>
            </CorporateGlassCard>
          )}
        </div>

        {/* Related jobs */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Jobs</h2>
          {relatedJobs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No related jobs at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedJobs.map((rel) => {
                const relCompany = rel.company_name || rel.corporate_name || 'Company'
                return (
                  <Link
                    key={rel.id}
                    href={buildJobPath(rel.slug, rel.company_name || rel.corporate_name, rel.title, rel.id)}
                    className="block rounded-xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#151b2b] p-4 hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <CompanyAvatar logo={rel.company_logo} name={relCompany} className="w-10 h-10" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {rel.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{relCompany}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {Array.isArray(rel.location) ? rel.location.join(', ') : rel.location || 'Remote'}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Sticky apply bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0D1628]/95 backdrop-blur-xl p-3 sm:p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{job.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{companyName}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
                <Download className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleApplyClick}
                disabled={!canApply() || isApplying}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white font-semibold min-w-[140px]"
              >
                {isApplying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : job.application_status === 'applied' ? (
                  'Applied'
                ) : isDeadlineExpired() ? (
                  'Expired'
                ) : (
                  'Apply Now'
                )}
              </Button>
            </div>
          </div>
        </div>

        {showApplicationModal && (
          <ApplicationModal
            job={job}
            isApplying={isApplying}
            onClose={() => setShowApplicationModal(false)}
            onSubmit={handleApplySubmit}
          />
        )}
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0a0c14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (user?.user_type === 'student') {
    return (
      <StudentDashboardLayout>
        <div className="pb-16 lg:pb-0 px-1 sm:px-0">{renderContent()}</div>
      </StudentDashboardLayout>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
      <Navbar variant="transparent" />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 max-w-[1600px] flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
}
