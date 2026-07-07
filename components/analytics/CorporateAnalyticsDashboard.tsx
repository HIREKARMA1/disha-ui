"use client"

import { useMemo, useState } from 'react'
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
  ComposedChart,
} from 'recharts'
import { AnalyticsKpiCards, CORPORATE_KPI_IDS } from '@/components/analytics/AnalyticsKpiCards'
import { AnalyticsChartCard } from '@/components/analytics/AnalyticsChartCard'
import { AnalyticsEmptyState } from '@/components/analytics/AnalyticsEmptyState'
import { AnalyticsTooltip } from '@/components/analytics/AnalyticsTooltip'
import { CorporateAnalyticsDashboardData } from '@/types/corporateAnalytics'

interface CorporateAnalyticsDashboardProps {
  data?: CorporateAnalyticsDashboardData | null
  isLoading?: boolean
  className?: string
  showKpis?: boolean
}

const BRAND = {
  primary: '#1b52a4',
  secondary: '#00a2e5',
  success: '#098855',
  warning: '#fec40d',
  danger: '#d64246',
}

export function CorporateAnalyticsDashboard({
  data,
  isLoading = false,
  className = '',
  showKpis = true,
}: CorporateAnalyticsDashboardProps) {
  const [trendPeriod, setTrendPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('12m')

  const monthlyTrends = useMemo(() => {
    const series = data?.application_trends?.find((t) => t.period === trendPeriod)
    return series?.data ?? []
  }, [data, trendPeriod])

  const funnelData = useMemo(() => {
    return (data?.recruitment_funnel ?? []).map((stage, index, arr) => ({
      ...stage,
      fill: [BRAND.primary, BRAND.secondary, BRAND.warning, BRAND.success, '#8b5cf6'][index] ?? BRAND.primary,
      widthPercent: arr[0]?.count ? Math.max(18, (stage.count / arr[0].count) * 100) : 18,
    }))
  }, [data])

  const practiceChartData = useMemo(() => {
    return (data?.practice_module_performance ?? []).map((m) => ({
      name: m.module_name.length > 18 ? `${m.module_name.slice(0, 16)}…` : m.module_name,
      fullName: m.module_name,
      completed: m.students_completed,
      avgScore: m.average_score,
    }))
  }, [data])

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hiring Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor recruitment pipeline, applications, and assessment performance
        </p>
      </div>

      {showKpis && (
        <AnalyticsKpiCards
          kpis={data?.kpis ?? []}
          isLoading={isLoading}
          columns={6}
          kpiIds={CORPORATE_KPI_IDS}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsChartCard
          title="Recruitment Funnel Overview"
          subtitle="Applied → Assessment → Interview → Offer → Hired"
          isLoading={isLoading}
        >
          {!isLoading && funnelData.length === 0 ? (
            <AnalyticsEmptyState title="No applications found." description="Post jobs to start tracking your hiring funnel." />
          ) : (
            <div className="space-y-3 py-2">
              {funnelData.map((stage) => (
                <div key={stage.key} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{stage.label}</span>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <span className="font-bold text-gray-900 dark:text-white">{stage.count}</span>
                      {stage.drop_off_percent != null && stage.drop_off_percent > 0 && (
                        <span className="text-xs text-red-500">−{stage.drop_off_percent}% drop</span>
                      )}
                    </div>
                  </div>
                  <div className="h-9 bg-gray-100 dark:bg-gray-700/60 rounded-xl overflow-hidden">
                    <div
                      className="h-full rounded-xl transition-all duration-700 ease-out flex items-center px-3"
                      style={{
                        width: `${stage.widthPercent}%`,
                        background: `linear-gradient(90deg, ${stage.fill}, ${stage.fill}cc)`,
                        minWidth: stage.count > 0 ? '4rem' : '0',
                      }}
                    >
                      {stage.count > 0 && (
                        <span className="text-xs font-semibold text-white truncate">{stage.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Applicant Demographics / Source"
          subtitle="Universities, branches, and application channels"
          isLoading={isLoading}
        >
          {!isLoading && !(data?.applicant_demographics?.length) ? (
            <AnalyticsEmptyState title="No applicant data available." />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.applicant_demographics ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                  >
                    {(data?.applicant_demographics ?? []).map((entry) => (
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsChartCard
          title="Application Volume by Job Role"
          subtitle="Most and least applied positions"
          isLoading={isLoading}
        >
          {!isLoading && !(data?.applications_by_job_role?.length) ? (
            <AnalyticsEmptyState title="No applications found." description="Applications by job role will appear once candidates apply." />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.applications_by_job_role ?? []}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="job_title"
                    width={100}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 12)}…` : v)}
                  />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Bar dataKey="applications" name="Applications" fill={BRAND.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Monthly Application Trends"
          subtitle="Application volume over time"
          isLoading={isLoading}
          action={
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value as typeof trendPeriod)}
              className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="12m">12 months</option>
            </select>
          }
        >
          {!isLoading && monthlyTrends.length === 0 ? (
            <AnalyticsEmptyState title="No application trends yet." />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke={BRAND.secondary}
                    strokeWidth={3}
                    dot={{ r: 3, fill: BRAND.secondary }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Practice Module Completion vs Score"
        subtitle="Students completed and average assessment score"
        isLoading={isLoading}
      >
        {!isLoading && practiceChartData.length === 0 ? (
          <AnalyticsEmptyState
            title="No assessments completed yet."
            description="Create practice modules to track candidate assessment performance."
          />
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={practiceChartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={
                    <AnalyticsTooltip
                      valueFormatter={(v, key) =>
                        key === 'avgScore' ? `${v}%` : v.toLocaleString('en-IN')
                      }
                    />
                  }
                />
                <Legend />
                <Bar yAxisId="left" dataKey="completed" name="Students Completed" fill={BRAND.primary} radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" name="Average Score (%)" stroke={BRAND.success} strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnalyticsChartCard>
    </div>
  )
}
