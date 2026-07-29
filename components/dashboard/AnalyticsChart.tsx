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

export function AnalyticsChart({ className = '' }: AnalyticsChartProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    appliedJobs: 0,
    selected: 0,
    rejected: 0,
  })
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
      } catch (error: any) {
        console.error('Failed to fetch analytics:', error)
        if (
          error.message?.includes('not authenticated') ||
          error.message?.includes('Authentication failed')
        ) {
          router.push('/auth/login')
          return
        }
        setError(error.message || 'Unable to fetch analytics data.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [router])

  const { totalJobs, appliedJobs, selected, rejected } = stats
  const applicationRate = totalJobs > 0 ? (appliedJobs / totalJobs) * 100 : 0
  const selectionRate = appliedJobs > 0 ? (selected / appliedJobs) * 100 : 0

  const legend = [
    { label: 'Applied', value: appliedJobs, color: '#3B82F6', pct: totalJobs > 0 ? (appliedJobs / totalJobs) * 100 : 0 },
    { label: 'Selected', value: selected, color: '#10B981', pct: appliedJobs > 0 ? (selected / appliedJobs) * 100 : 0 },
    { label: 'Rejected', value: rejected, color: '#EF4444', pct: appliedJobs > 0 ? (rejected / appliedJobs) * 100 : 0 },
    { label: 'Open Jobs', value: totalJobs, color: '#8B5CF6', pct: 100 },
  ]

  const donutSegments = [
    { value: appliedJobs, color: '#3B82F6' },
    { value: selected, color: '#10B981' },
    { value: rejected, color: '#EF4444' },
    { value: Math.max(totalJobs - appliedJobs, 0), color: '#64748B' },
  ]
  const donutTotal = donutSegments.reduce((s, d) => s + d.value, 0) || 1

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

  // Build conic-gradient for donut
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
      {/* Application Analytics — progress bars */}
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
            value={`${applicationRate.toFixed(1)}%`}
            hint={`${appliedJobs} of ${totalJobs} jobs applied`}
            percent={Math.min(applicationRate, 100)}
            barClass="bg-blue-500"
          />
          <ProgressRow
            label="Selection Rate"
            value={`${selectionRate.toFixed(1)}%`}
            hint={`${selected} of ${appliedJobs} applications selected`}
            percent={Math.min(selectionRate, 100)}
            barClass="bg-emerald-500"
          />
        </div>
      </StudentSectionCard>

      {/* Application Overview — donut */}
      <StudentSectionCard>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Application Overview
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div
            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full shrink-0"
            style={{
              background: `conic-gradient(${conicParts})`,
            }}
          >
            <div className="absolute inset-[18%] rounded-full bg-white dark:bg-[#151b2b] flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {appliedJobs}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Total</span>
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
              Total Jobs: {totalJobs}
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
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{value}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>
    </div>
  )
}
