import type { Job } from '@/components/jobs/AllJobs'
import type { EventCategory, FAQItem, RewardItem, RoundItem, VisibilitySettings } from '@/types/contestEvent'

export type CampusDriveMode = 'online' | 'offline'
export type CampusDrivePublicationStatus = 'draft' | 'published'
export type CampusDriveListingStatus = 'active' | 'inactive' | 'hidden'

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
}

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
  not_started: 'Not started',
  not_set: 'Not set',
}
