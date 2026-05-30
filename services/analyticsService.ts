import { apiClient } from '@/lib/api'
import type {
  CorporateAnalyticsData,
  StudentAnalyticsData,
  UniversityAnalyticsData,
  UserRole,
} from '@/types/analytics'

class AnalyticsService {
  async getStudentAnalytics(): Promise<StudentAnalyticsData> {
    return apiClient.getStudentAnalytics()
  }

  async getUniversityAnalytics(): Promise<UniversityAnalyticsData> {
    return apiClient.getUniversityAnalytics()
  }

  async getCorporateAnalytics(): Promise<CorporateAnalyticsData> {
    return apiClient.getCorporateAnalytics()
  }

  async getAnalyticsForRole(role: UserRole) {
    switch (role) {
      case 'student':
        return this.getStudentAnalytics()
      case 'university':
        return this.getUniversityAnalytics()
      case 'corporate':
        return this.getCorporateAnalytics()
      default:
        throw new Error(`Unsupported analytics role: ${role}`)
    }
  }
}

export const analyticsService = new AnalyticsService()
