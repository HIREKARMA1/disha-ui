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
      colorClass: 'text-blue-500',
      iconBgClass: 'bg-blue-500/15',
    },
    {
      label: 'Applications',
      value: stats.appliedJobs,
      icon: FileText,
      subtitle: 'Submitted',
      colorClass: 'text-emerald-500',
      iconBgClass: 'bg-emerald-500/15',
    },
    {
      label: 'Selected',
      value: stats.selected,
      icon: Trophy,
      subtitle: stats.selected > 0 ? 'Congratulations!' : 'Keep going',
      colorClass: 'text-violet-500',
      iconBgClass: 'bg-violet-500/15',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      subtitle: 'Keep Trying!',
      colorClass: 'text-red-500',
      iconBgClass: 'bg-red-500/15',
    },
  ]

  if (loading) {
    return (
      <div className={`grid grid-cols-4 gap-1.5 sm:gap-3 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-[64px] sm:h-[92px] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#151b2b] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151b2b] p-6 ${className}`}
      >
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            Unable to load stats
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please refresh and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-4 gap-1.5 sm:gap-3 ${className}`}>
      {cards.map((stat, index) => (
        <StudentStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          subtitle={stat.subtitle}
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
