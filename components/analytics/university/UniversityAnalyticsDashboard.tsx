'use client'

import { Building2, Briefcase, DollarSign, Users } from 'lucide-react'
import { AnalyticsMetricCard } from '../AnalyticsMetricCard'
import { AnalyticsPageShell } from '../AnalyticsPageShell'
import { AnalyticsStatusChart } from '../AnalyticsStatusChart'
import { AnalyticsTrendChart } from '../AnalyticsTrendChart'
import { useRoleAnalytics } from '@/hooks/useRoleAnalytics'
import type { UniversityAnalyticsData } from '@/types/analytics'

function formatSalary(value: number | null): string {
  if (value == null) return '—'
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  return `₹${value.toLocaleString()}`
}

export function UniversityAnalyticsDashboard() {
  const { data, loading, error, refetch } = useRoleAnalytics<UniversityAnalyticsData>('university')

  return (
    <AnalyticsPageShell
      title="University Analytics"
      description={
        data?.university_name
          ? `Placement and hiring insights for ${data.university_name}.`
          : 'Placement and hiring insights for your institution.'
      }
      loading={loading}
      error={error}
      onRetry={refetch}
    >
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricCard
              label="Total Students"
              value={data.summary.total_students}
              icon={Users}
              accent="blue"
            />
            <AnalyticsMetricCard
              label="Placed"
              value={data.summary.placed_students}
              subtext={`${data.summary.placement_percentage}% placement rate`}
              icon={Users}
              accent="green"
            />
            <AnalyticsMetricCard
              label="Avg Package"
              value={formatSalary(data.summary.average_salary)}
              icon={DollarSign}
              accent="purple"
            />
            <AnalyticsMetricCard
              label="Highest Package"
              value={formatSalary(data.summary.highest_package)}
              icon={DollarSign}
              accent="indigo"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricCard
              label="Jobs Approved"
              value={data.summary.total_jobs_approved}
              icon={Briefcase}
              accent="green"
            />
            <AnalyticsMetricCard
              label="Pending Approvals"
              value={data.summary.pending_approvals}
              icon={Briefcase}
              accent="orange"
            />
            <AnalyticsMetricCard
              label="Campus Drives"
              value={data.summary.active_campus_drives}
              icon={Building2}
              accent="blue"
            />
            <AnalyticsMetricCard
              label="Companies Visited"
              value={data.summary.total_companies_visited}
              icon={Building2}
              accent="indigo"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsTrendChart
              title="Placement Trend"
              data={data.placement_trend}
              color="#8B5CF6"
            />
            <AnalyticsTrendChart
              title="Applications Trend"
              data={data.applications_trend}
              color="#3B82F6"
            />
          </div>

          <AnalyticsStatusChart
            title="Student Application Status"
            data={data.status_breakdown}
          />
        </>
      )}
    </AnalyticsPageShell>
  )
}
