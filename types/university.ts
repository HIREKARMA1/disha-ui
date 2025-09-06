export interface UniversityInfo {
  id: string
  university_name: string
  institute_type: string
  verified: boolean
  total_students: number
}

export interface StudentStatistics {
  total_students: number
  placed_students: number
  unplaced_students: number
  placement_percentage: number
  average_salary: number
  highest_package: number
}

export interface JobStatistics {
  total_jobs_approved: number
  pending_approvals: number
  active_campus_drives: number
  total_companies_visited: number
  average_jobs_per_student: number
}

export interface RecentActivity {
  type: 'student_placed' | 'job_approved' | 'campus_drive' | 'profile_update'
  student_name?: string
  company?: string
  job_title?: string
  package?: number
  timestamp: string
}

export interface UniversityDashboardData {
  university_info: UniversityInfo
  student_statistics: StudentStatistics
  job_statistics: JobStatistics
  recent_activity: RecentActivity[]
  quick_actions: string[]
}

export interface PlacementFilter {
  year: number
  department?: string
  company?: string
}

export interface StudentListItem {
  id: string
  name: string
  email: string
  phone?: string
  degree?: string
  branch?: string
  graduation_year?: number
  btech_cgpa?: number
  placement_status: string
  placed_company?: string
  package?: number
  technical_skills?: string
  total_applications: number
  interviews_attended: number
  offers_received: number
  profile_completion_percentage: number
  is_archived: boolean
  created_at: string
  // Additional fields for dynamic profile data
  soft_skills?: string
  certifications?: string
  preferred_industry?: string
  job_roles_of_interest?: string
  location_preferences?: string
  language_proficiency?: string
  internship_experience?: string
  project_details?: string
  extracurricular_activities?: string
  linkedin_profile?: string
  github_profile?: string
  personal_website?: string
  resume?: string
  tenth_certificate?: string
  twelfth_certificate?: string
  internship_certificates?: string
  profile_picture?: string
  email_verified?: boolean
  phone_verified?: boolean
  status?: string
  bio?: string
  institution?: string
  major?: string
  dob?: string
  gender?: string
  country?: string
  state?: string
  city?: string
  tenth_grade_percentage?: number
  twelfth_grade_percentage?: number
  total_percentage?: number
  university_id?: string
  college_id?: string
  twelfth_institution?: string
  twelfth_stream?: string
  twelfth_year?: string
  tenth_institution?: string
  tenth_stream?: string
  tenth_year?: string
}

export interface StudentListResponse {
  students: StudentListItem[]
  total_students: number
  active_students: number
  archived_students: number
}

export interface CreateStudentRequest {
  name: string
  email: string
  phone: string
  degree?: string
  branch?: string
  graduation_year?: number
}

export interface CreateStudentResponse {
  message: string
  student_id: string
  email: string
  temporary_password: string
}

export interface BulkUploadResponse {
  message: string
  total_processed: number
  successful: number
  failed: number
  errors: string[]
}

export interface StudentTemplateResponse {
  template_url: string
  message: string
}

