"use client"

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { AnalyticsKpiCards, UNIVERSITY_KPI_IDS } from '@/components/analytics/AnalyticsKpiCards'
import { AnalyticsChartCard } from '@/components/analytics/AnalyticsChartCard'
import { AnalyticsEmptyState } from '@/components/analytics/AnalyticsEmptyState'
import { AnalyticsTooltip } from '@/components/analytics/AnalyticsTooltip'
import { UniversityAnalyticsDashboardData } from '@/types/universityAnalytics'

interface UniversityAnalyticsDashboardProps {
  data?: UniversityAnalyticsDashboardData | null
  isLoading?: boolean
  className?: string
  showKpis?: boolean
}

const BRAND = {
  primary: '#1b52a4',
  secondary: '#00a2e5',
  success: '#098855',
  danger: '#d64246',
}

export function UniversityAnalyticsDashboard({
  data,
  isLoading = false,
  className = '',
  showKpis = true,
}: UniversityAnalyticsDashboardProps) {
  const branchData = useMemo(() => {
    return (data?.branch_wise_placement ?? []).slice(0, 10)
  }, [data])

  const radarData = useMemo(() => {
    return (data?.skill_performance ?? []).map((s) => ({
      subject: s.subject,
      score: s.average_score,
      fullMark: s.full_mark,
    }))
  }, [data])

  const hasPlacementData = (data?.placement_status ?? []).some((s) => s.count > 0)

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Placement Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Placements, employability, company engagement, and assessment performance
        </p>
      </div>

      {showKpis && (
        <AnalyticsKpiCards
          kpis={data?.kpis ?? []}
          isLoading={isLoading}
          columns={5}
          kpiIds={UNIVERSITY_KPI_IDS}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsChartCard
          title="Placement Status Breakdown"
          subtitle="Placed · Higher Studies · Unplaced · Opted Out"
          isLoading={isLoading}
        >
          {!isLoading && !hasPlacementData ? (
            <AnalyticsEmptyState title="No placement data available." description="Student placement records will populate this chart." />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.placement_status ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={98}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                  >
                    {(data?.placement_status ?? []).map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Hiring Velocity Over Time"
          subtitle="Weekly placements during placement season"
          isLoading={isLoading}
        >
          {!isLoading && !(data?.hiring_velocity?.some((p) => p.placements > 0)) ? (
            <AnalyticsEmptyState title="No placement velocity data yet." />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.hiring_velocity ?? []}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="placements"
                    name="Placements"
                    stroke={BRAND.success}
                    strokeWidth={3}
                    dot={{ r: 3, fill: BRAND.success }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsChartCard
          title="Branch-wise Placement Statistics"
          subtitle="Eligible vs placed students by branch"
          isLoading={isLoading}
        >
          {!isLoading && branchData.length === 0 ? (
            <AnalyticsEmptyState title="No branch data available." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
                  <XAxis
                    dataKey="branch"
                    tick={{ fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Legend />
                  <Bar dataKey="eligible_students" name="Eligible" fill={BRAND.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed_students" name="Placed" fill={BRAND.success} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Top Recruiting Corporates"
          subtitle="Companies ranked by offers made"
          isLoading={isLoading}
        >
          {!isLoading && !(data?.top_recruiting_corporates?.length) ? (
            <AnalyticsEmptyState title="No recruiting data available." />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.top_recruiting_corporates ?? []}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="company_name"
                    width={110}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 14)}…` : v)}
                  />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Bar dataKey="offers" name="Offers" fill={BRAND.secondary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Skill Gap / Performance Analysis"
        subtitle="Average student performance across assessment areas"
        isLoading={isLoading}
      >
        {!isLoading && !radarData.some((r) => r.score > 0) ? (
          <AnalyticsEmptyState
            title="No assessment performance data yet."
            description="Student practice and assessment scores will appear here."
          />
        ) : (
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Avg Score"
                  dataKey="score"
                  stroke={BRAND.primary}
                  fill={BRAND.primary}
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  content={
                    <AnalyticsTooltip valueFormatter={(v) => `${v}%`} />
                  }
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnalyticsChartCard>
    </div>
  )
}
