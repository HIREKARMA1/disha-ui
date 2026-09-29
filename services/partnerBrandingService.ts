import { apiClient } from '@/lib/api'
import { config } from '@/lib/config'

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
  sort_order?: number
  created_at: string
  updated_at: string
}

export type PartnerBrandingStats = {
  pending: number
  approved_visible: number
  rejected: number
  approved_hidden: number
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
    page?: number
    page_size?: number
  }): Promise<{ items: PartnerBrandingAdminItem[]; total: number }> {
    const res = await apiClient.client.get('/admin/branding-logos', { params })
    return res.data
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

export const partnerBrandingService = new PartnerBrandingService()
