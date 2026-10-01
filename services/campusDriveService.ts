import { apiClient } from '@/lib/api'
import type {
  CampusDriveDetail,
  CampusDriveListResponse,
  CampusDriveWritePayload,
} from '@/types/campusDrive'

class CampusDriveService {
  async listAdmin(params: Record<string, unknown> = {}): Promise<CampusDriveListResponse> {
    const response = await apiClient.client.get('/campus-drives', { params })
    return response.data
  }

  async listPublic(params: Record<string, unknown> = {}): Promise<CampusDriveListResponse> {
    const response = await apiClient.client.get('/campus-drives/public', { params })
    return response.data
  }

  async getAdmin(id: string): Promise<CampusDriveDetail> {
    const response = await apiClient.client.get(`/campus-drives/${id}`)
    return response.data
  }

  async getPublic(slug: string): Promise<CampusDriveDetail> {
    const response = await apiClient.client.get(`/campus-drives/public/${encodeURIComponent(slug)}`)
    return response.data
  }

  async create(data: CampusDriveWritePayload): Promise<CampusDriveDetail> {
    const response = await apiClient.client.post('/campus-drives', data)
    return response.data
  }

  async update(id: string, data: CampusDriveWritePayload): Promise<CampusDriveDetail> {
    const response = await apiClient.client.put(`/campus-drives/${id}`, data)
    return response.data
  }

  async publish(id: string): Promise<CampusDriveDetail> {
    const response = await apiClient.client.post(`/campus-drives/${id}/publish`)
    return response.data
  }

  async unpublish(id: string): Promise<CampusDriveDetail> {
    const response = await apiClient.client.post(`/campus-drives/${id}/unpublish`)
    return response.data
  }

  async remove(id: string): Promise<void> {
    await apiClient.client.delete(`/campus-drives/${id}`)
  }

  async uploadFile(file: File, fileType: 'banner' | 'logo'): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post(`/campus-drives/upload?file_type=${fileType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }
}

export const campusDriveService = new CampusDriveService()

export function apiErrorMessage(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: { detail?: unknown } } })?.response?.data
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const labels: Record<string, string> = {
      organizer_email: 'Organizer Email',
      support_email: 'Support Email',
      organizer_phone: 'Organizer Phone',
      support_phone: 'Support Phone',
      event_link: 'Event Link',
      event_start_date: 'Campus Drive Start',
      event_end_date: 'Campus Drive End',
      registration_start_date: 'Registration Start',
      registration_end_date: 'Registration End',
      title: 'Event Title',
    }
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object' || !('msg' in item)) return ''
        const loc = Array.isArray((item as { loc?: unknown }).loc)
          ? (item as { loc: unknown[] }).loc.map(String).filter((part) => part !== 'body')
          : []
        const key = loc[loc.length - 1] || ''
        let msg = String((item as { msg: string }).msg).replace(/^Value error,\s*/i, '')
        const label = labels[key]
        if (label && !msg.toLowerCase().includes(label.toLowerCase())) msg = `${label}: ${msg}`
        return msg
      })
      .filter(Boolean)
    if (messages.length) return messages.join(', ')
  }
  return fallback
}
