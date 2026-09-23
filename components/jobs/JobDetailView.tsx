"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Share2,
  Users,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { SalaryBadge, hasJobSalary } from '@/components/jobs/SalaryBadge'
import { ShareJobModal } from '@/components/jobs/ShareJobModal'
import { JobAdditionalInfo } from '@/components/jobs/JobAdditionalInfo'
import { QuickApplyModal } from '@/components/jobs/QuickApplyModal'
import { PostQuickApplySkillsNudgeDialog } from '@/components/jobs/PostQuickApplySkillsNudgeDialog'
import { apiClient } from '@/lib/api'
import { formatSalaryRange } from '@/lib/currency'
import { downloadJobDescriptionPDF } from '@/lib/pdfGenerator'
import { useAuth } from '@/hooks/useAuth'
import { getJobDetailPath } from '@/lib/jobSlug'
import { profileService } from '@/services/profileService'
import { prepareGuestApplyForLogin } from '@/lib/pendingJobApplication'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import {
  CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE,
  JOB_CLOSED_MESSAGE,
  PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE,
  clearAutoApplyQueryParams,
  getPassoutBatchApplyEligibility,
  getUniversityApplyEligibility,
  isCampusDriveNotForUniversityMessage,
  shouldAutoApplyForJob,
} from '@/lib/jobApplicationMessages'
import {
  resolveCampusDriveInterestOutcome,
  submitCampusDriveInterest,
  toastCampusDriveRequestStatus,
  getCampusDriveRequestApplyOverride,
} from '@/lib/campusDriveInterest'
import { CampusDriveInterestModal } from '@/components/jobs/CampusDriveInterestModal'
import type { Job } from '@/components/jobs/AllJobs'
import { parseEducationField } from '@/lib/parseEducationField'
import { formatPassoutBatchLabel } from '@/lib/passoutBatches'
import { shouldShowPostApplySkillsNudge } from '@/lib/profileCompletion'

interface JobDetailViewProps {
  companySlug: string
  jobSlug: string
  /** Optional UUID fallback when slug not yet backfilled (?id=) */
  fallbackJobId?: string | null
}

