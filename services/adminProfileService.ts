import { apiClient } from '@/lib/api'
import { 
  AdminProfile, 
  AdminProfileUpdateData 
} from '@/types/admin'
import { FileUploadResponse } from '@/types/corporate'

export class AdminProfileService {
  /**
   * Get admin profile
   */
  async getProfile(): Promise<AdminProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get('/admins/profile')
      return response.data
    } catch (error: any) {
      console.error('Error fetching admin profile:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('Profile not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to fetch profile.')
      }
    }
  }

  /**
   * Update admin profile
   */
  async updateProfile(data: AdminProfileUpdateData): Promise<AdminProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.put('/admins/profile', data)
      return response.data
    } catch (error: any) {
      console.error('Error updating admin profile:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 422) {
        throw new Error('Invalid data provided. Please check your input.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to update profile.')
      }
    }
  }

  /**
   * Upload admin profile picture
   */
  async uploadProfilePicture(file: File): Promise<FileUploadResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.client.post('/admins/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error: any) {
      console.error('Error uploading profile picture:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please choose a smaller image.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to upload profile picture.')
      }
    }
  }
}

// Export singleton instance
export const adminProfileService = new AdminProfileService()
