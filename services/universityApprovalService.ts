import { apiClient } from '@/lib/api'
import type { UniversityApprovalListResponse } from '@/types/universityApproval'

export class UniversityApprovalService {
  async listAdmin(params: {
    status?: string
    search?: string
    skip?: number
    limit?: number
  } = {}): Promise<UniversityApprovalListResponse> {
    return apiClient.getUniversityApprovalsAdmin(params)
  }

  async approve(jobId: string, universityId: string) {
    return apiClient.approveUniversityJobAdmin(jobId, universityId)
  }

  async reject(jobId: string, universityId: string) {
    return apiClient.rejectUniversityJobAdmin(jobId, universityId)
  }
}

export const universityApprovalService = new UniversityApprovalService()
