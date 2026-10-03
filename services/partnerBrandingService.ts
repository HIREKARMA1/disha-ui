import { apiClient } from '@/lib/api'
import { config } from '@/lib/config'

export type PartnerBrandingListingStatus = 'active' | 'inactive' | 'hidden'

export type PartnerBrandingAdminItem = {
  id: string
  corporate_id: string
  company_name: string
  corporate_email?: string
  corporate_verified: boolean
  proposed_logo_url: string
  status: string
  rejection_reason?: string
  visible: boolean
  listing_status: PartnerBrandingListingStatus
  sort_order?: number
  created_at: string
  updated_at: string
}

export type PartnerBrandingStats = {
  pending: number
  rejected: number
  approved_total: number
  active: number
  inactive: number
  hidden: number
  approved_visible?: number
  approved_hidden?: number
}

export type PublicBrandingLogo = {
  id: string
  name: string
  logo: string
}

export type CorporateBrandingStatus = {
  homepage_status: 'none' | 'pending' | 'approved' | 'rejected'
  visible_on_homepage: boolean
  rejection_reason?: string | null
  proposed_logo_url?: string | null
}

class PartnerBrandingService {
  async getStats(): Promise<PartnerBrandingStats> {
    const res = await apiClient.client.get('/admin/branding-logos/stats')
    return res.data
  }

  async list(params?: {
    status?: string
    visible?: boolean
    listing_status?: PartnerBrandingListingStatus
    page?: number
    page_size?: number
  }): Promise<{ items: PartnerBrandingAdminItem[]; total: number }> {
    const res = await apiClient.client.get('/admin/branding-logos', { params })
    const data = res.data
    return {
      ...data,
      items: (data.items || []).map((item: PartnerBrandingAdminItem) => ({
        ...item,
        listing_status: normalizeListingStatus(item),
      })),
    }
  }

  async approve(id: string): Promise<void> {
    await apiClient.client.post(`/admin/branding-logos/${id}/approve`)
  }

  async reject(id: string, reason: string): Promise<void> {
    await apiClient.client.post(`/admin/branding-logos/${id}/reject`, { reason })
  }

  async setVisibility(id: string, visible: boolean): Promise<void> {
    await apiClient.client.patch(`/admin/branding-logos/${id}/visibility`, { visible })
  }

  async setListingStatus(id: string, listing_status: PartnerBrandingListingStatus): Promise<void> {
    await apiClient.client.patch(`/admin/branding-logos/${id}/listing-status`, { listing_status })
  }

  async delete(id: string): Promise<void> {
    await apiClient.client.delete(`/admin/branding-logos/${id}`)
  }

  async getPublicLogos(): Promise<PublicBrandingLogo[]> {
    const url = `${config.api.fullUrl}/public/branding-logos`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.logos || []
  }

  async getCorporateBrandingStatus(): Promise<CorporateBrandingStatus> {
    const res = await apiClient.client.get('/corporates/branding-status')
    return res.data
  }
}

function normalizeListingStatus(item: PartnerBrandingAdminItem): PartnerBrandingListingStatus {
  const raw = item.listing_status || (item.visible ? 'active' : 'hidden')
  if (raw === 'inactive' || raw === 'hidden') return raw
  return 'active'
}

export const partnerBrandingService = new PartnerBrandingService()
