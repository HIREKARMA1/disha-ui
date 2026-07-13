import { apiClient } from '@/lib/api'
import type {
  ContestEventAnalytics,
  ContestEventCreatePayload,
  ContestEventUpdatePayload,
  ContestEventDetail,
  ContestEventListResponse,
  EventRegistrationItem,
} from '@/types/contestEvent'

export class ContestEventService {
  // Public endpoints
  async listPublicEvents(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
    prize_type?: string
    registered_only?: boolean
  } = {}): Promise<ContestEventListResponse> {
    const response = await apiClient.client.get('/events/public', { params })
    return response.data
  }

  async getUpcomingEvents(limit = 5): Promise<ContestEventListResponse> {
    const response = await apiClient.client.get('/events/public/upcoming', { params: { limit } })
    return response.data
  }

  async getEventBySlug(slug: string, visitorId?: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.get(`/events/public/${slug}`, {
      params: visitorId ? { visitor_id: visitorId } : undefined,
    })
    return response.data
  }

  async registerForEvent(slug: string): Promise<{ id: string; status: string; event_slug?: string }> {
    const response = await apiClient.client.post(`/events/public/${slug}/register`)
    return response.data
  }

  // Admin endpoints
  async listAdminEvents(params: Record<string, unknown> = {}): Promise<ContestEventListResponse> {
    const response = await apiClient.client.get('/events/contests', { params })
    return response.data
  }

  async getAdminEvent(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.get(`/events/contests/${eventId}`)
    return response.data
  }

  async createEvent(data: ContestEventCreatePayload): Promise<ContestEventDetail> {
    const response = await apiClient.client.post('/events/contests', data)
    return response.data
  }

  async updateEvent(eventId: string, data: ContestEventUpdatePayload): Promise<ContestEventDetail> {
    const response = await apiClient.client.put(`/events/contests/${eventId}`, data)
    return response.data
  }

  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.client.delete(`/events/contests/${eventId}`)
  }

  async publishEvent(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/publish`)
    return response.data
  }

  async unpublishEvent(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/unpublish`)
    return response.data
  }

  async closeEvent(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/close`)
    return response.data
  }

  async archiveEvent(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/archive`)
    return response.data
  }

  async cancelEvent(eventId: string, reason: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/cancel`, { reason })
    return response.data
  }

  async postponeEvent(
    eventId: string,
    data: { event_start_date: string; event_end_date?: string; registration_end_date?: string; reason: string }
  ): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/postpone`, data)
    return response.data
  }

  async duplicateEvent(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/duplicate`)
    return response.data
  }

  async openRegistration(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/registration/open`)
    return response.data
  }

  async closeRegistration(eventId: string): Promise<ContestEventDetail> {
    const response = await apiClient.client.post(`/events/contests/${eventId}/registration/close`)
    return response.data
  }

  async getRegistrations(eventId: string, search?: string): Promise<EventRegistrationItem[]> {
    const response = await apiClient.client.get(`/events/contests/${eventId}/registrations`, {
      params: search ? { search } : undefined,
    })
    return response.data
  }

  async updateRegistrationStatus(eventId: string, registrationId: string, status: string): Promise<EventRegistrationItem> {
    const response = await apiClient.client.patch(
      `/events/contests/${eventId}/registrations/${registrationId}`,
      { status }
    )
    return response.data
  }

  async exportRegistrations(eventId: string): Promise<Blob> {
    const response = await apiClient.client.get(`/events/contests/${eventId}/registrations/export`, {
      responseType: 'blob',
    })
    return response.data
  }

  async exportRegistrationsExcel(eventId: string): Promise<Blob> {
    const response = await apiClient.client.get(`/events/contests/${eventId}/registrations/export/excel`, {
      responseType: 'blob',
    })
    return response.data
  }

  async getAnalytics(eventId: string): Promise<ContestEventAnalytics> {
    const response = await apiClient.client.get(`/events/contests/${eventId}/analytics`)
    return response.data
  }

  async uploadFile(file: File, fileType: 'banner' | 'logo' | 'document'): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post(`/events/contests/upload?file_type=${fileType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
}

export const contestEventService = new ContestEventService()
