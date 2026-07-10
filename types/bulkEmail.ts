export type BulkEmailCategory = 'all' | 'student' | 'corporate' | 'university'
export type BulkEmailStatusFilter = 'all' | 'verified' | 'unverified' | 'active' | 'inactive'

export interface BulkEmailRecipient {
    name?: string | null
    email: string
    user_type?: string | null
    status?: string | null
    is_verified?: boolean | null
}

export interface BulkEmailRecipientsResponse {
    count: number
    users: BulkEmailRecipient[]
    limit?: number
    offset?: number
}

export interface BulkEmailUploadResponse {
    success: boolean
    imported: number
    emails: string[]
}

export interface BulkEmailSendRequest {
    category?: BulkEmailCategory
    status?: BulkEmailStatusFilter
    subject: string
    body: string
    emails: string[]
}

export interface BulkEmailSendResponse {
    success: boolean
    message: string
    log_id?: string | null
    recipient_count?: number | null
    success_count?: number | null
    failure_count?: number | null
    queued?: boolean
    error?: string | null
}

export interface BulkEmailLog {
    id: string
    subject: string
    recipient_count: number
    category?: string | null
    status_filter?: string | null
    sent_by_admin: string
    sent_at: string
    success_count: number
    failure_count: number
}

export interface BulkEmailLogsResponse {
    logs: BulkEmailLog[]
    total: number
}

export type RecipientSource = 'filter' | 'manual' | 'imported' | 'search'

export interface ManagedRecipient extends BulkEmailRecipient {
    source: RecipientSource
}
