export interface AdminDashboardData {
    total_users: number
    total_corporates: number
    total_students: number
    total_universities: number
    total_jobs: number
    total_applications: number
    active_jobs: number
    pending_approvals: number
    recent_activities: AdminActivity[]
    monthly_stats: {
        sessions: number
        unique_users: number
        avg_session_duration: number
        page_views: number
    }
    top_industries: Array<{
        name: string
        count: number
    }>
    top_locations: Array<{
        name: string
        count: number
    }>
    analytics: {
        real_time_metrics: Array<{
            metric_name: string
            value: number
            change_percentage: number
        }>
        kpis: Array<{
            kpi_name: string
            current_value: number
            performance_status: string
        }>
        alerts: Array<{
            id: string
            metric_name: string
            severity: string
            message: string
        }>
    }
}

export interface AdminActivity {
    id: string
    type: 'user_registration' | 'job_posted' | 'application_submitted' | 'system_alert' | 'admin_action'
    title: string
    description: string
    timestamp: string
    user_id?: string
    user_name?: string
    metadata?: Record<string, any>
}

export interface AdminUserStats {
    total_users: number
    total_corporates: number
    total_students: number
    total_universities: number
}

export interface AdminJobStats {
    total_jobs: number
    total_applications: number
    active_jobs: number
    pending_approvals: number
}

export interface AdminProfile {
    // Basic information
    id: string
    email: string
    name: string
    phone?: string
    status: string
    email_verified: boolean
    phone_verified: boolean
    created_at: string
    updated_at?: string
    last_login?: string
    
    // Profile fields
    profile_picture?: string
    bio?: string
    
    // Admin specific fields
    role?: string
    permissions?: string[]
    tenant_id?: string
}

export interface AdminProfileUpdateData {
    // Basic information
    name?: string
    phone?: string
    bio?: string
    profile_picture?: string
    
    // Admin specific fields
    role?: string
    permissions?: string[]
}