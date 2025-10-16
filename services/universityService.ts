/**
 * University Service
 * Service for fetching universities from the backend API
 */

import { apiClient } from '@/lib/api'

export interface University {
  id: string
  university_name: string
  email: string
  phone?: string
  institute_type?: string
  address?: string
  website_url?: string
  contact_person_name?: string
  contact_designation?: string
  verified: boolean
  status: string
  established_year?: number
  courses_offered?: string
  created_at?: string
  updated_at?: string
  is_archived: boolean
}

export interface UniversitiesResponse {
  universities: University[]
  total_universities: number
  active_universities: number
  archived_universities: number
}

export interface LookupItem {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

class UniversityService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch all universities from the admin endpoint
   */
  async getAllUniversities(): Promise<UniversitiesResponse> {
    const cacheKey = 'all-universities'
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached universities data')
      return cached.data as UniversitiesResponse
    }

    try {
      const response = await apiClient.client.get('/admin/lookups/universities')
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })

      return response.data
    } catch (error) {
      console.error('Failed to fetch universities:', error)
      throw error
    }
  }

  /**
   * Get universities formatted for lookup dropdown
   */
  async getUniversitiesForLookup(): Promise<LookupItem[]> {
    try {
      const response = await this.getAllUniversities()
      
      // Filter out archived universities and format for lookup
      const activeUniversities = response.universities
        .filter(university => !university.is_archived && university.verified)
        .map(university => ({
          id: university.id,
          name: university.university_name,
          description: university.institute_type || 'University',
          created_at: university.created_at,
          updated_at: university.updated_at
        }))
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically

      return activeUniversities
    } catch (error) {
      console.error('Failed to fetch universities for lookup:', error)
      return []
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

export const universityService = new UniversityService()
