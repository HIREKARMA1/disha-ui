import { apiClient } from '@/lib/api'
import {
    BulkWhatsAppCategory,
    BulkWhatsAppConfig,
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
        const templateName = (payload.template_name || '').trim()
        if (!templateName) {
            throw new Error('Please select an approved WhatsApp template')
        }
        const body: BulkWhatsAppSendRequest = {
            ...payload,
            template_name: templateName,
            template_params: Array.isArray(payload.template_params) ? payload.template_params : [],
        }
        try {
            const response = await apiClient.client.post<BulkWhatsAppSendResponse>(
                '/admin/bulk-whatsapp/send',
                body
            )
            return response.data
        } catch (error: any) {
            // 502 responses include the full BulkWhatsAppSendResponse body with provider errors.
            const data = error?.response?.data
            if (data && typeof data === 'object' && 'success' in data) {
                return data as BulkWhatsAppSendResponse
            }
            throw error
        }
    }

    async getConfig(): Promise<BulkWhatsAppConfig> {
        ensureAuth()
        const response = await apiClient.client.get<BulkWhatsAppConfig>(
            '/admin/bulk-whatsapp/config'
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
