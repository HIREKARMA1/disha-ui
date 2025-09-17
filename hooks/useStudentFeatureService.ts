import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { StudentFeatureWithAccess } from '@/types/student-features'

interface FeatureServiceHook {
  // Career Align
  getRecommendedJobs: (limit?: number) => Promise<any>
  getAppliedJobs: () => Promise<any>
  
  // Analytics
  getDashboard: () => Promise<any>
  getProfileCompletion: () => Promise<any>
  
  // Practice Tests
  getPracticeTests: () => Promise<any>
  startPracticeTest: (testId: string) => Promise<any>
  getPracticeTestResults: (attemptId: string) => Promise<any>
  
  // Video Search
  searchVideos: (query: string, skip?: number, limit?: number) => Promise<any>
  getVideoCategories: () => Promise<any>
  bookmarkVideo: (videoId: string) => Promise<any>
  
  // Library
  getLibraryResources: (page?: number, limit?: number, query?: string, categoryId?: number | null) => Promise<any>
  getLibraryCategories: () => Promise<any>
  downloadLibraryResource: (resourceId: string) => Promise<any>
  
  // Resume Builder
  getResumeTemplates: () => Promise<any>
  generateResume: (templateId: string, data: any) => Promise<any>
  uploadResume: (file: File) => Promise<any>
  
  // Sadhana
  getSadhanaDashboard: () => Promise<any>
  getSadhanaProgress: () => Promise<any>
  logSadhanaActivity: (activityData: any) => Promise<any>
  
  // Sangha
  getSanghaCommunity: () => Promise<any>
  getSanghaEvents: () => Promise<any>
  joinSanghaGroup: (groupId: string) => Promise<any>
  
  // Loading states
  loading: boolean
  error: string | null
}

export function useStudentFeatureService(): FeatureServiceHook {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Career Align Feature
  const getRecommendedJobs = useCallback(async (limit: number = 10) => {
    return handleApiCall(() => apiClient.getRecommendedJobs(limit))
  }, [handleApiCall])

  const getAppliedJobs = useCallback(async () => {
    return handleApiCall(() => apiClient.getAppliedJobs())
  }, [handleApiCall])

  // Analytics Feature
  const getDashboard = useCallback(async () => {
    return handleApiCall(() => apiClient.getStudentDashboard())
  }, [handleApiCall])

  const getProfileCompletion = useCallback(async () => {
    return handleApiCall(() => apiClient.getProfileCompletion())
  }, [handleApiCall])

  // Practice Tests Feature
  const getPracticeTests = useCallback(async () => {
    return handleApiCall(() => apiClient.getPracticeTests())
  }, [handleApiCall])

  const startPracticeTest = useCallback(async (testId: string) => {
    return handleApiCall(() => apiClient.startPracticeTest(testId))
  }, [handleApiCall])

  const getPracticeTestResults = useCallback(async (attemptId: string) => {
    return handleApiCall(() => apiClient.getPracticeTestResults(attemptId))
  }, [handleApiCall])

  // Video Search Feature
  const searchVideos = useCallback(async (query: string, skip: number = 0, limit: number = 12) => {
    return handleApiCall(() => apiClient.searchVideos(query, skip, limit))
  }, [handleApiCall])

  const getVideoCategories = useCallback(async () => {
    return handleApiCall(() => apiClient.getVideoCategories())
  }, [handleApiCall])

  const bookmarkVideo = useCallback(async (videoId: string) => {
    return handleApiCall(() => apiClient.bookmarkVideo(videoId))
  }, [handleApiCall])

  // Library Feature
  const getLibraryResources = useCallback(async (page: number = 1, limit: number = 12, query: string = '', categoryId: number | null = null) => {
    return handleApiCall(() => apiClient.getLibraryResources(page, limit, query, categoryId))
  }, [handleApiCall])

  const getLibraryCategories = useCallback(async () => {
    return handleApiCall(() => apiClient.getLibraryCategories())
  }, [handleApiCall])

  const downloadLibraryResource = useCallback(async (resourceId: string) => {
    return handleApiCall(() => apiClient.downloadLibraryResource(resourceId))
  }, [handleApiCall])

  // Resume Builder Feature
  const getResumeTemplates = useCallback(async () => {
    return handleApiCall(() => apiClient.getResumeTemplates())
  }, [handleApiCall])

  const generateResume = useCallback(async (templateId: string, data: any) => {
    return handleApiCall(() => apiClient.generateResume(templateId, data))
  }, [handleApiCall])

  const uploadResume = useCallback(async (file: File) => {
    return handleApiCall(() => apiClient.uploadResume(file))
  }, [handleApiCall])

  // Sadhana Feature
  const getSadhanaDashboard = useCallback(async () => {
    return handleApiCall(() => apiClient.getSadhanaDashboard())
  }, [handleApiCall])

  const getSadhanaProgress = useCallback(async () => {
    return handleApiCall(() => apiClient.getSadhanaProgress())
  }, [handleApiCall])

  const logSadhanaActivity = useCallback(async (activityData: any) => {
    return handleApiCall(() => apiClient.logSadhanaActivity(activityData))
  }, [handleApiCall])

  // Sangha Feature
  const getSanghaCommunity = useCallback(async () => {
    return handleApiCall(() => apiClient.getSanghaCommunity())
  }, [handleApiCall])

  const getSanghaEvents = useCallback(async () => {
    return handleApiCall(() => apiClient.getSanghaEvents())
  }, [handleApiCall])

  const joinSanghaGroup = useCallback(async (groupId: string) => {
    return handleApiCall(() => apiClient.joinSanghaGroup(groupId))
  }, [handleApiCall])

  return {
    // Career Align
    getRecommendedJobs,
    getAppliedJobs,
    
    // Analytics
    getDashboard,
    getProfileCompletion,
    
    // Practice Tests
    getPracticeTests,
    startPracticeTest,
    getPracticeTestResults,
    
    // Video Search
    searchVideos,
    getVideoCategories,
    bookmarkVideo,
    
    // Library
    getLibraryResources,
    getLibraryCategories,
    downloadLibraryResource,
    
    // Resume Builder
    getResumeTemplates,
    generateResume,
    uploadResume,
    
    // Sadhana
    getSadhanaDashboard,
    getSadhanaProgress,
    logSadhanaActivity,
    
    // Sangha
    getSanghaCommunity,
    getSanghaEvents,
    joinSanghaGroup,
    
    // Loading states
    loading,
    error
  }
}

