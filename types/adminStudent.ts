export interface AdminStudentListItem {
  id: string
  name: string
  email: string
  phone?: string | null
  gender?: string | null
  dob?: string | null
  institution?: string | null
  degree?: string | null
  branch?: string | null
  graduation_year?: number | null
  university_id?: string | null
  status: string
  email_verified: boolean
  phone_verified?: boolean
  is_archived: boolean
  profile_picture?: string | null
  profile_completion_percentage?: number
  created_at?: string | null
  updated_at?: string | null
  last_login?: string | null
  created_by?: string | null
  imported_by?: string | null
  import_time?: string | null
}

export interface AdminStudentListResponse {
  students: AdminStudentListItem[]
  total_students: number
  active_students: number
  inactive_students?: number
  verified_students: number
  registered_today: number
  logged_in_today?: number
  never_logged_in?: number
}

export interface CreateAdminStudentRequest {
  first_name: string
  last_name?: string
  email: string
  phone?: string
  gender?: string
  dob?: string
  college?: string
  department?: string
  year?: number | string
  status?: string
}

export interface CreateAdminStudentResponse {
  message: string
  student_id: string
  email: string
  temporary_password: string
  email_queued?: boolean
  student?: AdminStudentListItem
}

export interface UpdateAdminStudentRequest {
  first_name?: string
  last_name?: string
  name?: string
  email?: string
  phone?: string
  gender?: string
  dob?: string
  college?: string
  department?: string
  branch?: string
  year?: number | string
  graduation_year?: number
  status?: string
  email_verified?: boolean
  is_archived?: boolean
}

export interface AdminStudentImportResponse {
  message: string
  imported: number
  skipped: number
  failed: number
  total_processed: number
  successful: number
  emails_queued?: number
  errors: string[]
}

export interface ResetPasswordResponse {
  message: string
  student_id: string
  email: string
  temporary_password: string
  name?: string
}

export interface AdminStudentBulkActionResponse {
  message: string
  updated_count: number
  failed_count: number
  action: string
  affected_student_ids?: string[]
  admin_id?: string
  timestamp?: string
}

export type AdminStudentBulkAction = 'activate' | 'deactivate' | 'verify' | 'unverify' | 'delete'
