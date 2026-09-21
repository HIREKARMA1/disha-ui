export type SupportQueryStatus = 'not_resolved' | 'connected' | 'resolved'

export type SupportEnquiryType = 'disha' | 'shortlisted' | 'batch_enroll'

export type SupportPaymentStatus =
  | 'none'
  | 'awaiting_offline'
  | 'awaiting_verification'
  | 'approved'
  | 'rejected'

export type SupportPaymentDecision = 'approved' | 'rejected'

export interface SupportQuery {
  id: string
  query_number: number
  user_phone: string
  problem: string
  status: SupportQueryStatus | string
  enquiry_type?: SupportEnquiryType | string | null
  applicant_name?: string | null
  payment_mode?: string | null
  payment_status?: SupportPaymentStatus | string | null
  resume_url?: string | null
  payment_screenshot_url?: string | null
  enrollment_data?: Record<string, unknown> | null
  updated_by_phone: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface SupportQueryKpis {
  total: number
  not_resolved: number
  connected: number
  resolved: number
}

export interface SupportQueryListResponse {
  queries: SupportQuery[]
  total: number
  kpis: SupportQueryKpis
}

export interface SupportQueryListParams {
  status?: SupportQueryStatus | ''
  enquiry_type?: SupportEnquiryType | ''
  q?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}
