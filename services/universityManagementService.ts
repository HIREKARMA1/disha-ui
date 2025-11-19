import { apiClient } from '@/lib/api'
import { 
  UniversityListResponse,
  UniversityListItem,
  UniversityProfile,
  CreateUniversityRequest,
  CreateUniversityResponse,
  UpdateUniversityRequest,
  ArchiveUniversityRequest
} from '@/types/university'

export class UniversityManagementService {
  /**
   * Get all universities for admin management
   */
  async getUniversities(includeArchived: boolean = false): Promise<UniversityListResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get('/admins/universities', {
        params: {
          include_archived: includeArchived
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching universities:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to fetch universities.')
      }
    }
  }

  /**
   * Get university profile by ID
   */
  async getUniversityProfile(universityId: string): Promise<UniversityProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get(`/admins/universities/${universityId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching university profile:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('University not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to fetch university profile.')
      }
    }
  }

  /**
   * Create a new university
   */
  async createUniversity(data: CreateUniversityRequest): Promise<CreateUniversityResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.post('/admins/universities', data)
      return response.data
    } catch (error: any) {
      console.error('Error creating university:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 422) {
        throw new Error('Invalid data provided. Please check your input.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to create university.')
      }
    }
  }

  /**
   * Update university profile
   */
  async updateUniversity(universityId: string, data: UpdateUniversityRequest): Promise<UniversityProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.put(`/admins/universities/${universityId}`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating university:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('University not found.')
      } else if (error.response?.status === 422) {
        throw new Error('Invalid data provided. Please check your input.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to update university.')
      }
    }
  }

  /**
   * Archive/Unarchive university (soft delete)
   */
  async archiveUniversity(universityId: string, isArchived: boolean): Promise<{ message: string }> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.patch(`/admins/universities/${universityId}/archive`, {
        is_archived: isArchived
      })
      return response.data
    } catch (error: any) {
      console.error('Error archiving university:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('University not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to archive university.')
      }
    }
  }

  /**
   * Delete university permanently (hard delete)
   */
  async deleteUniversity(universityId: string): Promise<{ message: string }> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.delete(`/admins/universities/${universityId}`)
      return response.data
    } catch (error: any) {
      console.error('Error deleting university:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('University not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to delete university.')
      }
    }
  }

  /**
   * Verify/Unverify university
   */
  async verifyUniversity(universityId: string, verified: boolean): Promise<{ message: string }> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.patch(`/admins/universities/${universityId}/verify`, {
        verified: verified
      })
      return response.data
    } catch (error: any) {
      console.error('Error verifying university:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('University not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to verify university.')
      }
    }
  }
}

// Export singleton instance
export const universityManagementService = new UniversityManagementService()


