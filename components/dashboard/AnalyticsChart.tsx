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
        <div className="h-36 rounded-2xl bg-gray-100 dark:bg-[#151b2b] animate-pulse" />
        <div className="h-48 rounded-2xl bg-gray-100 dark:bg-[#151b2b] animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <StudentSectionCard className={className}>
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Application Analytics
          </h2>
          <Link
            href="/dashboard/student/applications"
            className="text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-400"
          >
            View Details &gt;
          </Link>
        </div>

        <div className="space-y-4">
          <ProgressRow
            label="Application Rate"
            value={`${applicationPct.toFixed(0)}%`}
            hint={`${appliedToOpenJobs} of ${totalJobs} open jobs applied`}
            percent={applicationPct}
            barClass="bg-blue-500"
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
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Application Overview
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div
            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full shrink-0"
            style={{
              background:
                donutTotal > 0
                  ? `conic-gradient(${conicParts})`
                  : 'conic-gradient(#64748B 0% 100%)',
            }}
          >
            <div className="absolute inset-[18%] rounded-full bg-white dark:bg-[#151b2b] flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {appliedJobs}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Applied</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 tabular-nums">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {item.pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-1.5 text-xs text-blue-500">
              <Briefcase className="w-3.5 h-3.5" />
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
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barClass)}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
    </div>
  )
}
