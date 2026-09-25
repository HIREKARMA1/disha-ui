'use client'

import Link from 'next/link'
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  Loader2,
  MapPin,
  Radio,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/jobs/CompanyLogo'
import type { QuickApplyJobInfo } from '@/components/jobs/QuickApplyModal'
import { getCampusDriveRequestApplyOverride } from '@/lib/campusDriveInterest'
import { getJobDetailPath } from '@/lib/jobSlug'
import { displayJobTitle } from '@/lib/jobSkillMatch'
import { cn } from '@/lib/utils'

export type JobsRightRailJob = QuickApplyJobInfo & {
  slug?: string | null
  company_name?: string
  corporate_name?: string
  application_status?: string
  campus_drive_request_status?: string | null
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
  /** True while a direct Quick Apply request is in flight */
  isApplying?: boolean
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

/**
 * Desktop right rail — Live Jobs highlight panel (compact selected preview + featured openings).
 * Quick Apply: direct submit when profile is ready; otherwise parent opens the 2-step modal.
 */
export function JobsLinkedInRightRail({
  job,
  highlightJobs = [],
  isLoggedIn,
  onSelectJob,
  onStartQuickApply,
  onGuestAuth,
  isApplying = false,
  className,
}: JobsLinkedInRightRailProps) {
  // All open jobs in this view (scrollable)
  const openJobs = highlightJobs

  return (
    <aside
      className={cn(
        'sticky top-20 z-[5] hidden h-fit w-full max-h-[calc(100vh-5.5rem)] self-start overflow-y-auto overscroll-contain lg:block',
        className
      )}
    >
      <div className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#1A2233] dark:bg-[#141A29]">
        {/* Live Jobs brand strip — Disha navy → cyan */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 px-4 py-3.5 text-white">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-8 h-20 w-20 rounded-full bg-white/5"
            aria-hidden
          />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Live now
            </div>
            <h2 className="mt-2 text-base font-semibold tracking-tight sm:text-lg">Live Jobs</h2>
            <p className="mt-0.5 text-xs text-white/80">
              Open roles you can apply to right away
            </p>
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
                    {displayJobTitle(job.title)}
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
                {(() => {
                  const requestOverride = getCampusDriveRequestApplyOverride(
                    job.campus_drive_request_status
                  )
                  if (job.application_status === 'applied') {
                    return (
                      <Button
                        disabled
                        size="sm"
                        className="h-9 w-full rounded-md bg-primary-600 text-xs font-semibold text-white shadow-none"
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Already Applied
                      </Button>
                    )
                  }
                  if (requestOverride === 'pending' || requestOverride === 'rejected') {
                    return (
                      <Button
                        disabled
                        size="sm"
                        className="h-9 w-full cursor-not-allowed rounded-md bg-gray-300 text-xs font-semibold text-white shadow-none dark:bg-gray-600"
                      >
                        {requestOverride === 'pending' ? 'Pending' : 'Rejected'}
                      </Button>
                    )
                  }
                  if (isLoggedIn) {
                    return (
                      <Button
                        type="button"
                        size="sm"
                        onClick={onStartQuickApply}
                        disabled={job.can_apply === false || isApplying}
                        className="h-9 w-full rounded-md bg-primary-600 text-xs font-semibold text-white shadow-none hover:bg-primary-700"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Applying…
                          </>
                        ) : (
                          <>
                            <Zap className="mr-1.5 h-3.5 w-3.5" />
                            Quick Apply
                          </>
                        )}
                      </Button>
                    )
                  }
                  return (
                    <Button
                      type="button"
                      size="sm"
                      onClick={onGuestAuth}
                      className="h-9 w-full rounded-md bg-primary-600 text-xs font-semibold text-white shadow-none hover:bg-primary-700"
                    >
                      <Zap className="mr-1.5 h-3.5 w-3.5" />
                      Sign in to Apply
                    </Button>
                  )
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full rounded-md border-gray-200 text-xs shadow-none dark:border-gray-600"
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
              <Radio className="mx-auto h-5 w-5 text-secondary-500" />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Select a job from the list to Quick Apply
              </p>
            </div>
          )}

          {/* Highlighted live openings */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-100">
                Highlighted openings
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#098855]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#098855]" />
                Accepting applications
              </span>
            </div>

            {openJobs.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                No open live jobs in this view yet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {openJobs.map((item) => {
                  const selected = job?.id === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectJob?.(item)}
                        className={cn(
                          'w-full rounded-xl border px-2.5 py-2 text-left transition-colors',
                          selected
                            ? 'border-primary-300 bg-primary-50/80 ring-1 ring-primary-200/60 dark:border-primary-600/50 dark:bg-primary-950/40 dark:ring-primary-700/40'
                            : 'border-gray-200/80 bg-white hover:border-primary-200 hover:bg-primary-50/40 dark:border-white/10 dark:bg-transparent dark:hover:border-primary-700/40 dark:hover:bg-primary-950/20'
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
                            <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 dark:text-white">
                              {displayJobTitle(item.title)}
                            </p>
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
                                <span className="font-medium text-primary-600 dark:text-primary-300">
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
