export type TrendDirection = 'up' | 'down' | 'neutral'

export interface AnalyticsKpi {
  id: string
  label: string
  value: number
  change_percent: number
  trend: TrendDirection
  unit?: string | null
  description?: string | null
  meta?: Record<string, number | string> | null
}

export interface TrendDataPoint {
  label: string
  applications: number
  date?: string | null
}

export interface ApplicationTrendSeries {
  period: '7d' | '30d' | '90d' | '12m'
  data: TrendDataPoint[]
}

export interface FunnelStage {
  key: string
  label: string
  count: number
  drop_off_percent?: number | null
}

export interface CandidateSourceSegment {
  key: string
  name: string
  count: number
  percentage: number
  color: string
}

export interface JobRoleApplication {
  job_title: string
  applications: number
}

export interface PracticeModulePerformance {
  module_id: string
  module_name: string
  students_completed: number
  average_score: number
}

export interface AiInsight {
  text: string
  trend: TrendDirection
  category?: string | null
}

export interface CorporateAnalyticsDashboardData {
  kpis: AnalyticsKpi[]
  application_trends: ApplicationTrendSeries[]
  recruitment_funnel: FunnelStage[]
  hiring_funnel: FunnelStage[]
  applications_by_job_role: JobRoleApplication[]
  applicant_demographics: CandidateSourceSegment[]
  practice_module_performance: PracticeModulePerformance[]
  candidate_sources: CandidateSourceSegment[]
  ai_insights: AiInsight[]
  generated_at: string
}
