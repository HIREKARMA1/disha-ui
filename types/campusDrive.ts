import type { Job } from '@/components/jobs/AllJobs'
import type { EventCategory, FAQItem, RewardItem, RoundItem, VisibilitySettings } from '@/types/contestEvent'

export type CampusDriveMode = 'virtual' | 'oncampus' | 'walking'
export type CampusDrivePublicationStatus = 'draft' | 'published'
export type CampusDriveListingStatus = 'active' | 'inactive' | 'hidden'

export interface CampusDriveCorporateSummary {
  id: string
  company_name: string
  company_logo?: string | null
}

export interface CampusDriveJobSummary {
  id: string
  title: string
  company_name?: string | null
  location?: string | null
  job_type?: string | null
  status?: string | null
  salary_min?: number | null
  salary_max?: number | null
  salary_currency?: string | null
  slug?: string | null
}

export interface CampusDriveListItem {
  id: string
  slug?: string | null
  title: string
  subtitle?: string | null
  short_description?: string | null
  banner_url?: string | null
  organizer_logo_url?: string | null
  organizer_name?: string | null
  category?: string | null
  mode?: string | null
  venue?: string | null
  publication_status?: string | null
  listing_status?: CampusDriveListingStatus | string | null
  registration_status?: string | null
  registration_start_date?: string | null
  registration_end_date?: string | null
  event_start_date: string
  event_end_date?: string | null
  visibility_labels?: string[]
  job_count: number
  created_at?: string | null
  is_registered?: boolean
  registration_is_open?: boolean
}

export interface CampusDriveDetail extends CampusDriveListItem {
  long_description?: string | null
  organizer_name?: string | null
  organizer_website?: string | null
  organizer_email?: string | null
  organizer_phone?: string | null
  event_link?: string | null
  eligibility?: string | null
  about_organizer?: string | null
  support_email?: string | null
  support_phone?: string | null
  support_content?: string | null
  visibility: VisibilitySettings
  faqs: FAQItem[]
  rounds: RoundItem[]
  rewards: RewardItem[]
  jobs: Job[]
  corporates?: CampusDriveCorporateSummary[]
  updated_at?: string | null
}

export interface CampusDriveListResponse {
  campus_drives: CampusDriveListItem[]
  total_count: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface CampusDriveWritePayload {
  title: string
  slug?: string
  short_description?: string | null
  subtitle?: string
  long_description?: string | null
  banner_url?: string | null
  organizer_logo_url?: string | null
  organizer_name?: string
  organizer_website?: string
  organizer_email?: string | null
  organizer_phone?: string
  venue?: string
  mode?: CampusDriveMode
  category?: EventCategory
  registration_start_date?: string | null
  registration_end_date?: string | null
  event_start_date: string
  event_end_date?: string | null
  eligibility?: string | null
  about_organizer?: string | null
  support_email?: string | null
  support_phone?: string
  support_content?: string | null
  visibility?: VisibilitySettings
  listing_status?: CampusDriveListingStatus
  event_link?: string | null
  faqs?: FAQItem[]
  rounds?: RoundItem[]
  rewards?: RewardItem[]
  job_ids?: string[]
  corporate_ids?: string[]
}

export interface CampusDriveStatistics {
  total_campus_drives: number
  published_count: number
  draft_count: number
  upcoming_count: number
  completed_count: number
  total_jobs: number
  total_university_assignments: number
  total_interest_requests: number
  drives_by_category: Record<string, number>
  drives_by_publication_status: Record<string, number>
  creation_trends: Array<{ month: string; count: number }>
  top_drives: Array<{ id: string; title: string; job_count: number }>
}

export interface CampusDriveAnalyticsAvailability {
  total_views: boolean
  unique_visitors: boolean
  registrations: boolean
  dropouts: boolean
  completed: boolean
  certificates_issued: boolean
  feedback: boolean
  attendance: boolean
  daily_page_views: boolean
}

export interface CampusDriveDailyRegistrationRow {
  date: string
  views?: number | null
  registrations: number
  interest_requests?: number
}

export interface CampusDriveAnalytics {
  campus_drive_id: string
  title: string
  publication_status: string
  availability: CampusDriveAnalyticsAvailability
  total_views?: number | null
  unique_visitors?: number | null
  registrations?: number | null
  dropouts?: number | null
  completed?: number | null
  certificates_issued?: number | null
  daily_registrations: CampusDriveDailyRegistrationRow[]
  top_universities: Array<{ name: string; count: number }>
  top_branches: Array<{ name: string; count: number }>
  top_locations: Array<{ name: string; count: number }>
}

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
  not_started: 'Not started',
  not_set: 'Not set',
}
