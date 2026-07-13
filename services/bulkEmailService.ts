import { apiClient } from '@/lib/api'
import {
    BulkEmailCategory,
    BulkEmailLogsResponse,
    BulkEmailRecipientsResponse,
    BulkEmailSendRequest,
    BulkEmailSendResponse,
    BulkEmailStatusFilter,
    BulkEmailUploadResponse,
} from '@/types/bulkEmail'

function ensureAuth() {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated.')
    }
}

export class BulkEmailService {
    async getRecipients(
        category: BulkEmailCategory = 'all',
        status: BulkEmailStatusFilter = 'all'
    ): Promise<BulkEmailRecipientsResponse> {
        ensureAuth()
        const response = await apiClient.client.get<BulkEmailRecipientsResponse>(
            '/admin/bulk-email/recipients',
            {
                params: {
                    category: category === 'all' ? undefined : category,
                    status: status === 'all' ? undefined : status,
                },
            }
        )
        return response.data
    }

    async searchUsers(
        query: string,
        category: BulkEmailCategory = 'all',
        limit = 20,
        offset = 0
    ): Promise<BulkEmailRecipientsResponse> {
        ensureAuth()
        const response = await apiClient.client.get<BulkEmailRecipientsResponse>(
            '/admin/bulk-email/search',
            {
                params: {
                    q: query,
                    category: category === 'all' ? undefined : category,
                    limit,
                    offset,
                },
            }
        )
        return response.data
    }

    async uploadCsv(file: File): Promise<BulkEmailUploadResponse> {
        ensureAuth()
        const formData = new FormData()
        formData.append('file', file)
        const response = await apiClient.client.post<BulkEmailUploadResponse>(
            '/admin/bulk-email/upload',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        )
        return response.data
    }

    async sendBulkEmail(payload: BulkEmailSendRequest): Promise<BulkEmailSendResponse> {
        ensureAuth()
        const response = await apiClient.client.post<BulkEmailSendResponse>(
            '/admin/bulk-email/send',
            payload
        )
        return response.data
    }

    async getLogs(limit = 10): Promise<BulkEmailLogsResponse> {
        ensureAuth()
        const response = await apiClient.client.get<BulkEmailLogsResponse>(
            '/admin/bulk-email/logs',
            { params: { limit } }
        )
        return response.data
    }
}

export const bulkEmailService = new BulkEmailService()
