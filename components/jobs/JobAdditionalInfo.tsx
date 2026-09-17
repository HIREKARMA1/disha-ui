'use client'

import { Banknote, Briefcase, Clock, MapPin, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatAmountINR, formatSalaryRange } from '@/lib/currency'
import { hasJobSalary } from '@/components/jobs/SalaryBadge'
import { cn } from '@/lib/utils'

interface JobAdditionalInfoProps {
  locationLabel: string
  experienceMin?: number | null
  experienceMax?: number | null
  salaryMin?: number | null
  salaryMax?: number | null
  jobType?: string | null
  modeOfWork?: string | null
  remoteWork?: boolean
}

function formatExperienceDetail(min?: number | null, max?: number | null): string {
  const hasMin = min != null && !Number.isNaN(Number(min))
  const hasMax = max != null && !Number.isNaN(Number(max))

  if (!hasMin && !hasMax) return 'Not specified'
  if (hasMin && Number(min) === 0 && (!hasMax || Number(max) === 0)) {
    return 'No prior experience required'
  }
  if (hasMin && hasMax) return `${Number(min)}–${Number(max)} years`
  if (hasMin) return `${Number(min)}+ years`
  if (hasMax) return `Up to ${Number(max)} years`
  return 'Not specified'
}

function formatJobTiming(jobType?: string | null): string {
  if (!jobType) return 'Not specified'
  const labels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  }
  return labels[jobType] || String(jobType).replace(/_/g, ' ')
}

function formatWorkMode(modeOfWork?: string | null, remoteWork?: boolean): string {
  if (modeOfWork) {
    const labels: Record<string, string> = {
      hybrid: 'Hybrid',
      onsite: 'In Office',
      remote: 'Remote',
      in_office: 'In Office',
    }
    return labels[modeOfWork] || String(modeOfWork).replace(/_/g, ' ')
  }
  if (remoteWork) return 'Remote'
  return 'In Office'
}

function InfoCard({
  icon: Icon,
  label,
  children,
  emphasized = false,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
  emphasized?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-stretch gap-0 overflow-hidden rounded-xl border',
        emphasized
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-900/15'
          : 'border-gray-200 bg-white dark:border-white/10 dark:bg-[#151b2b]'
      )}
    >
      <div className="flex w-14 shrink-0 items-center justify-center sm:w-16">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            emphasized
              ? 'bg-emerald-100 dark:bg-emerald-900/40'
              : 'bg-primary-50 dark:bg-primary-900/30'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              emphasized
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-primary-600 dark:text-primary-400'
            )}
          />
        </div>
      </div>
      <div className="w-px self-stretch bg-gray-200 dark:bg-white/10" aria-hidden />
      <div className="min-w-0 flex-1 px-4 py-3.5 sm:px-5">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
        <div className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300 break-words">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Highlighted Additional Information block for the Job Details page.
 * Displays backend-provided location, experience, salary, and job type/timing.
 */
export function JobAdditionalInfo({
  locationLabel,
  experienceMin,
  experienceMax,
  salaryMin,
  salaryMax,
  jobType,
  modeOfWork,
  remoteWork,
}: JobAdditionalInfoProps) {
  const hasSalary = hasJobSalary(salaryMin, salaryMax)

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151b2b] sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
        <span className="h-5 w-1 shrink-0 rounded-full bg-primary-500" aria-hidden />
        Additional Information
      </h2>

      <div className="space-y-3">
        <InfoCard icon={MapPin} label="Job Location(s)">
          {locationLabel || 'Not specified'}
        </InfoCard>

        <InfoCard icon={Briefcase} label="Experience">
          {formatExperienceDetail(experienceMin, experienceMax)}
        </InfoCard>

        <InfoCard icon={Banknote} label="Salary" emphasized>
          {hasSalary ? (
            <div className="space-y-0.5">
              {salaryMin != null && !Number.isNaN(Number(salaryMin)) && (
                <p>Min Salary: {formatAmountINR(salaryMin)} /Year</p>
              )}
              {salaryMax != null && !Number.isNaN(Number(salaryMax)) && (
                <p>Max Salary: {formatAmountINR(salaryMax)} /Year</p>
              )}
            </div>
          ) : (
            <p>{formatSalaryRange(salaryMin, salaryMax)}</p>
          )}
        </InfoCard>

        <InfoCard icon={Clock} label="Job Type/Timing">
          <div className="space-y-0.5">
            <p>Job Type: {formatWorkMode(modeOfWork, remoteWork)}</p>
            <p>Job Timing: {formatJobTiming(jobType)}</p>
          </div>
        </InfoCard>
      </div>
    </section>
  )
}
