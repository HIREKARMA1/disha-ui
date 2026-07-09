import { apiClient } from '@/lib/api'
import {
    BulkWhatsAppCategory,
    BulkWhatsAppLogsResponse,
    BulkWhatsAppRecipientsResponse,
    BulkWhatsAppSendRequest,
    BulkWhatsAppSendResponse,
    BulkWhatsAppStatistics,
    BulkWhatsAppStatusFilter,
    BulkWhatsAppUploadResponse,
} from '@/types/bulkWhatsApp'

function ensureAuth() {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated.')
    }
}

export class BulkWhatsAppService {
    async getRecipients(
        category: BulkWhatsAppCategory = 'all',
        status: BulkWhatsAppStatusFilter = 'all',
        query?: string
    ): Promise<BulkWhatsAppRecipientsResponse> {
        ensureAuth()
        const response = await apiClient.client.get<BulkWhatsAppRecipientsResponse>(
            '/admin/bulk-whatsapp/recipients',
            {
                params: {
                    category: category === 'all' ? undefined : category,
                    status: status === 'all' ? undefined : status,
                    query: query?.trim() || undefined,
                },
            }
        )
        return response.data
    }

    async uploadCsv(file: File): Promise<BulkWhatsAppUploadResponse> {
        ensureAuth()
        const formData = new FormData()
        formData.append('file', file)
        const response = await apiClient.client.post<BulkWhatsAppUploadResponse>(
            '/admin/bulk-whatsapp/upload',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        )
        return response.data
    }

    async sendBulkWhatsApp(payload: BulkWhatsAppSendRequest): Promise<BulkWhatsAppSendResponse> {
        ensureAuth()
        const response = await apiClient.client.post<BulkWhatsAppSendResponse>(
            '/admin/bulk-whatsapp/send',
            payload
        )
        return response.data
    }

    async getLogs(limit = 20, offset = 0): Promise<BulkWhatsAppLogsResponse> {
        ensureAuth()
        const response = await apiClient.client.get<BulkWhatsAppLogsResponse>(
            '/admin/bulk-whatsapp/logs',
            { params: { limit, offset } }
        )
        return response.data
    }

    async getStatistics(): Promise<BulkWhatsAppStatistics> {
        ensureAuth()
        const response = await apiClient.client.get<BulkWhatsAppStatistics>(
            '/admin/bulk-whatsapp/statistics'
        )
        return response.data
    }
}

export const bulkWhatsAppService = new BulkWhatsAppService()