// Feature-specific service hooks for better organization
export function useCareerAlignService() {
  const service = useStudentFeatureService()
  return {
    getRecommendedJobs: service.getRecommendedJobs,
    getAppliedJobs: service.getAppliedJobs,
    loading: service.loading,
    error: service.error
  }
}

export function useAnalyticsService() {
  const service = useStudentFeatureService()
  return {
    getDashboard: service.getDashboard,
    getProfileCompletion: service.getProfileCompletion,
    loading: service.loading,
    error: service.error
  }
}

export function usePracticeService() {
  const service = useStudentFeatureService()
  return {
    getPracticeTests: service.getPracticeTests,
    startPracticeTest: service.startPracticeTest,
    getPracticeTestResults: service.getPracticeTestResults,
    loading: service.loading,
    error: service.error
  }
}

export function useVideoSearchService() {
  const service = useStudentFeatureService()
  return {
    searchVideos: service.searchVideos,
    getVideoCategories: service.getVideoCategories,
    bookmarkVideo: service.bookmarkVideo,
    loading: service.loading,
    error: service.error
  }
}

export function useLibraryService() {
  const service = useStudentFeatureService()
  return {
    getLibraryResources: service.getLibraryResources,
    getLibraryCategories: service.getLibraryCategories,
    downloadLibraryResource: service.downloadLibraryResource,
    loading: service.loading,
    error: service.error
  }
}

export function useResumeService() {
  const service = useStudentFeatureService()
  return {
    getResumeTemplates: service.getResumeTemplates,
    generateResume: service.generateResume,
    uploadResume: service.uploadResume,
    loading: service.loading,
    error: service.error
  }
}

export function useSadhanaService() {
  const service = useStudentFeatureService()
  return {
    getSadhanaDashboard: service.getSadhanaDashboard,
    getSadhanaProgress: service.getSadhanaProgress,
    logSadhanaActivity: service.logSadhanaActivity,
    loading: service.loading,
    error: service.error
  }
}

export function useSanghaService() {
  const service = useStudentFeatureService()
  return {
    getSanghaCommunity: service.getSanghaCommunity,
    getSanghaEvents: service.getSanghaEvents,
    joinSanghaGroup: service.joinSanghaGroup,
    loading: service.loading,
    error: service.error
  }
}
