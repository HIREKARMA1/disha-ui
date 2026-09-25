export type UniversityApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface UniversityApprovalItem {
  id: string
  job_id: string
  university_id: string
  job_title: string
  company_name?: string | null
  university_name: string
  location?: string | null
  job_type?: string | null
  posted_at?: string | null
  expiry_at?: string | null
  assigned_at?: string | null
  approval_status: UniversityApprovalStatus
  approved: boolean
  pending: boolean
  rejected: boolean
  approved_at?: string | null
  approved_by?: string | null
}

export interface UniversityApprovalListResponse {
  items: UniversityApprovalItem[]
  total_count: number
  pending_count: number
  approved_count: number
  rejected_count: number
  skip: number
  limit: number
}
