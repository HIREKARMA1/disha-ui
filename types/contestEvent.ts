/** Contest Event types */

export type EventCategory =
  | 'technology'
  | 'placement'
  | 'hackathon'
  | 'workshop'
  | 'competition'
  | 'seminar'
  | 'corporate_drive'
  | 'university'
  | 'coding_contest'
  | 'campus_drive'
  | 'ai_competition'
  | 'placement_drive'
  | 'technical_quiz'
  | 'innovation_challenge'
  | 'startup_pitch'

export type EventMode = 'online' | 'offline' | 'hybrid'
export type PublicationStatus = 'draft' | 'published' | 'closed' | 'archived'
export type PrizeType = 'free' | 'paid'
export type ContestStatus = 'upcoming' | 'live' | 'closed' | 'archived' | 'cancelled' | 'postponed' | 'draft'
export type RegistrationStatus =
  | 'registered'
  | 'selected'
  | 'rejected'
  | 'completed'
  | 'certificate_available'
  | 'cancelled'

export interface VisibilitySettings {
  student: boolean
  corporate: boolean
  university: boolean
  public: boolean
}

export interface FAQItem {
  id?: string
  question: string
  answer: string
  sort_order?: number
}

export interface RoundItem {
  id?: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  sort_order?: number
}

export interface RewardItem {
  id?: string
  title: string
  description?: string
  value?: string
  sort_order?: number
}

export interface DocumentItem {
  id?: string
  title: string
  file_url: string
  file_type?: string
  sort_order?: number
}

export interface ResultItem {
  id?: string
  title: string
  description?: string
  result_url?: string
  published_at?: string
  sort_order?: number
}

export interface SectionItem {
  id?: string
  section_key: string
  title: string
  content?: string
  sort_order?: number
  is_visible?: boolean
}

export interface ContestEventListItem {
  id: string
  slug?: string
  title: string
  subtitle?: string
  short_description?: string
  banner_url?: string
  organizer_logo_url?: string
  organizer_name?: string
  category?: EventCategory
  mode?: EventMode
  venue?: string
  prize_pool?: string
  prize_type?: PrizeType
  publication_status?: PublicationStatus
  registration_is_open?: boolean
  registration_end_date?: string
  event_start_date: string
  event_end_date?: string
  participant_count: number
  max_participants?: number
  contest_status: ContestStatus
  is_registered: boolean
  registration_status?: RegistrationStatus
  created_at?: string
  updated_at?: string
  created_by_user_type?: string
  is_cancelled?: boolean
  is_postponed?: boolean
  is_published?: boolean
  visibility_labels?: string[]
}

export interface ContestEventDetail extends ContestEventListItem {
  long_description?: string
  organizer_website?: string
  organizer_email?: string
  organizer_phone?: string
  venue?: string
  eligibility?: string
  about_organizer?: string
  support_email?: string
  support_phone?: string
  support_content?: string
  registration_start_date?: string
  registration_limit?: number
  registration_button_text?: string
  registration_external_url?: string
  visibility: VisibilitySettings
  view_count: number
  faqs: FAQItem[]
  rounds: RoundItem[]
  rewards: RewardItem[]
  documents: DocumentItem[]
  results: ResultItem[]
  sections: SectionItem[]
  updated_at?: string
  is_cancelled?: boolean
  is_postponed?: boolean
  cancellation_reason?: string
  postponed_reason?: string
  cancelled_at?: string
  postponed_at?: string
}

export interface ContestEventListResponse {
  events: ContestEventListItem[]
  total_count: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ContestEventCreatePayload {
  title: string
  slug?: string
  short_description?: string
  subtitle?: string
  long_description?: string
  banner_url?: string
  organizer_logo_url?: string
  organizer_name?: string
  organizer_website?: string
  organizer_email?: string
  organizer_phone?: string
  venue?: string
  mode?: EventMode
  category?: EventCategory
  registration_start_date?: string
  registration_end_date?: string
  event_start_date: string
  event_end_date?: string
  max_participants?: number
  registration_limit?: number
  prize_pool?: string
  prize_type?: PrizeType
  eligibility?: string
  about_organizer?: string
  support_email?: string
  support_phone?: string
  support_content?: string
  visibility?: VisibilitySettings
  registration_button_text?: string
  registration_external_url?: string
  publication_status?: PublicationStatus
  registration_is_open?: boolean
  faqs?: FAQItem[]
  rounds?: RoundItem[]
  rewards?: RewardItem[]
  documents?: DocumentItem[]
  results?: ResultItem[]
  sections?: SectionItem[]
}

export type ContestEventUpdatePayload = Partial<
  Omit<ContestEventCreatePayload, 'banner_url' | 'organizer_logo_url'>
> & {
  banner_url?: string | null
  organizer_logo_url?: string | null
}

export interface ContestEventAnalytics {
  total_views: number
  unique_visitors: number
  registrations: number
  dropouts: number
  completed: number
  certificates_issued: number
  daily_registrations: { date: string; views: number; registrations: number }[]
  top_universities: { name: string; count: number }[]
  top_branches: { name: string; count: number }[]
  top_locations: { name: string; count: number }[]
}

export interface EventRegistrationItem {
  id: string
  user_id?: string
  user_type?: string
  student_name?: string
  email?: string
  university_name?: string
  branch?: string
  location?: string
  status: string
  registration_date: string
}

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'coding_contest', label: 'Coding Contest' },
  { value: 'campus_drive', label: 'Campus Drive' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'ai_competition', label: 'AI Competition' },
  { value: 'placement_drive', label: 'Placement Drive' },
  { value: 'technical_quiz', label: 'Technical Quiz' },
  { value: 'innovation_challenge', label: 'Innovation Challenge' },
  { value: 'startup_pitch', label: 'Startup Pitch' },
  { value: 'technology', label: 'Technology' },
  { value: 'placement', label: 'Placement' },
  { value: 'competition', label: 'Competition' },
  { value: 'corporate_drive', label: 'Corporate Drive' },
  { value: 'university', label: 'University' },
]

export const CONTEST_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  live: 'Live',
  closed: 'Closed',
  archived: 'Archived',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
  draft: 'Draft',
}

export const CATEGORY_LABELS: Record<string, string> = {
  technology: 'Technology',
  placement: 'Placement',
  hackathon: 'Hackathon',
  workshop: 'Workshop',
  competition: 'Competition',
  seminar: 'Seminar',
  corporate_drive: 'Corporate Drive',
  university: 'University',
  coding_contest: 'Coding Contest',
  campus_drive: 'Campus Drive',
  ai_competition: 'AI Competition',
  placement_drive: 'Placement Drive',
  technical_quiz: 'Technical Quiz',
  innovation_challenge: 'Innovation Challenge',
  startup_pitch: 'Startup Pitch',
}
