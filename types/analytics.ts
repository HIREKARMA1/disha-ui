export interface StatusBreakdownItem {
  status: string
  count: number
}

export interface MonthlyTrendItem {
  month: string
  count: number
}

export interface StudentAnalyticsSummary {
  total_jobs: number
  applied_jobs: number
  selected: number
  rejected: number
  pending: number
  profile_completion_percentage: number
  application_rate: number
  selection_rate: number
}

export interface StudentAnalyticsData {
  summary: StudentAnalyticsSummary
  status_breakdown: StatusBreakdownItem[]
  applications_over_time: MonthlyTrendItem[]
}

export interface UniversityAnalyticsSummary {
  total_students: number
  placed_students: number
  unplaced_students: number
  placement_percentage: number
  average_salary: number | null
  highest_package: number | null
  total_jobs_approved: number
  pending_approvals: number
  active_campus_drives: number
  total_companies_visited: number
}

export interface UniversityAnalyticsData {
  university_name: string
  summary: UniversityAnalyticsSummary
  status_breakdown: StatusBreakdownItem[]
  placement_trend: MonthlyTrendItem[]
  applications_trend: MonthlyTrendItem[]
}

export interface CorporateAnalyticsSummary {
  total_jobs_posted: number
  active_jobs: number
  total_views: number
  total_applications: number
  shortlisted_candidates: number
  application_rate: number
  shortlist_rate: number
}

export interface TopJobItem {
  job_id: string
  title: string
  applications: number
}

export interface CorporateAnalyticsData {
  summary: CorporateAnalyticsSummary
  status_breakdown: StatusBreakdownItem[]
  applications_over_time: MonthlyTrendItem[]
  top_jobs: TopJobItem[]
}

export type UserRole = 'student' | 'university' | 'corporate'
