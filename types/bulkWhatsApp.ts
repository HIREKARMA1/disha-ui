export type BulkWhatsAppCategory = 'all' | 'student' | 'corporate' | 'university'
export type BulkWhatsAppStatusFilter = 'all' | 'verified' | 'unverified' | 'active' | 'inactive'

export interface BulkWhatsAppRecipient {
    name?: string | null
    phone: string
    email?: string | null
    user_type?: string | null
    status?: string | null
    is_verified?: boolean | null
    college?: string | null
    branch?: string | null
    company?: string | null
}

export interface BulkWhatsAppRecipientsResponse {
    count: number
    users: BulkWhatsAppRecipient[]
}

export interface BulkWhatsAppCsvRecipient {
    phone: string
    name?: string | null
}

export interface BulkWhatsAppUploadResponse {
    success: boolean
    imported: number
    recipients: BulkWhatsAppCsvRecipient[]
}

export interface BulkWhatsAppSendRecipient {
    phone: string
    name?: string | null
    email?: string | null
    college?: string | null
    branch?: string | null
    company?: string | null
}

export interface BulkWhatsAppSendRequest {
    category?: BulkWhatsAppCategory
    status?: BulkWhatsAppStatusFilter
    campaign_name: string
    message: string
    recipients: BulkWhatsAppSendRecipient[]
}

export interface BulkWhatsAppSendResponse {
    success: boolean
    message: string
    campaign_id: string
    recipient_count: number
    queued?: boolean
}

export interface BulkWhatsAppLog {
    id: string
    campaign_id: string
    campaign_name: string
    message: string
    recipient_name?: string | null
    recipient_phone: string
    recipient_email?: string | null
    status: string
    twilio_sid?: string | null
    error_message?: string | null
    category?: string | null
    status_filter?: string | null
    created_by: string
    tenant_id: string
    created_at: string
    updated_at: string
}

export interface BulkWhatsAppLogsResponse {
    logs: BulkWhatsAppLog[]
    total: number
}

export interface BulkWhatsAppStatistics {
    messages_sent: number
    delivered: number
    failed: number
    pending: number
    total: number
}

export type WhatsAppRecipientSource = 'filter' | 'manual' | 'imported' | 'search'

export interface ManagedWhatsAppRecipient extends BulkWhatsAppRecipient {
    source: WhatsAppRecipientSource
}
