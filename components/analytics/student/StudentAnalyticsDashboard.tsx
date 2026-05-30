'use client'

import { Briefcase, CheckCircle, Target, TrendingUp, XCircle } from 'lucide-react'
import { AnalyticsMetricCard } from '../AnalyticsMetricCard'
import { AnalyticsPageShell } from '../AnalyticsPageShell'
import { AnalyticsStatusChart } from '../AnalyticsStatusChart'
import { AnalyticsTrendChart } from '../AnalyticsTrendChart'
import { useRoleAnalytics } from '@/hooks/useRoleAnalytics'
import type { StudentAnalyticsData } from '@/types/analytics'

export function StudentAnalyticsDashboard() {
  const { data, loading, error, refetch } = useRoleAnalytics<StudentAnalyticsData>('student')

  return (
    <AnalyticsPageShell
      title="Student Analytics"
      description="Track your job applications, selection rates, and activity over time."
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricCard
              label="Available Jobs"
              value={data.summary.total_jobs}
              icon={Briefcase}
              accent="blue"
            />
            <AnalyticsMetricCard
              label="Applied"
              value={data.summary.applied_jobs}
              subtext={`${data.summary.application_rate}% application rate`}
              icon={TrendingUp}
              accent="green"
            />
            <AnalyticsMetricCard
              label="Selected"
              value={data.summary.selected}
              subtext={`${data.summary.selection_rate}% selection rate`}
              icon={CheckCircle}
              accent="purple"
            />
            <AnalyticsMetricCard
              label="Profile Complete"
              value={`${data.summary.profile_completion_percentage}%`}
              icon={Target}
              accent="indigo"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricCard
              label="Rejected"
              value={data.summary.rejected}
              icon={XCircle}
              accent="red"
            />
            <AnalyticsMetricCard
              label="Pending"
              value={data.summary.pending}
              icon={Briefcase}
              accent="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsTrendChart
              title="Applications Over Time"
              data={data.applications_over_time}
              color="#10B981"
            />
            <AnalyticsStatusChart
              title="Application Status Breakdown"
              data={data.status_breakdown}
            />
          </div>
        </>
      )}
    </AnalyticsPageShell>
  )
}
