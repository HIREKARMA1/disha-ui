'use client'

import Link from 'next/link'
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  MapPin,
  Radio,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import type { QuickApplyJobInfo } from '@/components/jobs/QuickApplyModal'
import { getJobDetailPath } from '@/lib/jobSlug'
import { cn } from '@/lib/utils'

export type JobsRightRailJob = QuickApplyJobInfo & {
  slug?: string | null
  company_name?: string
  corporate_name?: string
  application_status?: string
  can_apply?: boolean
  description?: string
  match_score?: number
  status?: string
}

interface JobsLinkedInRightRailProps {
  /** Currently selected job (compact preview) */
  job: JobsRightRailJob | null
  /** Open / highlighted live jobs to feature in the rail */
  highlightJobs?: JobsRightRailJob[]
  isLoggedIn: boolean
  /** @deprecated Form always opens as modal */
  showApplyForm?: boolean
  onSelectJob?: (job: JobsRightRailJob) => void
  onStartQuickApply: () => void
  onGuestAuth: () => void
  onApplySuccess?: () => void
  onCloseApplyForm?: () => void
  className?: string
}

function formatLocation(location?: string | string[]): string {
  if (!location) return 'Location not specified'
  return Array.isArray(location) ? location.filter(Boolean).join(', ') : String(location)
}

function companyOf(job: JobsRightRailJob): string {
  return job.company_name || job.corporate_name || 'Company'
}

function matchBadgeClass(score: number): string {
  if (score >= 70) return 'bg-emerald-500 text-white'
  if (score >= 40) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

/**
 * Desktop right rail — Live Jobs highlight panel (compact selected preview + featured openings).
 * Quick Apply opens as a centered modal, not inline.
 */
export function JobsLinkedInRightRail({
  job,
  highlightJobs = [],
  isLoggedIn,
  onSelectJob,
  onStartQuickApply,
  onGuestAuth,
  className,
}: JobsLinkedInRightRailProps) {
  const featured = highlightJobs.slice(0, 6)
  const openCount = highlightJobs.length

  return (
    <aside
      className={cn(
        'sticky top-20 hidden max-h-[calc(100vh-5.5rem)] self-start overflow-y-auto overscroll-contain lg:block',
        className
      )}
    >
      <div className="overflow-hidden rounded-2xl border border-blue-200/60 bg-white shadow-sm dark:border-blue-500/20 dark:bg-[#151b2b]/95">
        {/* Live Jobs brand strip */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-4 py-4 text-white">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-white/5"
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>
                Live now
              </div>
              <h2 className="mt-2 text-lg font-bold tracking-tight">Live Jobs</h2>
              <p className="mt-0.5 text-xs text-blue-100">
                Open roles you can apply to right away
              </p>
            </div>
            <div className="rounded-xl bg-white/15 px-2.5 py-1.5 text-center backdrop-blur-sm">
              <p className="text-lg font-bold tabular-nums leading-none">{openCount || '—'}</p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-blue-100">
                Open
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          {/* Compact selected job */}
          {job ? (
            <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Selected
              </p>
              <div className="flex items-start gap-2.5">
                <CompanyLogo
                  logoUrl={job.company_logo}
                  companyName={companyOf(job)}
                  size="sm"
                  className="shrink-0 rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                    {job.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-600 dark:text-gray-300">
                    {companyOf(job)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {formatLocation(job.location)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                {job.application_status === 'applied' ? (
                  <Button
                    disabled
                    size="sm"
                    className="h-9 w-full rounded-lg bg-blue-600 text-xs font-semibold text-white"
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Already Applied
                  </Button>
                ) : isLoggedIn ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={onStartQuickApply}
                    disabled={job.can_apply === false}
                    className="h-9 w-full rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    Quick Apply
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={onGuestAuth}
                    className="h-9 w-full rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    Sign in to Apply
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full rounded-lg text-xs"
                  asChild
                >
                  <Link href={getJobDetailPath(job as Parameters<typeof getJobDetailPath>[0])}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Full details
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center dark:border-white/10">
              <Radio className="mx-auto h-5 w-5 text-blue-500" />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Select a job from the list to Quick Apply
              </p>
            </div>
          )}

          {/* Highlighted live openings */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100">
                Highlighted openings
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Accepting applications
              </span>
            </div>

            {featured.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                No open live jobs in this view yet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {featured.map((item) => {
                  const selected = job?.id === item.id
                  const score =
                    typeof item.match_score === 'number' && item.match_score > 0
                      ? Math.round(item.match_score)
                      : null
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectJob?.(item)}
                        className={cn(
                          'w-full rounded-xl border px-2.5 py-2 text-left transition-colors',
                          selected
                            ? 'border-blue-400 bg-blue-50/80 ring-1 ring-blue-400/30 dark:border-blue-500/50 dark:bg-blue-950/40'
                            : 'border-gray-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/40 dark:border-white/10 dark:bg-transparent dark:hover:border-blue-500/30 dark:hover:bg-blue-950/20'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <CompanyLogo
                            logoUrl={item.company_logo}
                            companyName={companyOf(item)}
                            size="sm"
                            className="mt-0.5 shrink-0 rounded-md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 dark:text-white">
                                {item.title}
                              </p>
                              {score !== null && (
                                <span
                                  className={cn(
                                    'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold',
                                    matchBadgeClass(score)
                                  )}
                                >
                                  {score}%
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400">
                              {companyOf(item)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                              {item.job_type && (
                                <span className="inline-flex items-center gap-0.5">
                                  <Briefcase className="h-2.5 w-2.5" />
                                  {String(item.job_type).replace(/_/g, ' ')}
                                </span>
                              )}
                              {item.application_status === 'applied' && (
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  Applied
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
