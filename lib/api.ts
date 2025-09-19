import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from './config';
import { 
  StudentRegisterRequest, 
  CorporateRegisterRequest, 
  UniversityRegisterRequest, 
  AdminRegisterRequest,
  LoginRequest,
  TokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyPhoneRequest,
  UserInfo
} from '@/types/auth';
import {
  FeatureFlag,
  FeatureFlagCreate,
  FeatureFlagUpdate,
  UniversityFeatureFlag,
  UniversityFeatureUpdate,
  BulkUniversityFeatureUpdate,
  FeatureAccessRequest,
  FeatureAccessResponse,
  FeatureFlagHealthResponse,
  FeatureUsageStatsResponse,
  UniversityFeatureSummaryResponse,
  UniversityFeatureSaveResponse,
  BulkUpdateResponse
} from '@/types/feature-flags';
import {
  StudentFeature,
  StudentFeatureWithAccess,
  StudentFeaturesListResponse,
  StudentFeatureCreate,
  StudentFeatureUpdate
} from '@/types/student-features';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.fullUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        console.log('🔐 API Client: Auth token:', token ? 'Present' : 'Missing');
        console.log('🔐 API Client: Token value:', token);
        console.log('🔐 API Client: Request URL:', config.url);
        console.log('🔐 API Client: Request method:', config.method);
        console.log('🔐 API Client: Request data:', config.data);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 API Client: Authorization header set');
        } else {
          console.log('🔐 API Client: No token found, request will be unauthenticated');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to log responses and handle errors
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ API Error:', error.response?.status, error.config?.url);
        console.error('❌ API Error Data:', error.response?.data);
        console.error('❌ API Error Message:', error.message);
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            console.error('❌ Token refresh failed:', refreshError);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async registerStudent(data: StudentRegisterRequest): Promise<{ message: string; student_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post('/auth/register/student', data);
    return response.data;
  }

  async registerCorporate(data: CorporateRegisterRequest): Promise<{ message: string; corporate_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post('/auth/register/corporate', data);
    return response.data;
  }

  async registerUniversity(data: UniversityRegisterRequest): Promise<{ message: string; university_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post('/auth/register/university', data);
    return response.data;
  }

  async registerAdmin(data: AdminRegisterRequest): Promise<{ message: string; user_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post('/auth/register/admin', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response: AxiosResponse = await this.client.post('/auth/login', data);
    return response.data;
  }

  // Helper method to set auth tokens
  setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response: AxiosResponse = await this.client.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/logout');
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/reset-password', data);
    return response.data;
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/verify-email', data);
    return response.data;
  }

  async verifyPhone(data: VerifyPhoneRequest): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/verify-phone', data);
    return response.data;
  }

  async sendVerificationEmail(email: string, userType: string): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/send-verification-email', { email, user_type: userType });
    return response.data;
  }

  // Utility methods
  clearAuthTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Dashboard and data endpoints (legacy - use the one in comprehensive student features section)

  async getStudentAppliedJobs(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/applied-jobs');
    return response.data;
  }

  async getStudentApplications(params: {
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/applications', { params });
    return response.data;
  }

  async getAvailableJobs(page: number = 1, limit: number = 20): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/jobs/?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Job application endpoint
  async applyForJob(jobId: string, applicationData: any): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/applications/apply/${jobId}`, applicationData);
    return response.data;
  }

  // Corporate job management endpoints
  async createJob(jobData: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/jobs/', jobData);
    return response.data;
  }

  async getCorporateJobs(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/jobs/corporate/jobs');
    return response.data;
  }

  async updateJob(jobId: string, jobData: any): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/jobs/${jobId}`, jobData);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/jobs/${jobId}`);
    return response.data;
  }

  async changeJobStatus(jobId: string, status: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/jobs/${jobId}/status?status=${status}`);
    return response.data;
  }

  async getJobApplications(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/corporates/applications?job_id=${jobId}`);
    return response.data;
  }

  // Admin job management endpoints
  async getAllJobsAdmin(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/admins/jobs');
    return response.data;
  }

  async getAllUniversitiesAdmin(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/admins/universities');
    return response.data;
  }

  async getAssignedUniversitiesAdmin(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/admins/jobs/${jobId}/assigned-universities`);
    return response.data;
  }

  async getAppliedStudentsAdmin(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/admins/jobs/${jobId}/applied-students`);
    return response.data;
  }

  async assignJobToUniversity(jobId: string, universityId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/admins/jobs/${jobId}/assign-university?university_id=${universityId}`);
    return response.data;
  }

  async unassignJobFromUniversity(jobId: string, universityId: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/jobs/admin/${jobId}/unassign-university/${universityId}`);
    return response.data;
  }

  async updateJobAdmin(jobId: string, jobData: any): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/admins/jobs/${jobId}`, jobData);
    return response.data;
  }

  async deleteJobAdmin(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/admins/jobs/${jobId}`);
    return response.data;
  }

  async changeJobStatusAdmin(jobId: string, status: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/admins/jobs/${jobId}/status?status=${status}`);
    return response.data;
  }

  // Library endpoints
  async searchLibraryTopics(page: number = 1, limit: number = 12, query: string = '', categoryId: number | null = null): Promise<any> {
    const params: any = { page, limit };
    if (query) params.query = query;
    if (categoryId) params.category_id = categoryId;
    
    const response: AxiosResponse = await this.client.get('/library/search/', { params });
    return response.data;
  }

  // getLibraryCategories moved to comprehensive student features section

  // Career align endpoints
  async analyzeResume(formData: FormData): Promise<any> {
    const response: AxiosResponse = await this.client.post('/careeralign/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Student profile endpoints
  async getStudentProfile(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/profile');
    return response.data;
  }

  async updateStudentProfile(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put('/students/profile', data);
    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response: AxiosResponse = await this.client.post('/students/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }


  async uploadCertificate(file: File, certificateType: string): Promise<any> {
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('type', certificateType);

    const response: AxiosResponse = await this.client.post('/students/upload-certificate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteFile(fileType: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/students/files/${fileType}`);
    return response.data;
  }

  // Student feature endpoints (legacy - use getStudentFeaturesWithAccess instead)
  async getStudentFeaturesLegacy(): Promise<UniversityFeatureFlag[]> {
    const response: AxiosResponse = await this.client.get('/students/features');
    return response.data;
  }

  async checkStudentFeatureAccess(accessData: FeatureAccessRequest): Promise<FeatureAccessResponse> {
    const response: AxiosResponse = await this.client.post('/students/features/check-access', accessData);
    return response.data;
  }

  async getStudentProfileById(studentId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/admins/students/${studentId}/profile`);
    return response.data;
  }

  // University profile endpoints
  async getUniversityProfile(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/profile');
    return response.data;
  }

  async updateUniversityProfile(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put('/universities/profile', data);
    return response.data;
  }

  // University endpoints
  async getUniversityDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/dashboard');
    return response.data;
  }

  // University feature endpoints
  async getUniversityFeatures(): Promise<any[]> {
    const response: AxiosResponse = await this.client.get('/universities/features');
    return response.data;
  }

  async checkUniversityFeatureAccess(accessData: FeatureAccessRequest): Promise<FeatureAccessResponse> {
    const response: AxiosResponse = await this.client.post('/universities/features/check-access', accessData);
    return response.data;
  }

  async getUniversityStudents(includeArchived: boolean = false): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/students', {
      params: { include_archived: includeArchived }
    });
    return response.data;
  }

  async createStudent(studentData: any): Promise<any> {
    console.log('🌐 API Client: createStudent called with:', studentData)
    console.log('🌐 API Client: baseURL:', this.client.defaults.baseURL)
    console.log('🌐 API Client: full URL:', `${this.client.defaults.baseURL}/universities/students/create`)
    console.log('🌐 API Client: headers:', this.client.defaults.headers)
    
    try {
      console.log('🌐 API Client: Making POST request...')
      const response: AxiosResponse = await this.client.post('/universities/students/create', studentData);
      console.log('🌐 API Client: createStudent response:', response.data)
      return response.data;
    } catch (error: any) {
      console.error('🌐 API Client: createStudent error:', error)
      console.error('🌐 API Client: Error response:', error.response?.data)
      console.error('🌐 API Client: Error status:', error.response?.status)
      console.error('🌐 API Client: Error headers:', error.response?.headers)
      throw error;
    }
  }

  async bulkCreateStudents(studentsData: any[]): Promise<any> {
    const response: AxiosResponse = await this.client.post('/universities/students/bulk-create', {
      students: studentsData
    });
    return response.data;
  }

  async uploadStudentsCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await this.client.post('/universities/students/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadUniversityProfilePicture(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await this.client.post('/universities/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getStudentTemplate(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/students/template');
    return response.data;
  }

  async archiveStudent(studentId: string, archive: boolean = true): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/universities/students/${studentId}/archive`, {
      archive: archive
    });
    return response.data;
  }

  // Feature Flag Management Endpoints
  async createFeatureFlag(data: FeatureFlagCreate): Promise<FeatureFlag> {
    const response: AxiosResponse = await this.client.post('/admins/feature-flags', data);
    return response.data;
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response: AxiosResponse = await this.client.get('/admins/feature-flags');
    return response.data;
  }

  // Admin University Management
  async getUniversities(): Promise<Array<{ id: string; name: string; email: string; status: string }>> {
    console.log('🏢 Fetching universities...')
    try {
      const response: AxiosResponse = await this.client.get('/admins/users', {
        params: { user_type: 'university', limit: 100 }
      });
      console.log('✅ Universities response:', response.data)
      console.log('📊 Total users returned:', response.data.users?.length || 0)
      console.log('📋 User types in response:', response.data.users?.map((u: any) => u.user_type) || [])
      
      const universities = response.data.users.map((user: any) => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        status: user.status,
        user_type: user.user_type // Add this for debugging
      }));
      
      console.log('🏫 Processed universities:', universities)
      return universities;
    } catch (error: any) {
      console.error('❌ Error fetching universities:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      throw error
    }
  }

  async getFeatureFlag(featureId: string): Promise<FeatureFlag> {
    const response: AxiosResponse = await this.client.get(`/admins/feature-flags/${featureId}`);
    return response.data;
  }

  async updateFeatureFlag(featureId: string, data: FeatureFlagUpdate): Promise<FeatureFlag> {
    const response: AxiosResponse = await this.client.put(`/admins/feature-flags/${featureId}`, data);
    return response.data;
  }

  async deleteFeatureFlag(featureId: string): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.delete(`/admins/feature-flags/${featureId}`);
    return response.data;
  }

  async setUniversityFeatureFlag(universityId: string, featureKey: string, status: string, featureData?: any): Promise<UniversityFeatureFlag> {
    const response: AxiosResponse = await this.client.post(`/admins/feature-flags/university/${universityId}/toggle`, {
      feature_key: featureKey,
      status: status,
      custom_message: featureData?.custom_message,
      custom_settings: featureData?.custom_settings,
      allowed_user_types: featureData?.allowed_user_types,
      allowed_roles: featureData?.allowed_roles
    });
    return response.data;
  }


  async updateUniversityFeatureFlag(update: UniversityFeatureUpdate): Promise<UniversityFeatureFlag> {
    // Find the feature to get the feature_key
    const features = await this.getFeatureFlags();
    const feature = features.find(f => f.id === update.feature_flag_id);
    
    if (!feature) {
      throw new Error(`Feature with ID ${update.feature_flag_id} not found`);
    }
    
    const status = update.is_enabled ? 'enabled' : 'disabled';
    const featureData = {
      custom_message: update.reason,
      custom_config: update.custom_config
    };
    
    return this.setUniversityFeatureFlag(update.university_id, feature.feature_key, status, featureData);
  }

  async getUniversityFeatureFlags(universityId?: string): Promise<UniversityFeatureFlag[]> {
    if (universityId) {
      // Get specific university's feature flags
      const response: AxiosResponse = await this.client.get(`/admins/feature-flags/university/${universityId}/features`);
      return response.data;
    } else {
      // Get all university feature flags (this endpoint returns empty list, but keeping for compatibility)
      const response: AxiosResponse = await this.client.get('/admins/feature-flags/university');
      return response.data;
    }
  }

  async bulkUpdateUniversityFeatures(data: BulkUniversityFeatureUpdate): Promise<BulkUpdateResponse> {
    // Ensure university_id is a string, not an object
    const universityId = typeof data.university_id === 'string' ? data.university_id : String(data.university_id);
    
    // Transform the data to match backend expectations
    const transformedData = {
      university_id: universityId,
      feature_updates: data.feature_updates.map(update => ({
        feature_key: update.feature_key, // Backend expects feature_key, not feature_flag_id
        status: update.is_enabled ? 'enabled' : 'disabled', // Backend expects status string, not boolean
        custom_settings: update.custom_config,
        custom_message: update.reason
      })),
      reason: data.reason
    };
    
    console.log('🔄 Bulk update request data:', transformedData);
    console.log('🔄 Original data:', data);
    console.log('🔄 API endpoint:', `/admins/feature-flags/university/${universityId}/bulk-update`);
    console.log('🔄 Feature updates being sent:', transformedData.feature_updates.map(update => ({
      feature_key: update.feature_key,
      status: update.status,
      custom_message: update.custom_message
    })));
    
    try {
      const response: AxiosResponse = await this.client.post(`/admins/feature-flags/university/${universityId}/bulk-update`, transformedData);
      console.log('✅ Bulk update API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Bulk update API error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  }

  async getFeatureUsageStats(featureId?: string): Promise<FeatureUsageStatsResponse[]> {
    const params = featureId ? { feature_id: featureId } : {};
    const response: AxiosResponse = await this.client.get('/admins/feature-flags/usage-stats', { params });
    return response.data;
  }

  async getUniversityFeatureSummary(universityId: string): Promise<UniversityFeatureSummaryResponse> {
    const response: AxiosResponse = await this.client.get(`/admins/feature-flags/university/${universityId}/summary`);
    return response.data;
  }

  // New university features endpoints (matches API contract)
  async saveUniversityFeatures(universityId: string, enabledFeatures: string[]): Promise<UniversityFeatureSaveResponse> {
    console.log('🔄 Saving university features:', { universityId, enabledFeatures });
    const response: AxiosResponse = await this.client.post(`/universities/${universityId}/features`, {
      enabledFeatures
    });
    console.log('✅ University features saved:', response.data);
    return response.data;
  }

  async getUniversityFeaturesSummary(universityId: string): Promise<UniversityFeatureSaveResponse> {
    console.log('🔄 Getting university features summary:', universityId);
    const response: AxiosResponse = await this.client.get(`/universities/${universityId}/features/summary`);
    console.log('✅ University features summary:', response.data);
    return response.data;
  }

  async getFeatureFlagsHealth(): Promise<FeatureFlagHealthResponse> {
    const response: AxiosResponse = await this.client.get('/admins/feature-flags/health');
    return response.data;
  }


  // Public Feature Flag Health Check
  async getPublicFeatureFlagsHealth(): Promise<FeatureFlagHealthResponse> {
    const response: AxiosResponse = await this.client.get('/feature-flags/health');
    return response.data;
  }

  // Student Features endpoints
  async getStudentFeatures(): Promise<any[]> {
    const response: AxiosResponse = await this.client.get('/students/features');
    return response.data;
  }

  // Get university-specific features for a student
  async getStudentUniversityFeatures(studentId: string): Promise<any[]> {
    const response: AxiosResponse = await this.client.get(`/university-features/${studentId}`);
    return response.data;
  }

  // ============================================================================
  // COMPREHENSIVE STUDENT FEATURE ENDPOINTS
  // ============================================================================

  // Career Align Feature
  async getRecommendedJobs(limit: number = 10): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/recommended-jobs', {
      params: { limit }
    });
    return response.data;
  }

  async getAppliedJobs(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/applied-jobs');
    return response.data;
  }

  // Analytics Feature
  async getStudentDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/dashboard');
    return response.data;
  }

  async getProfileCompletion(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/profile-completion');
    return response.data;
  }

  // Practice Tests Feature
  async getPracticeTests(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/practice/student/tests');
    return response.data;
  }

  async startPracticeTest(testId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/practice/student/attempts', {
      test_id: testId
    });
    return response.data;
  }

  async getPracticeTestResults(attemptId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/practice/student/attempts/${attemptId}`);
    return response.data;
  }

  // Video Search Feature
  async searchVideos(query: string, skip: number = 0, limit: number = 12): Promise<any> {
    const response: AxiosResponse = await this.client.get('/videos/search', {
      params: { query, skip, limit }
    });
    return response.data;
  }

  async getVideoCategories(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/videos/categories');
    return response.data;
  }

  async bookmarkVideo(videoId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/videos/bookmark', {
      video_id: videoId
    });
    return response.data;
  }

  // Library Feature
  async getLibraryResources(page: number = 1, limit: number = 12, query: string = '', categoryId: number | null = null): Promise<any> {
    const params: any = { page, limit };
    if (query) params.query = query;
    if (categoryId) params.category_id = categoryId;
    
    const response: AxiosResponse = await this.client.get('/library/resources', { params });
    return response.data;
  }

  async getLibraryCategories(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/library/categories');
    return response.data;
  }

  async downloadLibraryResource(resourceId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/library/download', {
      resource_id: resourceId
    });
    return response.data;
  }

  // Resume Builder Feature
  async getResumeTemplates(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/resume/templates');
    return response.data;
  }

  async getTemplateById(templateId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/resume/templates/${templateId}`);
    return response.data;
  }

  async generateResume(templateId: string, data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/resume/generate', {
      template_id: templateId,
      ...data
    });
    return response.data;
  }

  async uploadResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await this.client.post('/students/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Resume Management Feature
  async createResume(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/resume/resumes', data);
    return response.data;
  }

  async getResumes(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/resume/resumes');
    return response.data;
  }

  async getResumeById(resumeId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/resume/resumes/${resumeId}`);
    return response.data;
  }

  async updateResume(resumeId: string, data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/resume/resumes/${resumeId}`, data);
    return response.data;
  }

  async deleteResume(resumeId: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/resume/resumes/${resumeId}`);
    return response.data;
  }

  async duplicateResume(resumeId: string, newName: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/resume/resumes/${resumeId}/duplicate`, {
      new_name: newName
    });
    return response.data;
  }

  // Sadhana Feature
  async getSadhanaDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/sadhana/student/dashboard');
    return response.data;
  }

  async getSadhanaProgress(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/sadhana/student/progress');
    return response.data;
  }

  async logSadhanaActivity(activityData: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/sadhana/student/activities', activityData);
    return response.data;
  }

  // Sangha Feature
  async getSanghaCommunity(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/sangha/student/community');
    return response.data;
  }

  async getSanghaEvents(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/sangha/student/events');
    return response.data;
  }

  async joinSanghaGroup(groupId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/sangha/student/join', {
      group_id: groupId
    });
    return response.data;
  }


  // University Student Features endpoints
  async getUniversityStudentFeatures(universityId: string): Promise<StudentFeaturesListResponse> {
    const response: AxiosResponse = await this.client.get(`/students/features`);
    return response.data;
  }

  async toggleUniversityStudentFeature(universityId: string, featureKey: string): Promise<{message: string, feature_key: string, enabled: boolean, feature_name: string}> {
    const response: AxiosResponse = await this.client.post(`/student-features/universities/${universityId}/student-features/${featureKey}/toggle`);
    return response.data;
  }

  // Admin Student Features endpoints
  async createStudentFeature(data: StudentFeatureCreate): Promise<StudentFeature> {
    const response: AxiosResponse = await this.client.post('/admins/student-features', data);
    return response.data;
  }

  async getAllStudentFeatures(): Promise<StudentFeature[]> {
    const response: AxiosResponse = await this.client.get('/admins/student-features');
    return response.data;
  }

  async updateStudentFeature(featureId: string, data: StudentFeatureUpdate): Promise<StudentFeature> {
    const response: AxiosResponse = await this.client.put(`/admins/student-features/${featureId}`, data);
    return response.data;
  }

  async deleteStudentFeature(featureId: string): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.delete(`/admins/student-features/${featureId}`);
    return response.data;
  }

  // University job management endpoints
  async getUniversityJobs(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/jobs');
    return response.data;
  }

  async approveUniversityJob(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/universities/jobs/${jobId}/approve`);
    return response.data;
  }

  async rejectUniversityJob(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/universities/jobs/${jobId}/reject`);
    return response.data;
  }

  // Corporate application management endpoints
  async getCorporateApplications(params: {
    status?: string;
    job_id?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const response: AxiosResponse = await this.client.get('/applications/corporate/applications', { params });
    return response.data;
  }

  async updateApplicationStatus(applicationId: string, statusData: {
    status: string;
    corporate_notes?: string;
    interview_date?: string;
    interview_location?: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/applications/${applicationId}/status`, statusData);
    return response.data;
  }

  async uploadOfferLetter(applicationId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await this.client.post(`/applications/${applicationId}/offer-letter`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
