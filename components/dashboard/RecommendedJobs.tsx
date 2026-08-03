'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, Bookmark } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { formatSalaryRange } from '@/lib/currency'

interface RecJob {
  id: string
  title?: string
  company_name?: string
  corporate_name?: string
  location?: string | string[]
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
    // Fallback for authenticated student feed
    try {
      const res = await apiClient.getAvailableJobs(1, limit)
      const list = res?.jobs || res?.items || res?.data || []
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  }
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for You
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-400"
          >
            View All Jobs
          </Link>
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-64 h-36 shrink-0 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
          No live jobs available right now. Explore{' '}
          <Link href="/jobs" className="text-blue-500 font-semibold">
            Live Jobs
          </Link>
          .
        </p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-0.5 px-0.5"
        >
          {jobs.map((job) => {
            const company = job.company_name || job.corporate_name || 'Company'
            const initial = company.charAt(0).toUpperCase()
            const skillsRaw = job.skills_required || job.skills
            const skills = Array.isArray(skillsRaw)
              ? skillsRaw
              : typeof skillsRaw === 'string'
                ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
                : []
            const location = Array.isArray(job.location)
              ? job.location.join(', ')
              : job.location
            const salary =
              job.salary_min || job.salary_max
                ? formatSalaryRange(job.salary_min, job.salary_max)
                : null

            return (
              <button
                key={job.id}
                type="button"
                onClick={() => openJob(job.id)}
                className="w-64 shrink-0 text-left rounded-xl border border-gray-200/70 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.03] p-3 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold flex items-center justify-center shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        {job.title || 'Job Opening'}
                      </h3>
                      <Bookmark className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {company}
                    </p>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {location && (
                    <p className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {location}
                    </p>
                  )}
                  {salary && <p className="truncate">{salary}</p>}
                </div>
                {skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {skills.slice(0, 2).map((s) => (
                      <span
                        key={String(s)}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400"
                      >
                        {String(s)}
                      </span>
                    ))}
                    {skills.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-gray-500">
                        +{skills.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </StudentSectionCard>
  )
}
