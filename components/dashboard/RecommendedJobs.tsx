'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, Bookmark, Briefcase, ArrowRight } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import { formatSalaryRange } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface RecJob {
  id: string
  title?: string
  company_name?: string
  corporate_name?: string
  company_logo?: string
  location?: string | string[]
  job_type?: string
  salary_min?: number
  salary_max?: number
  skills_required?: string[]
  skills?: string[] | string
}

/** Fetch the same public Live Jobs list used on /jobs */
async function fetchLiveJobs(limit = 8): Promise<RecJob[]> {
  const params = new URLSearchParams()
  params.set('page', '1')
  params.set('limit', String(limit))
  params.set('sort_by', 'created_at')
  params.set('sort_order', 'desc')

  try {
    const response = await apiClient.client.get(`/public/jobs/?${params}`)
    const data = response.data
    const list = data?.jobs || data?.items || data?.data || []
    return Array.isArray(list) ? list : []
  } catch {
    try {
      const res = await apiClient.getAvailableJobs(1, limit)
      const list = res?.jobs || res?.items || res?.data || []
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  }
}

function jobTypeLabel(type?: string) {
  if (!type) return null
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function RecommendedJobs({ className = '' }: { className?: string }) {
  const [jobs, setJobs] = useState<RecJob[]>([])
  const [loading, setLoading] = useState(true)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const list = await fetchLiveJobs(8)
      if (!cancelled) {
        setJobs(list.slice(0, 8))
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const scroll = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  const openJob = (jobId: string) => {
    router.push(`/jobs?jobId=${encodeURIComponent(jobId)}`)
  }

  return (
    <StudentSectionCard className={className} padding="md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
          <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
          Recommended for You
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/jobs"
            className={cn(
              'group inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5',
              'text-xs font-semibold text-primary-700 shadow-sm transition-colors sm:text-sm',
              'hover:border-primary-400 hover:bg-primary-100',
              'dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/60'
            )}
          >
            <span>View All Jobs</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </span>
          </Link>
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 w-64 shrink-0 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No live jobs available right now. Explore{' '}
          <Link href="/jobs" className="font-semibold text-primary-600 hover:underline">
            Live Jobs
          </Link>
          .
        </p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {jobs.map((job) => {
            const company = job.company_name || job.corporate_name || 'Company'
            const skillsRaw = job.skills_required || job.skills
            const skills = Array.isArray(skillsRaw)
              ? skillsRaw
              : typeof skillsRaw === 'string'
                ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
                : []
            const location = Array.isArray(job.location)
              ? job.location.filter(Boolean).join(', ')
              : job.location
            const salary =
              job.salary_min || job.salary_max
                ? formatSalaryRange(job.salary_min, job.salary_max)
                : null
            const typeLabel = jobTypeLabel(job.job_type)

            return (
              <button
                key={job.id}
                type="button"
                onClick={() => openJob(job.id)}
                className={cn(
                  'flex w-[min(100%,16rem)] shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm',
                  'transition-[box-shadow,border-color] duration-200',
                  'hover:border-primary-200 hover:shadow-md',
                  'dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary-800',
                  'sm:w-64'
                )}
              >
                <div className="flex flex-1 flex-col p-3.5">
                  <div className="flex items-start gap-3">
                    <CompanyLogo logoUrl={job.company_logo} companyName={company} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 dark:text-white">
                          {job.title || 'Job Opening'}
                        </h3>
                        <Bookmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </div>
                      <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                        {company}
                      </p>
                      {typeLabel && (
                        <span className="mt-1 inline-block rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    {location && (
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{location}</span>
                      </span>
                    )}
                    {salary && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {salary}
                      </span>
                    )}
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {skills.slice(0, 2).map((s) => (
                        <span
                          key={String(s)}
                          className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                        >
                          {String(s)}
                        </span>
                      ))}
                      {skills.length > 2 && (
                        <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                          +{skills.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 px-3.5 py-2.5 dark:border-gray-800">
                  <span className="flex h-8 w-full items-center justify-center rounded-md bg-primary-600 text-xs font-medium text-white">
                    View job
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </StudentSectionCard>
  )
}
