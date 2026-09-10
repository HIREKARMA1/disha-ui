'use client'

import { Briefcase, FileText, XCircle, AlertCircle, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dashboardService, type DashboardStats } from '@/services/dashboardService'
import { StudentStatCard } from '@/components/student/ui/StudentStatCard'

interface DashboardStatsProps {
  className?: string
}

export function DashboardStats({ className = '' }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats>({
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
        console.error('Failed to fetch dashboard stats:', error)
        if (
          error.message?.includes('not authenticated') ||
          error.message?.includes('Authentication failed')
        ) {
          router.push('/auth/login')
          return
        }
        setError(error.message || 'Unable to fetch data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const cards = [
    {
      label: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      subtitle: 'Open opportunities',
      tooltip: 'Total open job opportunities currently available to you',
      colorClass: 'text-primary-600 dark:text-primary-400',
      iconBgClass: 'bg-primary-50 dark:bg-primary-950/50',
    },
    {
      label: 'Applications',
      value: stats.appliedJobs,
      icon: FileText,
      subtitle: 'Submitted',
      tooltip: 'Number of job applications you have submitted',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Selected',
      value: stats.selected,
      icon: Trophy,
      subtitle: stats.selected > 0 ? 'Congratulations!' : 'Keep going',
      tooltip: 'Applications where you were selected by the employer',
      colorClass: 'text-violet-600 dark:text-violet-400',
      iconBgClass: 'bg-violet-50 dark:bg-violet-950/40',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      subtitle: 'Keep Trying!',
      tooltip: 'Applications that were not selected — keep applying',
      colorClass: 'text-red-600 dark:text-red-400',
      iconBgClass: 'bg-red-50 dark:bg-red-950/40',
    },
  ]

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-[72px] animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 sm:h-[92px]"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 ${className}`}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <h3 className="mb-1 text-base font-medium text-gray-900 dark:text-white">
            Unable to load stats
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please refresh and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 ${className}`}>
      {cards.map((stat, index) => (
        <StudentStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          subtitle={stat.subtitle}
          tooltip={stat.tooltip}
          colorClass={stat.colorClass}
          iconBgClass={stat.iconBgClass}
          index={index}
          compact
          className="min-w-0"
        />
      ))}
    </div>
  )
}
