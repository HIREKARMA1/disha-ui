import { apiClient } from '@/lib/api'
import {
  SupportPaymentDecision,
  SupportQuery,
  SupportQueryListParams,
  SupportQueryListResponse,
  SupportQueryStatus,
} from '@/types/supportQuery'

function ensureAuth() {
  if (!apiClient.isAuthenticated()) {
    throw new Error('User not authenticated.')
  }
}

export class SupportQueryService {
  async list(params: SupportQueryListParams = {}): Promise<SupportQueryListResponse> {
    ensureAuth()
    const response = await apiClient.client.get<SupportQueryListResponse>('/admin/support-queries', {
      params: {
        status: params.status || undefined,
        enquiry_type: params.enquiry_type || undefined,
        q: params.q?.trim() || undefined,
        date_from: params.date_from || undefined,
        date_to: params.date_to || undefined,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    })
    return response.data
  }

  async listAll(params: Omit<SupportQueryListParams, 'limit' | 'offset'> = {}): Promise<SupportQuery[]> {
    const pageSize = 200
    const maxRows = 10000
    const rows: SupportQuery[] = []
    let offset = 0
    while (rows.length < maxRows) {
      const page = await this.list({ ...params, limit: pageSize, offset })
      const batch = page.queries || []
      rows.push(...batch)
      if (rows.length >= (page.total || 0) || batch.length === 0) {
        break
      }
      offset += pageSize
    }
    return rows
  }

  async updateStatus(queryNumber: number, status: SupportQueryStatus): Promise<SupportQuery> {
    ensureAuth()
    const response = await apiClient.client.patch<SupportQuery>(
      `/admin/support-queries/${queryNumber}`,
      { status }
    )
    return response.data
  }

  async updatePayment(
    queryNumber: number,
    decision: SupportPaymentDecision
  ): Promise<SupportQuery> {
    ensureAuth()
    const response = await apiClient.client.patch<SupportQuery>(
      `/admin/support-queries/${queryNumber}/payment`,
      { decision }
    )
    return response.data
  }
}

export const supportQueryService = new SupportQueryService()
