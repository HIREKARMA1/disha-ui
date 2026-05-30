'use client'

import { Briefcase, Eye, TrendingUp, Users } from 'lucide-react'
import { AnalyticsMetricCard } from '../AnalyticsMetricCard'
import { AnalyticsPageShell } from '../AnalyticsPageShell'
import { AnalyticsStatusChart } from '../AnalyticsStatusChart'
import { AnalyticsTrendChart } from '../AnalyticsTrendChart'
import { useRoleAnalytics } from '@/hooks/useRoleAnalytics'
import type { CorporateAnalyticsData } from '@/types/analytics'

export function CorporateAnalyticsDashboard() {
  const { data, loading, error, refetch } = useRoleAnalytics<CorporateAnalyticsData>('corporate')

  return (
    <AnalyticsPageShell
      title="Corporate Analytics"
      description="Hiring performance, application trends, and top-performing job postings."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricCard
              label="Jobs Posted"
              value={data.summary.total_jobs_posted}
              subtext={`${data.summary.active_jobs} active`}
              icon={Briefcase}
              accent="blue"
            />
            <AnalyticsMetricCard
              label="Total Applications"
              value={data.summary.total_applications}
              subtext={`${data.summary.application_rate}% view-to-apply rate`}
              icon={TrendingUp}
              accent="green"
            />
            <AnalyticsMetricCard
              label="Job Views"
              value={data.summary.total_views}
              icon={Eye}
              accent="purple"
            />
            <AnalyticsMetricCard
              label="Shortlisted"
              value={data.summary.shortlisted_candidates}
              subtext={`${data.summary.shortlist_rate}% shortlist rate`}
              icon={Users}
              accent="indigo"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsTrendChart
              title="Applications Over Time"
              data={data.applications_over_time}
              color="#3B82F6"
            />
            <AnalyticsStatusChart
              title="Application Status Breakdown"
              data={data.status_breakdown}
            />
          </div>

          {data.top_jobs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Jobs by Applications
              </h3>
              <div className="space-y-3">
                {data.top_jobs.map((job) => {
                  const maxApps = Math.max(...data.top_jobs.map((j) => j.applications), 1)
                  return (
                    <div key={job.job_id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-4">
                          {job.title}
                        </span>
                        <span className="text-gray-900 dark:text-white font-semibold shrink-0">
                          {job.applications}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${(job.applications / maxApps) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </AnalyticsPageShell>
  )
}
