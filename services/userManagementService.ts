import { apiClient } from '@/lib/api'
import {
    AdminUserListParams,
    AdminUserListResponse,
    AdminUserStatsResponse,
} from '@/types/userManagement'

export class UserManagementService {
    /**
     * Fetch users for the admin user management table.
     */
    async getUsers(params: AdminUserListParams = {}): Promise<AdminUserListResponse> {
        if (!apiClient.isAuthenticated()) {
            throw new Error('User not authenticated. Please log in.')
        }

        try {
            const response = await apiClient.client.get('/admins/users', { params })
            return response.data
        } catch (error: any) {
            console.error('Error fetching users:', error)

            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            }
            if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to fetch users.')
        }
    }

    /**
     * Fetch aggregate user counts for the admin user management header.
     */
    async getUserStats(): Promise<AdminUserStatsResponse> {
        if (!apiClient.isAuthenticated()) {
            throw new Error('User not authenticated. Please log in.')
        }

        try {
            const response = await apiClient.client.get('/admins/stats/users')
            return response.data
        } catch (error: any) {
            console.error('Error fetching user stats:', error)

            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            }
            if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to fetch user statistics.')
        }
    }

    /**
     * Export filtered users as a CSV spreadsheet download.
     */
    async exportUsers(params: AdminUserListParams = {}): Promise<Blob> {
        if (!apiClient.isAuthenticated()) {
            throw new Error('User not authenticated. Please log in.')
        }

        try {
            const response = await apiClient.client.get('/admins/users/export', {
                params,
                responseType: 'blob',
            })
            return response.data
        } catch (error: any) {
            console.error('Error exporting users:', error)

            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            }
            if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to export users.')
        }
    }
}

export const userManagementService = new UserManagementService()
