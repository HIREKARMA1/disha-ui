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

export interface PlacementStatusSegment {
  key: string
  name: string
  count: number
  percentage: number
  color: string
}

export interface BranchPlacementStat {
  branch: string
  eligible_students: number
  placed_students: number
}

export interface HiringVelocityPoint {
  label: string
  date: string
  placements: number
}

export interface TopRecruiter {
  company_name: string
  offers: number
}

export interface SkillPerformancePoint {
  subject: string
  average_score: number
  full_mark: number
}

export interface UniversityAnalyticsDashboardData {
  kpis: AnalyticsKpi[]
  placement_status: PlacementStatusSegment[]
  branch_wise_placement: BranchPlacementStat[]
  hiring_velocity: HiringVelocityPoint[]
  top_recruiting_corporates: TopRecruiter[]
  skill_performance: SkillPerformancePoint[]
  generated_at: string
}