export function JobDetailView({ companySlug, jobSlug, fallbackJobId }: JobDetailViewProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const [job, setJob] = useState<Job | null>(null)
  const [related, setRelated] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const autoApplyAttempted = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false)
  const [showSkillsNudge, setShowSkillsNudge] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const closeShareModal = useCallback(() => setShowShareModal(false), [])
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [studentUniversityId, setStudentUniversityId] = useState<string | null>(null)
  const [studentGraduationYear, setStudentGraduationYear] = useState<number | null>(null)
  const [studentBatch, setStudentBatch] = useState<string | null>(null)
  const [studentProfileLoaded, setStudentProfileLoaded] = useState(false)
  const [showCampusDriveInterestModal, setShowCampusDriveInterestModal] = useState(false)
  const [campusDriveInterestSubmitting, setCampusDriveInterestSubmitting] = useState(false)
  const [hasAcceptedCampusDriveRequest, setHasAcceptedCampusDriveRequest] = useState(false)

  const canDownloadPdf =
    isAuthenticated &&
    !!user &&
    (user.user_type === 'admin' || user.user_type === 'corporate' || user.user_type === 'university')

  const loadJob = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.client.get(
        `/public/jobs/by-slug/${encodeURIComponent(companySlug)}/${encodeURIComponent(jobSlug)}`
      )
      setJob(response.data)
      if (response.data?.campus_drive_request_status === 'accepted') {
        setHasAcceptedCampusDriveRequest(true)
      }
    } catch (err: unknown) {
      // Fallback: load by id if provided
      if (fallbackJobId) {
        try {
          const byId = await apiClient.client.get(`/public/jobs/`, {
            params: { page: 1, limit: 100 },
          })
          const match = (byId.data?.jobs || []).find((j: Job) => j.id === fallbackJobId)
          if (match) {
            setJob(match)
            if (match.campus_drive_request_status === 'accepted') {
              setHasAcceptedCampusDriveRequest(true)
            }
            return
          }
        } catch {
          // ignore
        }
      }
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Job not found')
      setJob(null)
    } finally {
      setLoading(false)
    }
  }, [companySlug, jobSlug, fallbackJobId])

  useEffect(() => {
    void loadJob()
  }, [loadJob])

  useEffect(() => {
    const token = apiClient.getAccessToken()
    if (!token) {
      setStudentProfileLoaded(true)
      return
    }
    profileService
      .getProfile()
      .then((profile) => {
        setStudentUniversityId(profile.university_id || null)
        setStudentGraduationYear(profile.graduation_year ?? null)
        setStudentBatch((profile as { batch?: string }).batch || null)
      })
      .catch(() => undefined)
      .finally(() => setStudentProfileLoaded(true))
  }, [])

  useEffect(() => {
    if (!job?.id) return
    // Related: same industry via public list
    apiClient.client
      .get('/public/jobs/', {
        params: {
          page: 1,
          limit: 6,
          ...(job.industry ? { industry: job.industry } : {}),
        },
      })
      .then((res) => {
        const jobs = (res.data?.jobs || []).filter((j: Job) => j.id !== job.id).slice(0, 4)
        setRelated(jobs)
      })
      .catch(() => setRelated([]))
  }, [job?.id, job?.industry])

  const companyName = job?.company_name || job?.corporate_name || 'Company'

  // After login/register from Quick Apply: gate campus-drive, then open Quick Apply form
  useEffect(() => {
    if (!job || authLoading || !studentProfileLoaded || autoApplyAttempted.current) return
    if (!shouldAutoApplyForJob(job.id)) return

    const token = apiClient.getAccessToken()
    if (!token) {
      autoApplyAttempted.current = true
      const redirect = prepareGuestApplyForLogin(job.id, getJobDetailPath(job))
      openLoginModal({ redirect, preferredType: 'student' })
      return
    }
    if (user && user.user_type !== 'student') {
      clearAutoApplyQueryParams()
      autoApplyAttempted.current = true
      return
    }

    autoApplyAttempted.current = true
    clearAutoApplyQueryParams()

    void (async () => {
      const universityEligibility = getUniversityApplyEligibility({
        isPublic: job.is_public,
        publicAccessLevel: job.public_access_level,
        assignedUniversityIds: job.assigned_university_ids,
        isAuthenticatedStudent: Boolean(user?.user_type === 'student'),
        studentUniversityId,
        isCampusDrive: Boolean(job.is_campus_drive),
        hasAcceptedCampusDriveRequest:
          hasAcceptedCampusDriveRequest || job.campus_drive_request_status === 'accepted',
      })
      if (!universityEligibility.canApply) {
        const reason =
          universityEligibility.reason || CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE
        if (isCampusDriveNotForUniversityMessage(reason)) {
          const { outcome } = await resolveCampusDriveInterestOutcome(job.id)
          if (outcome === 'accepted') {
            setHasAcceptedCampusDriveRequest(true)
            setJob((prev) =>
              prev ? { ...prev, campus_drive_request_status: 'accepted' } : prev
            )
            setShowQuickApplyModal(true)
            return
          }
          if (outcome === 'pending' || outcome === 'rejected') {
            setJob((prev) =>
              prev ? { ...prev, campus_drive_request_status: outcome } : prev
            )
            toastCampusDriveRequestStatus(outcome)
            return
          }
          if (outcome === 'show_interest_modal') {
            setShowCampusDriveInterestModal(true)
            return
          }
        }
        toast.error(reason)
        return
      }

      const batchEligibility = getPassoutBatchApplyEligibility({
        passoutBatches: job.passout_batches,
        isAuthenticatedStudent: Boolean(user?.user_type === 'student'),
        studentGraduationYear,
        studentBatch,
      })
      if (!batchEligibility.canApply) {
        toast.error(batchEligibility.reason || PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE)
        return
      }

      setShowQuickApplyModal(true)
    })()
  }, [
    job,
    authLoading,
    studentProfileLoaded,
    user,
    openLoginModal,
    studentUniversityId,
    studentGraduationYear,
    studentBatch,
    hasAcceptedCampusDriveRequest,
  ])

  const requestApplyOverride = getCampusDriveRequestApplyOverride(
    job?.campus_drive_request_status
  )
  const applyDisabled =
    !job?.can_apply ||
    job?.application_status === 'applied' ||
    Boolean(requestApplyOverride)
  const applyLabel =
    job?.application_status === 'applied'
      ? 'Already Applied'
      : requestApplyOverride === 'pending'
        ? 'Pending'
        : requestApplyOverride === 'rejected'
          ? 'Rejected'
          : 'Quick Apply'

  const handleApply = async () => {
    if (!job) return
    if (!apiClient.getAccessToken()) {
      const redirect = prepareGuestApplyForLogin(job.id, getJobDetailPath(job))
      openLoginModal({ redirect, preferredType: 'student' })
      return
    }
    if (job.application_status === 'applied') return
    const requestOverride = getCampusDriveRequestApplyOverride(
      job.campus_drive_request_status
    )
    if (requestOverride === 'pending' || requestOverride === 'rejected') {
      toastCampusDriveRequestStatus(requestOverride)
      return
    }
    if (!job.can_apply) {
      toast.error(JOB_CLOSED_MESSAGE)
      return
    }

    const universityEligibility = getUniversityApplyEligibility({
      isPublic: job.is_public,
      publicAccessLevel: job.public_access_level,
      assignedUniversityIds: job.assigned_university_ids,
      isAuthenticatedStudent: Boolean(isAuthenticated && user?.user_type === 'student'),
      studentUniversityId,
      isCampusDrive: Boolean(job.is_campus_drive),
      hasAcceptedCampusDriveRequest:
        hasAcceptedCampusDriveRequest || job.campus_drive_request_status === 'accepted',
    })
    if (!universityEligibility.canApply) {
      const reason = universityEligibility.reason || CAMPUS_DRIVE_NOT_FOR_UNIVERSITY_MESSAGE
      if (isCampusDriveNotForUniversityMessage(reason)) {
        const { outcome } = await resolveCampusDriveInterestOutcome(job.id)
        if (outcome === 'accepted') {
          setHasAcceptedCampusDriveRequest(true)
          setJob((prev) =>
            prev ? { ...prev, campus_drive_request_status: 'accepted' } : prev
          )
        } else if (outcome === 'pending' || outcome === 'rejected') {
          setJob((prev) =>
            prev ? { ...prev, campus_drive_request_status: outcome } : prev
          )
          toastCampusDriveRequestStatus(outcome)
          return
        } else if (outcome === 'show_interest_modal') {
          setShowCampusDriveInterestModal(true)
          return
        } else {
          toast.error(reason)
          return
        }
      } else {
        toast.error(reason)
        return
      }
    }

    const batchEligibility = getPassoutBatchApplyEligibility({
      passoutBatches: job.passout_batches,
      isAuthenticatedStudent: Boolean(
        isAuthenticated && user?.user_type === 'student'
      ),
      studentGraduationYear,
      studentBatch,
    })
    if (!batchEligibility.canApply) {
      toast.error(batchEligibility.reason || PASSOUT_BATCH_NOT_ELIGIBLE_MESSAGE)
      return
    }
    setShowQuickApplyModal(true)
  }

  const handleCampusDriveStillInterested = async () => {
    if (!job || campusDriveInterestSubmitting) return
    setCampusDriveInterestSubmitting(true)
    try {
      const result = await submitCampusDriveInterest(job.id)
      if (result.ok) {
        setShowCampusDriveInterestModal(false)
        if (result.status) {
          setJob((prev) =>
            prev ? { ...prev, campus_drive_request_status: result.status } : prev
          )
        }
        if (result.status === 'accepted') {
          setHasAcceptedCampusDriveRequest(true)
        }
      }
    } finally {
      setCampusDriveInterestSubmitting(false)
    }
  }

  const handleCampusDriveInterestFromQuickApply = (
    status?: 'pending' | 'accepted' | 'rejected'
  ) => {
    if (!job) return
    if (status) {
      setJob((prev) =>
        prev ? { ...prev, campus_drive_request_status: status } : prev
      )
    }
    if (status === 'accepted') {
      setHasAcceptedCampusDriveRequest(true)
    }
    setShowQuickApplyModal(false)
  }

  const handleQuickApplySuccess = () => {
    if (!job) return
    setShowQuickApplyModal(false)
    setJob({ ...job, application_status: 'applied', can_apply: false })
    void (async () => {
      try {
        const completion = await profileService.getProfileCompletion()
        if (shouldShowPostApplySkillsNudge(completion)) {
          setShowSkillsNudge(true)
        }
      } catch {
        // Profile already may be complete — skip nudge if we can't verify
      }
    })()
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleDownloadPDF = async () => {
    if (!job || !canDownloadPdf) {
      toast.error('You do not have permission to download this PDF.')
      return
    }
    setIsDownloadingPDF(true)
    try {
      // Build profile from job payload so logo/name are available without a separate fetch.
      // Shared PDF generator also falls back to job.company_logo / job.company_name.
      const corporateProfileFromJob = {
        id: job.corporate_id || job.id,
        company_name: job.company_name || job.corporate_name,
        company_logo: job.company_logo,
        website_url: job.company_website,
        industry: job.industry,
        company_size: job.company_size,
        founded_year: job.company_founded,
        description: job.company_description,
        company_type: job.company_type,
        address: job.company_address,
        contact_person: job.contact_person,
        contact_designation: job.contact_designation,
      }
      const ok = await downloadJobDescriptionPDF(
        {
          ...job,
          location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
        } as never,
        corporateProfileFromJob
      )
      if (ok) toast.success('PDF downloaded')
      else toast.error('Failed to generate PDF')
    } catch {
      toast.error('Failed to generate PDF')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
        <DishaTopBar showSearch={false} />
        <div className="flex flex-grow items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (!job || error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
        <DishaTopBar showSearch={false} />
        <div className="flex flex-grow flex-col items-center justify-center gap-3 px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h1>
          <p className="text-gray-500">{error || 'This job may have been removed or the link is invalid.'}</p>
          <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const locationLabel = Array.isArray(job.location) ? job.location.join(', ') : job.location || 'TBA'
  const skills = Array.isArray(job.skills_required) ? job.skills_required : []

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
      <DishaTopBar showSearch={false} />

      <div className="mx-auto w-full max-w-6xl flex-grow px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-primary-500">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-primary-500">Jobs</Link>
          <span>/</span>
          <span className="truncate text-gray-700 dark:text-gray-300">{companyName}</span>
          <span>/</span>
          <span className="truncate font-medium text-gray-900 dark:text-white">{job.title}</span>
        </nav>

        <button
          type="button"
          onClick={() => router.push('/jobs')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </button>

        {/* Hero */}
        <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#151b2b]">
          <div className="bg-gradient-to-r from-primary-600/90 to-secondary-500/90 px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <CompanyLogo logoUrl={job.company_logo} companyName={companyName} size="xl" className="bg-white" />
              <div className="min-w-0 flex-1 text-white">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase">
                    {String(job.job_type || '').replace(/_/g, ' ')}
                  </span>
                  <span className="rounded-md bg-emerald-500/30 px-2 py-0.5 text-xs font-semibold">
                    {job.status || 'active'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-white/90">{companyName}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-b border-gray-100 p-5 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/30">
                <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Salary</p>
                {hasJobSalary(job.salary_min, job.salary_max) ? (
                  <div className="mt-1">
                    <SalaryBadge salaryMin={job.salary_min} salaryMax={job.salary_max} />
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatSalaryRange(job.salary_min, job.salary_max)}
                  </p>
                )}
              </div>
            </div>
            <Meta
              icon={Briefcase}
              label="Experience"
              value={
                job.experience_min != null || job.experience_max != null
                  ? `${job.experience_min ?? 0}–${job.experience_max ?? '+'} yrs`
                  : 'Not specified'
              }
            />
            <Meta icon={Users} label="Openings" value={String(job.number_of_openings ?? '—')} />
            <Meta icon={MapPin} label="Location" value={locationLabel} />
          </div>

          <div className="flex flex-wrap gap-2 p-5 sm:p-6">
            <Button
              onClick={handleApply}
              disabled={applyDisabled}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {applyLabel}
            </Button>
            {canDownloadPdf && (
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloadingPDF ? 'Generating…' : 'Download PDF'}
              </Button>
            )}
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            {skills.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Job Description">
              <Prose text={job.description} />
            </Section>

            {job.responsibilities && (
              <Section title="Responsibilities">
                <Prose text={job.responsibilities} />
              </Section>
            )}

            {job.requirements && (
              <Section title="Requirements">
                <Prose text={job.requirements} />
              </Section>
            )}

            {parseEducationField(job.passout_batches).length > 0 && (
              <Section title="Targeted Passout Batches">
                <div className="flex flex-wrap gap-2">
                  {parseEducationField(job.passout_batches).map((batch) => (
                    <span
                      key={batch}
                      className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      {formatPassoutBatchLabel(batch)}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {job.perks_and_benefits && (
              <Section title="Benefits">
                <Prose text={job.perks_and_benefits} />
              </Section>
            )}

            {job.selection_process && (
              <Section title="Application Process">
                <Prose text={job.selection_process} />
              </Section>
            )}

            <JobAdditionalInfo
              locationLabel={locationLabel}
              experienceMin={job.experience_min}
              experienceMax={job.experience_max}
              salaryMin={job.salary_min}
              salaryMax={job.salary_max}
              jobType={job.job_type}
              modeOfWork={job.mode_of_work}
              remoteWork={job.remote_work}
            />

            {related.length > 0 && (
              <Section title="Related Jobs">
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={getJobDetailPath(r)}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-primary-300 dark:border-white/10"
                    >
                      <CompanyLogo
                        logoUrl={r.company_logo}
                        companyName={r.company_name || r.corporate_name}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">{r.title}</p>
                        <p className="truncate text-sm text-gray-500">
                          {r.company_name || r.corporate_name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Company sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151b2b]">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Company</h2>
              <div className="mb-4 flex items-center gap-3">
                <CompanyLogo logoUrl={job.company_logo} companyName={companyName} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{companyName}</p>
                  {job.industry && <p className="text-sm text-gray-500">{job.industry}</p>}
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                {job.company_size && (
                  <li className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary-500" /> Size: {job.company_size}
                  </li>
                )}
                {job.company_founded && (
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary-500" /> Founded: {job.company_founded}
                  </li>
                )}
                {job.company_website && (
                  <li>
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:underline"
                    >
                      <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                )}
                {job.company_address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    {job.company_address}
                  </li>
                )}
              </ul>
              {job.company_description && (
                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/10">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">About Company</p>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-6">
                    {job.company_description}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky apply */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:hidden">
        <Button
          className="h-11 w-full bg-blue-600 hover:bg-blue-500"
          onClick={handleApply}
          disabled={applyDisabled}
        >
          {applyLabel}
        </Button>
      </div>

      <Footer />

      {showQuickApplyModal && (
        <QuickApplyModal
          job={job}
          onClose={() => setShowQuickApplyModal(false)}
          onSuccess={handleQuickApplySuccess}
          onCampusDriveInterestSubmitted={handleCampusDriveInterestFromQuickApply}
        />
      )}

      <PostQuickApplySkillsNudgeDialog
        isOpen={showSkillsNudge}
        onClose={() => setShowSkillsNudge(false)}
      />

      <CampusDriveInterestModal
        isOpen={showCampusDriveInterestModal}
        onClose={() => {
          if (campusDriveInterestSubmitting) return
          setShowCampusDriveInterestModal(false)
        }}
        onStillInterested={handleCampusDriveStillInterested}
        isSubmitting={campusDriveInterestSubmitting}
      />

      <ShareJobModal
        isOpen={showShareModal}
        onClose={closeShareModal}
        job={job}
      />
    </div>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 rounded-lg bg-primary-50 p-2 dark:bg-primary-900/30">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151b2b] sm:p-6">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      {children}
    </section>
  )
}

function Prose({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {text}
    </div>
  )
}
