import { apiClient } from '@/lib/api'

export interface DashboardStats {
    totalJobs: number
    appliedJobs: number
    selected: number
    rejected: number
}

export interface JobApplication {
    id: string
    job_id?: string
    internship_id?: string
    job_title: string
    company_name: string
    status: string
    applied_at: string
    cover_letter?: string
    expected_salary?: number
    expected_stipend?: number
    availability_date: string
    interview_date?: string
    interview_location?: string
    corporate_notes?: string
    type: 'job' | 'internship'
}

export interface JobSearchResponse {
    jobs: any[]
    total_count: number
    page: number
    limit: number
    total_pages: number
}

class DashboardService {
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            // Check if user is authenticated
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            // Get student dashboard stats from the dedicated endpoint
            const response = await apiClient.getStudentDashboard()
            
            return {
                totalJobs: response.total_jobs || 0,
                appliedJobs: response.applied_jobs || 0,
                selected: response.selected || 0,
                rejected: response.rejected || 0
            }
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error)
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 403) {
                throw new Error('Access denied. You do not have permission to view this data.')
            } else if (error.response?.status === 404) {
                throw new Error('Dashboard data not found.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else if (error.message === 'User not authenticated. Please log in.') {
                throw error
            } else {
                throw new Error('Unable to fetch dashboard data. Please try again later.')
            }
        }
    }

    async getAppliedJobs(): Promise<JobApplication[]> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.getStudentAppliedJobs()
            return response.applications || []
        } catch (error: any) {
            console.error('Error fetching applied jobs:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 403) {
                throw new Error('Access denied. You do not have permission to view this data.')
            } else {
                throw new Error('Unable to fetch applied jobs. Please try again later.')
            }
        }
    }

    async getAvailableJobs(page: number = 1, limit: number = 20): Promise<JobSearchResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.getAvailableJobs(page, limit)
            return response
        } catch (error: any) {
            console.error('Error fetching available jobs:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 403) {
                throw new Error('Access denied. You do not have permission to view this data.')
            } else {
                throw new Error('Unable to fetch available jobs. Please try again later.')
            }
        }
    }
}

export const dashboardService = new DashboardService()
