export type CampusDriveRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface CampusDriveRequestStudentStatus {
  exists: boolean
  id?: string | null
  job_id: string
  status?: CampusDriveRequestStatus | null
  requested_at?: string | null
}

export interface CampusDriveRequest {
  id: string
  student_id: string
  university_id?: string | null
  job_id: string
  status: CampusDriveRequestStatus
  requested_at: string
  reviewed_at?: string | null
  reviewed_by?: string | null
  created_at: string
  updated_at: string
  student_name?: string | null
  student_email?: string | null
  student_phone?: string | null
  university_name?: string | null
  job_title?: string | null
  campus_drive_label?: string | null
  company_name?: string | null
}

export interface CampusDriveRequestListResponse {
  requests: CampusDriveRequest[]
  total_count: number
  pending_count: number
  accepted_count: number
  rejected_count: number
}
