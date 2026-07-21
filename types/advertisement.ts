export type AdvertisementPlacement = 'left_sidebar' | 'right_sidebar'

export interface Advertisement {
  id: string
  title: string
  description: string
  image_url: string
  redirect_url?: string | null
  button_text?: string | null
  display_order: number
  placement: AdvertisementPlacement
  page_type: string
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
  event_id?: string | null
  event_slug?: string | null
  created_by: string
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface AdvertisementCreatePayload {
  title: string
  description: string
  image_url: string
  redirect_url?: string | null
  button_text?: string | null
  display_order?: number
  placement: AdvertisementPlacement
  page_type?: string
  is_active?: boolean
  start_date?: string | null
  end_date?: string | null
  event_id?: string | null
}

export type AdvertisementUpdatePayload = Partial<AdvertisementCreatePayload>

export interface AdvertisementListResponse {
  advertisements: Advertisement[]
  total_count: number
}

export const ADVERTISEMENT_PLACEMENTS: { value: AdvertisementPlacement; label: string }[] = [
  { value: 'left_sidebar', label: 'Left Sidebar' },
  { value: 'right_sidebar', label: 'Right Sidebar' },
]
