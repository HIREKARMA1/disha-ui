import { apiClient } from '@/lib/api'
import { 
  CorporateListResponse,
  CorporateListItem,
  CorporateProfile,
  CreateCorporateRequest,
  CreateCorporateResponse,
  UpdateCorporateRequest,
  ArchiveCorporateRequest
} from '@/types/corporate'

export class CorporateManagementService {
  /**
   * Get all corporates for admin management
   */
  async getCorporates(includeArchived: boolean = false): Promise<CorporateListResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get('/admins/corporates', {
        params: {
          include_archived: includeArchived
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching corporates:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to fetch corporates.')
      }
    }
  }

  /**
   * Get corporate profile by ID
   */
  async getCorporateProfile(corporateId: string): Promise<CorporateProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get(`/admins/corporates/${corporateId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching corporate profile:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('Corporate not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to fetch corporate profile.')
      }
    }
  }

  /**
   * Create a new corporate
   */
  async createCorporate(data: CreateCorporateRequest): Promise<CreateCorporateResponse> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.post('/admins/corporates', data)
      return response.data
    } catch (error: any) {
      console.error('Error creating corporate:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 422) {
        throw new Error('Invalid data provided. Please check your input.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to create corporate.')
      }
    }
  }

  /**
   * Create a corporate from Campus Drive admin flow (name + logo).
   * The admin create API requires email and phone; we generate a unique onboarding email
   * and a placeholder phone, then attach the uploaded logo via profile update.
   */
  async createCorporateWithLogo(companyName: string, logoUrl: string): Promise<CorporateListItem> {
    const trimmed = companyName.trim()
    if (!trimmed) {
      throw new Error('Corporate name is required')
    }
    if (!logoUrl.trim()) {
      throw new Error('Corporate logo is required')
    }

    const existing = await this.getCorporates(false)
    const duplicate = existing.corporates.find(
      (item) => item.company_name.trim().toLowerCase() === trimmed.toLowerCase() && !item.is_archived,
    )
    if (duplicate) {
      throw new Error('A corporate with this name already exists. Select it from the list instead.')
    }

    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
    const unique = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : String(Date.now())
    const email = `campus-drive.${slug || 'corp'}.${unique}@onboarding.disha.local`
    const phone = '9999999999'

    const created = await this.createCorporate({
      company_name: trimmed,
      email,
      phone,
    })
    await this.updateCorporate(created.corporate_id, { company_logo: logoUrl })

    return {
      id: created.corporate_id,
      company_name: trimmed,
      email: created.email,
      phone,
      verified: false,
      status: 'active',
      created_at: new Date().toISOString(),
      is_archived: false,
      company_logo: logoUrl,
    }
  }

  /**
   * Update corporate profile
   */
  async updateCorporate(corporateId: string, data: UpdateCorporateRequest): Promise<CorporateProfile> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.put(`/admins/corporates/${corporateId}`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating corporate:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('Corporate not found.')
      } else if (error.response?.status === 422) {
        throw new Error('Invalid data provided. Please check your input.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to update corporate.')
      }
    }
  }

  /**
   * Archive/Unarchive corporate (soft delete)
   */
  async archiveCorporate(corporateId: string, isArchived: boolean): Promise<{ message: string }> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.patch(`/admins/corporates/${corporateId}/archive`, {
        is_archived: isArchived
      })
      return response.data
    } catch (error: any) {
      console.error('Error archiving corporate:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('Corporate not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to archive corporate.')
      }
    }
  }

  /**
   * Delete corporate permanently (hard delete)
   */
  async deleteCorporate(corporateId: string): Promise<{ message: string }> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.delete(`/admins/corporates/${corporateId}`)
      return response.data
    } catch (error: any) {
      console.error('Error deleting corporate:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('Corporate not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to delete corporate.')
      }
    }
  }

  /**
   * Verify/Unverify corporate
   */
  async verifyCorporate(corporateId: string, verified: boolean): Promise<{ message: string }> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.patch(`/admins/corporates/${corporateId}/verify`, {
        verified: verified
      })
      return response.data
    } catch (error: any) {
      console.error('Error verifying corporate:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status === 404) {
        throw new Error('Corporate not found.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to verify corporate.')
      }
    }
  }

  /**
   * Export corporates to CSV
   */
  async exportCorporates(includeArchived: boolean = false): Promise<Blob> {
    try {
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
      }

      const response = await apiClient.client.get('/admins/corporates/export', {
        params: {
          include_archived: includeArchived
        },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      console.error('Error exporting corporates:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else {
        throw new Error(error.response?.data?.detail || 'Failed to export corporates.')
      }
    }
  }
}

// Export singleton instance
export const corporateManagementService = new CorporateManagementService()

