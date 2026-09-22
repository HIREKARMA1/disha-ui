import { apiClient } from '@/lib/api'
import type {
  CampusDriveRequest,
  CampusDriveRequestListResponse,
  CampusDriveRequestStudentStatus,
} from '@/types/campusDriveRequest'

export class CampusDriveRequestService {
  async getMyRequestForJob(jobId: string): Promise<CampusDriveRequestStudentStatus> {
    const response = await apiClient.client.get(`/campus-drive-requests/job/${jobId}`)
    return response.data
  }

  async createRequest(jobId: string): Promise<CampusDriveRequest> {
    const response = await apiClient.client.post('/campus-drive-requests', {
      job_id: jobId,
    })
    return response.data
  }

  async listAdmin(params: {
    status?: string
    skip?: number
    limit?: number
  } = {}): Promise<CampusDriveRequestListResponse> {
    const response = await apiClient.client.get('/admin/campus-drive-requests', { params })
    return response.data
  }

  async accept(id: string): Promise<CampusDriveRequest> {
    const response = await apiClient.client.post(`/admin/campus-drive-requests/${id}/accept`)
    return response.data
  }

  async reject(id: string): Promise<CampusDriveRequest> {
    const response = await apiClient.client.post(`/admin/campus-drive-requests/${id}/reject`)
    return response.data
  }
}

export const campusDriveRequestService = new CampusDriveRequestService()
