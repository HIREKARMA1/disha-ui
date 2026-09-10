'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Briefcase } from 'lucide-react'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'
import { StudentSectionCard } from '@/components/student/ui/StudentSectionCard'
import { cn } from '@/lib/utils'

interface AnalyticsChartProps {
  className?: string
}

const EMPTY_STATS: DashboardStats = {
  totalJobs: 0,
  appliedJobs: 0,
  appliedToOpenJobs: 0,
  selected: 0,
  offered: 0,
  rejected: 0,
  pending: 0,
  applicationRate: 0,
  selectionRate: 0,
  offerRate: 0,
  rejectionRate: 0,
}

function clampPct(n: number): number {
  return Math.min(100, Math.max(0, n))
}

export function AnalyticsChart({ className = '' }: AnalyticsChartProps) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const dashboardStats = await dashboardService.getDashboardStats()
        setStats(dashboardStats)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to fetch analytics data.'
        if (message.includes('not authenticated') || message.includes('Authentication failed')) {
          router.push('/auth/login')
          return
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    void fetchStats()
  }, [router])

  const {
    totalJobs,
    appliedJobs,
    appliedToOpenJobs,
    selected,
    offered,
    rejected,
    pending,
    applicationRate,
    selectionRate,
    offerRate,
  } = stats

  const applicationPct = clampPct(applicationRate)
  const selectionPct = clampPct(selectionRate)
  const offerPct = clampPct(offerRate)

  // Mutually exclusive donut segments based on applications funnel
  const donutSegments = [
    { label: 'Selected', value: selected, color: '#10B981' },
    { label: 'Rejected', value: rejected, color: '#EF4444' },
    { label: 'In Progress', value: pending, color: '#3B82F6' },
  ]
  const donutTotal = donutSegments.reduce((s, d) => s + d.value, 0) || 1

  const legend = [
    {
      label: 'Applied',
      value: appliedJobs,
      color: '#3B82F6',
      pct: appliedJobs > 0 ? 100 : 0,
    },
    {
      label: 'Selected',
      value: selected,
      color: '#10B981',
      pct: clampPct(appliedJobs > 0 ? (selected / appliedJobs) * 100 : 0),
    },
    {
      label: 'Offers',
      value: offered,
      color: '#059669',
      pct: offerPct,
    },
    {
      label: 'Rejected',
      value: rejected,
      color: '#EF4444',
      pct: clampPct(appliedJobs > 0 ? (rejected / appliedJobs) * 100 : 0),
    },
  ]

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-36 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900" />
        <div className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <StudentSectionCard className={className}>
        <div className="py-6 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">Unable to load analytics</p>
        </div>
      </StudentSectionCard>
    )
  }

  let cursor = 0
  const conicParts = donutSegments
    .map((seg) => {
      const start = cursor
      const pct = (seg.value / donutTotal) * 100
      cursor += pct
      return `${seg.color} ${start}% ${cursor}%`
    })
    .join(', ')

  return (
    <div className={cn('space-y-3 sm:space-y-4', className)}>
      <StudentSectionCard>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
            <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
            Application Analytics
          </h2>
          <Link
            href="/dashboard/student/applications"
            className={cn(
              'group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1',
              'text-xs font-semibold text-primary-700 transition-colors',
              'hover:border-primary-400 hover:bg-primary-100',
              'dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/60'
            )}
          >
            View Details
          </Link>
        </div>

        <div className="space-y-4">
          <ProgressRow
            label="Application Rate"
            value={`${applicationPct.toFixed(0)}%`}
            hint={`${appliedToOpenJobs} of ${totalJobs} open jobs applied`}
            percent={applicationPct}
            barClass="bg-primary-600"
          />
          <ProgressRow
            label="Selection Rate"
            value={`${selectionPct.toFixed(0)}%`}
            hint={`${selected} of ${appliedJobs} applications shortlisted/selected`}
            percent={selectionPct}
            barClass="bg-emerald-500"
          />
          <ProgressRow
            label="Offer Rate"
            value={`${offerPct.toFixed(0)}%`}
            hint={`${offered} of ${appliedJobs} applications with offers`}
            percent={offerPct}
            barClass="bg-teal-500"
          />
        </div>
      </StudentSectionCard>

      <StudentSectionCard>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
          <span className="h-5 w-1 shrink-0 rounded-sm bg-primary-500 sm:h-6" aria-hidden />
          Application Overview
        </h2>
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div
            className="relative h-32 w-32 shrink-0 rounded-full sm:h-36 sm:w-36"
            style={{
              background:
                donutTotal > 0
                  ? `conic-gradient(${conicParts})`
                  : 'conic-gradient(#94a3b8 0% 100%)',
            }}
          >
            <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
              <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {appliedJobs}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Applied</span>
            </div>
          </div>

          <div className="w-full flex-1 space-y-2">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-gray-600 dark:text-gray-300">{item.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  <span className="w-12 text-right text-xs text-gray-500">
                    {item.pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-2 text-xs font-medium text-primary-600 dark:text-primary-400">
              <Briefcase className="h-3.5 w-3.5" />
              Open Jobs: {totalJobs}
            </div>
          </div>
        </div>
      </StudentSectionCard>
    </div>
  )
}

function ProgressRow({
  label,
  value,
  hint,
  percent,
  barClass,
}: {
  label: string
  value: string
  hint: string
  percent: number
  barClass: string
}) {
  const width = clampPct(percent)
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barClass)}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
    </div>
  )
}
