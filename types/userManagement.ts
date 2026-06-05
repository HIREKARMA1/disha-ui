import { UserType } from '@/types/auth'

export interface AdminUserListItem {
    id: string
    name?: string | null
    display_name?: string | null
    email: string
    phone?: string | null
    user_type: UserType
    status?: string | null
    is_verified: boolean
    email_verified: boolean
    phone_verified: boolean
    created_at?: string | null
    last_login?: string | null
    location?: string | null
    institution?: string | null
    degree?: string | null
    branch?: string | null
    company_name?: string | null
    industry?: string | null
    university_name?: string | null
    institute_type?: string | null
    profile_completion_percentage?: number | null
    is_archived?: boolean | null
}

export interface AdminUserListResponse {
    users: AdminUserListItem[]
    total_count: number
    page: number
    limit: number
    total_pages: number
}

export interface AdminUserStatsResponse {
    total_users: number
    active_users: number
    new_users_this_month: number
    verified_users: number
    user_type_distribution: Record<UserType, number>
    students?: number
    corporates?: number
    universities?: number
    admins?: number
}

export interface AdminUserListParams {
    query?: string
    user_type?: UserType
    status?: string
    is_verified?: boolean
    location?: string
    created_after?: string
    created_before?: string
    page?: number
    limit?: number
    fetch_all?: boolean
}
