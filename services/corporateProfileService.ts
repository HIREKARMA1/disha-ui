import { apiClient } from '@/lib/api'
import { 
  CorporateProfile, 
  CorporateProfileUpdateData, 
  FileUploadResponse 
} from '@/types/corporate'

export class CorporateProfileService {
  /**
   * Get corporate profile
   */
  async getProfile(): Promise<CorporateProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get('/corporates/profile')
      return response.data
    } catch (error: any) {
      console.error('Error fetching corporate profile:', error)
      
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
   * Update corporate profile
   */
  async updateProfile(data: CorporateProfileUpdateData): Promise<CorporateProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.put('/corporates/profile', data)
      return response.data
    } catch (error: any) {
      console.error('Error updating corporate profile:', error)
      
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
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<FileUploadResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.client.post('/corporates/upload/profile-picture', formData, {
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

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(file: File): Promise<FileUploadResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.client.post('/corporates/upload-company-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error: any) {
      console.error('Error uploading company logo:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please choose a smaller image.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to upload company logo.')
      }
    }
  }

  /**
   * Upload MCA/GST certificate
   */
  async uploadCertificate(file: File): Promise<FileUploadResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.client.post('/corporates/upload/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error: any) {
      console.error('Error uploading certificate:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please choose a smaller file.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to upload certificate.')
      }
    }
  }

}

// Export singleton instance
export const corporateProfileService = new CorporateProfileService()
