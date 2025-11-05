/**
 * Lookup Service
 * Professional, reusable service for fetching lookup data from the API
 */

import { apiClient } from '@/lib/api'

export interface LookupItem {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
  tenant_id?: string
}

export interface LookupResponse {
  total: number
  skip: number
  limit: number
}

export interface LookupOptions {
  skip?: number
  limit?: number
}

class LookupService {
  private cache = new Map<string, { data: LookupItem[]; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Generic method to fetch lookup data with caching
   */
  private async fetchLookupData<T>(
    endpoint: string,
    options: LookupOptions = {}
  ): Promise<T> {
    const { skip = 0, limit = 100 } = options
    const cacheKey = `${endpoint}-${skip}-${limit}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as unknown as T
    }

    try {
      const response = await apiClient.client.get(endpoint, {
        params: { skip, limit }
      })
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
      
      return response.data
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Get all branches
   */
  async getBranches(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ branches: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/branches',
        options
      )
      
      // Handle different response structures
      let branches: any[] = []
      
      if (response) {
        // If response has a branches property, use it
        if (response.branches && Array.isArray(response.branches)) {
          branches = response.branches
        }
        // If response is directly an array (shouldn't happen but handle it)
        else if (Array.isArray(response)) {
          branches = response
        }
        // If response has data property
        else if ((response as any).data && Array.isArray((response as any).data)) {
          branches = (response as any).data
        }
      }
      
      // Convert IDs to strings and ensure all required fields are present
      const normalizedBranches = branches
        .filter((branch: any) => {
          // Only filter out entries that are completely invalid
          if (!branch) return false
          // Filter out entries without names
          if (!branch.name) return false
          return true
        })
        .map((branch: any) => ({
          id: String(branch.id || branch.name || `branch-${branch.name?.replace(/\s+/g, '-') || 'unknown'}`), // Ensure ID is string
          name: String(branch.name || '').trim(),
          description: branch.description || '',
          created_at: branch.created_at,
          updated_at: branch.updated_at,
          tenant_id: branch.tenant_id
        }))
        .filter((branch) => branch.name.length > 0) // Final filter to remove empty names
      
      const expectedCount = response.total || branches.length || 0
      if (normalizedBranches.length !== expectedCount) {
        // Clear cache for this endpoint to force fresh fetch next time
        this.clearCache('/admin/lookups/branches')
      }
      
      return normalizedBranches
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      return []
    }
  }

  /**
   * Get all degrees
   */
  async getDegrees(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ degrees: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/degrees',
        options
      )
      
      // Handle different response structures
      let degrees: any[] = []
      
      if (response) {
        // If response has a degrees property, use it
        if (response.degrees && Array.isArray(response.degrees)) {
          degrees = response.degrees
        }
        // If response is directly an array (shouldn't happen but handle it)
        else if (Array.isArray(response)) {
          degrees = response
        }
        // If response has data property
        else if ((response as any).data && Array.isArray((response as any).data)) {
          degrees = (response as any).data
        }
      }
      
      // Convert IDs to strings and ensure all required fields are present
      const normalizedDegrees = degrees
        .filter((degree: any) => {
          // Only filter out entries that are completely invalid
          if (!degree) return false
          // Filter out entries without names
          if (!degree.name) return false
          return true
        })
        .map((degree: any) => ({
          id: String(degree.id || degree.name || `degree-${degree.name?.replace(/\s+/g, '-') || 'unknown'}`), // Ensure ID is string
          name: String(degree.name || '').trim(),
          description: degree.description || '',
          created_at: degree.created_at,
          updated_at: degree.updated_at,
          tenant_id: degree.tenant_id
        }))
        .filter((degree) => degree.name.length > 0) // Final filter to remove empty names
      
      const expectedCount = response.total || degrees.length || 0
      if (normalizedDegrees.length !== expectedCount) {
        // Clear cache for this endpoint to force fresh fetch next time
        this.clearCache('/admin/lookups/degrees')
      }
      
      return normalizedDegrees
    } catch (error) {
      console.error('Failed to fetch degrees:', error)
      return []
    }
  }

  /**
   * Get all skills
   */
  async getSkills(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ skills: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/skills',
        options
      )
      return response.skills || []
    } catch (error) {
      console.error('Failed to fetch skills:', error)
      return []
    }
  }

  /**
   * Get all soft skills
   */
  async getSoftSkills(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ soft_skills: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/soft-skills',
        options
      )
      return response.soft_skills || []
    } catch (error) {
      console.error('Failed to fetch soft skills:', error)
      return []
    }
  }

  /**
   * Get all industries
   */
  async getIndustries(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ industries: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/industries',
        options
      )
      return response.industries || []
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      return []
    }
  }

  /**
   * Get all colleges
   */
  async getColleges(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ colleges: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/colleges',
        options
      )
      return response.colleges || []
    } catch (error) {
      console.error('Failed to fetch colleges:', error)
      return []
    }
  }

  async getUniversities(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      // Use practice universities endpoint - available to all authenticated users including students
      const response = await apiClient.client.get('/practice/universities')
      
      // Transform university data to lookup format - just extract university names
      const universities = response.data.universities || []
      return universities.map((uni: any) => ({
        id: uni.id,
        name: uni.university_name,
        description: uni.institute_type || 'University',
        created_at: uni.created_at,
        updated_at: uni.updated_at
      }))
    } catch (error) {
      console.error('Failed to fetch universities:', error)
      return []
    }
  }

  /**
   * Get all job categories
   */
  async getJobCategories(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ job_categories: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/job-categories',
        options
      )
      return response.job_categories || []
    } catch (error) {
      console.error('Failed to fetch job categories:', error)
      return []
    }
  }

  /**
   * Get all job roles
   */
  async getJobRoles(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ job_roles: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/job-roles',
        options
      )
      return response.job_roles || []
    } catch (error) {
      console.error('Failed to fetch job roles:', error)
      return []
    }
  }

  /**
   * Get all location preferences
   */
  async getLocationPreferences(options: LookupOptions = {}): Promise<LookupItem[]> {
    try {
      const response = await this.fetchLookupData<{ location_preferences: LookupItem[]; total: number; skip: number; limit: number }>(
        '/admin/lookups/location-preferences',
        options
      )
      return response.location_preferences || []
    } catch (error) {
      console.error('Failed to fetch location preferences:', error)
      return []
    }
  }

  /**
   * Clear cache for specific endpoint or all cache
   */
  clearCache(endpoint?: string): void {
    if (endpoint) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.startsWith(endpoint)
      )
      keysToDelete.forEach(key => this.cache.delete(key))
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
export const lookupService = new LookupService()

// Export class for testing or custom instances
export { LookupService }
