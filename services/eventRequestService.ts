import { apiClient } from '@/lib/api'
import type {
  EventRequest,
  EventRequestCreatePayload,
  EventRequestListResponse,
  EventRequestStatus,
} from '@/types/eventRequest'

export class EventRequestService {
  /** Public: submit Create-an-Event form */
  async submit(data: EventRequestCreatePayload): Promise<EventRequest> {
    const response = await apiClient.client.post('/event-requests', data)
    return response.data
  }

  async getStatus(id: string): Promise<{ id: string; status: EventRequestStatus }> {
    const response = await apiClient.client.get(`/event-requests/${id}/status`)
    return response.data
  }

  async listAdmin(params: { status?: string; skip?: number; limit?: number } = {}): Promise<EventRequestListResponse> {
    const response = await apiClient.client.get('/admin/event-requests', { params })
    return response.data
  }

  async approve(id: string, admin_note?: string): Promise<EventRequest> {
    const response = await apiClient.client.post(`/admin/event-requests/${id}/approve`, {
      admin_note: admin_note || null,
    })
    return response.data
  }

  async reject(id: string, admin_note?: string): Promise<EventRequest> {
    const response = await apiClient.client.post(`/admin/event-requests/${id}/reject`, {
      admin_note: admin_note || null,
    })
    return response.data
  }

  async convert(id: string, event_id: string): Promise<EventRequest> {
    const response = await apiClient.client.post(`/admin/event-requests/${id}/convert`, {
      event_id,
    })
    return response.data
  }
}

export const eventRequestService = new EventRequestService()
