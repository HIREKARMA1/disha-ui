'use client'

import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { AdminDashboardStats } from '@/components/dashboard/AdminDashboardStats'
import { AdminAnalyticsChart } from '@/components/dashboard/AdminAnalyticsChart'
import { useAdminUserStatsContext } from '@/contexts/AdminUserStatsContext'
import { apiClient } from '@/lib/api'
import { AdminJobStats } from '@/types/admin'

const EMPTY_JOB_STATS: AdminJobStats = {
  total_jobs: 0,
  total_applications: 0,
  active_jobs: 0,
  pending_approvals: 0,
}

function AdminAnalyticsContent() {
  const { userStats, isLoading, error } = useAdminUserStatsContext()
  const [jobStats, setJobStats] = useState<AdminJobStats>(EMPTY_JOB_STATS)
  const [jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setJobsLoading(true)
      try {
        const jobs = await apiClient.getAllJobsAdmin()
        const list = Array.isArray(jobs) ? jobs : jobs?.jobs || []
        if (cancelled) return
        setJobStats({
          total_jobs: list.length,
          active_jobs: list.filter(
            (j: { status?: string; is_active?: boolean }) =>
              j.is_active === true ||
              j.status === 'active' ||
              j.status === 'published' ||
              j.status === 'open'
          ).length,
          total_applications: list.reduce(
            (sum: number, j: { applications_count?: number; current_applications?: number }) =>
              sum + (j.applications_count ?? j.current_applications ?? 0),
            0
          ),
          pending_approvals: list.filter(
            (j: { status?: string }) => j.status === 'pending' || j.status === 'pending_approval'
          ).length,
        })
      } catch (err) {
        console.error('Failed to load analytics job stats:', err)
        if (!cancelled) setJobStats(EMPTY_JOB_STATS)
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
      <AdminPageHero
        title="Platform Analytics"
        subtitle="Live overview of users, jobs, and applications across HireKarma."
        chips={[
          {
            label: 'Live data',
            tone: 'blue',
            icon: <BarChart3 className="w-3.5 h-3.5" />,
          },
        ]}
      />

      {(isLoading || jobsLoading) && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-[18px] border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {userStats && !isLoading && !jobsLoading && (
        <>
          <AdminDashboardStats userStats={userStats} jobStats={jobStats} isLoading={false} />
          <AdminAnalyticsChart userStats={userStats} jobStats={jobStats} />
        </>
      )}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <AdminDashboardLayout>
      <AdminAnalyticsContent />
    </AdminDashboardLayout>
  )
}
