export type EventRequestStatus = 'pending' | 'approved' | 'rejected' | 'converted'

export interface EventRequest {
  id: string
  tenant_id: string
  requester_name: string
  organization: string
  event_type: string
  phone: string
  email: string
  concept: string
  status: EventRequestStatus
  admin_note?: string | null
  processed_by?: string | null
  processed_at?: string | null
  created_event_id?: string | null
  created_at: string
  updated_at: string
}

export interface EventRequestCreatePayload {
  name: string
  organization: string
  event_type: string
  phone: string
  email: string
  concept: string
}

export interface EventRequestListResponse {
  event_requests: EventRequest[]
  total_count: number
}
