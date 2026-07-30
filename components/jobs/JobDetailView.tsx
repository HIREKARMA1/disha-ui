"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  ExternalLink,
  Globe,
  IndianRupee,
  Loader2,
  MapPin,
  Share2,
  Users,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { ApplicationModal } from '@/components/dashboard/ApplicationModal'
import { apiClient } from '@/lib/api'
import { formatSalaryRange } from '@/lib/currency'
import { downloadJobDescriptionPDF } from '@/lib/pdfGenerator'
import { useAuth } from '@/hooks/useAuth'
import { getJobDetailPath } from '@/lib/jobSlug'
import { profileService, type ProfileCompletionResponse } from '@/services/profileService'
import { canApplyForJobs, extractErrorDetail, isProfileCompletionError } from '@/lib/profileCompletion'
import { showProfileCompletionToast } from '@/lib/showProfileCompletionToast'
import { cn } from '@/lib/utils'
import type { Job } from '@/components/jobs/AllJobs'

interface JobDetailViewProps {
  companySlug: string
  jobSlug: string
  /** Optional UUID fallback when slug not yet backfilled (?id=) */
  fallbackJobId?: string | null
}

export function JobDetailView({ companySlug, jobSlug, fallbackJobId }: JobDetailViewProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [related, setRelated] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResponse | null>(null)

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
    if (!token) return
    profileService
      .getProfileCompletion()
      .then(setProfileCompletion)
      .catch(() => undefined)
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

  const handleApply = () => {
    if (!job) return
    if (!apiClient.getAccessToken()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(getJobDetailPath(job))}`)
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
      setJob({ ...job, application_status: 'applied', can_apply: false })
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

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: job?.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error('Unable to share')
    }
  }

  const handleDownloadPDF = async () => {
    if (!job || !canDownloadPdf) {
      toast.error('You do not have permission to download this PDF.')
      return
    }
    setIsDownloadingPDF(true)
    try {
      const ok = await downloadJobDescriptionPDF(
        {
          ...job,
          location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
        } as never,
        undefined
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
        <Navbar variant="transparent" />
        <div className="flex flex-grow items-center justify-center pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    )
  }

  if (!job || error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F7FB] dark:bg-[#0a0c14]">
        <Navbar variant="transparent" />
        <div className="flex flex-grow flex-col items-center justify-center gap-3 px-4 pt-24 text-center">
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
      <Navbar variant="transparent" />

      <div className="mx-auto w-full max-w-6xl flex-grow px-4 pb-28 pt-24 sm:px-6 lg:px-8">
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
            <Meta icon={IndianRupee} label="Salary" value={formatSalaryRange(job.salary_min, job.salary_max)} />
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
            <Button onClick={handleApply} disabled={!job.can_apply || job.application_status === 'applied'} className="bg-primary-500 hover:bg-primary-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              {job.application_status === 'applied' ? 'Already Applied' : 'Apply Now'}
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
          className="h-11 w-full bg-primary-500 hover:bg-primary-600"
          onClick={handleApply}
          disabled={!job.can_apply || job.application_status === 'applied'}
        >
          {job.application_status === 'applied' ? 'Already Applied' : 'Apply Now'}
        </Button>
      </div>

      <Footer />

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
