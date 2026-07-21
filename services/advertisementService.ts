import { apiClient } from '@/lib/api'
import type {
  Advertisement,
  AdvertisementCreatePayload,
  AdvertisementListResponse,
  AdvertisementUpdatePayload,
} from '@/types/advertisement'

export class AdvertisementService {
  /** Public: active ads for a page (e.g. events) */
  async listPublic(params: { page?: string; placement?: string } = {}): Promise<AdvertisementListResponse> {
    const response = await apiClient.client.get('/advertisements', {
      params: { page: params.page ?? 'events', placement: params.placement },
    })
    return response.data
  }

  async listAdmin(params: Record<string, unknown> = {}): Promise<AdvertisementListResponse> {
    const response = await apiClient.client.get('/admin/advertisements', { params })
    return response.data
  }

  async getById(id: string): Promise<Advertisement> {
    const response = await apiClient.client.get(`/admin/advertisements/${id}`)
    return response.data
  }

  async listByEventId(eventId: string): Promise<Advertisement[]> {
    const result = await this.listAdmin({ event_id: eventId, limit: 20 })
    return result.advertisements
  }

  async getByEventId(eventId: string): Promise<Advertisement | null> {
    const ads = await this.listByEventId(eventId)
    return ads[0] ?? null
  }

  async create(data: AdvertisementCreatePayload): Promise<Advertisement> {
    const response = await apiClient.client.post('/admin/advertisements', data)
    return response.data
  }

  async update(id: string, data: AdvertisementUpdatePayload): Promise<Advertisement> {
    const response = await apiClient.client.put(`/admin/advertisements/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.client.delete(`/admin/advertisements/${id}`)
  }

  async uploadImage(file: File): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post('/admin/advertisements/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
}

export const advertisementService = new AdvertisementService()
