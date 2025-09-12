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

  // Dashboard and data endpoints
  async getStudentDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/dashboard');
    return response.data;
  }

  async getStudentAppliedJobs(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/applied-jobs');
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

  // Video search endpoint
  async searchVideos(query: string, skip: number = 0, limit: number = 12): Promise<any> {
    const response: AxiosResponse = await this.client.get('/video-search/', {
      params: { query, skip, limit }
    });
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

  async getLibraryCategories(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/library/categories/');
    return response.data;
  }

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

  // Student feature endpoints (legacy - use getStudentFeaturesWithAccess instead)
  async getStudentFeaturesLegacy(): Promise<UniversityFeatureFlag[]> {
    const response: AxiosResponse = await this.client.get('/students/features');
    return response.data;
  }

  async checkStudentFeatureAccess(accessData: FeatureAccessRequest): Promise<FeatureAccessResponse> {
    const response: AxiosResponse = await this.client.post('/students/features/check-access', accessData);
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
    const response: AxiosResponse = await this.client.post(`/admins/feature-flags/university/${universityId}/features?feature_key=${featureKey}&status=${status}`, featureData);
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
  async getStudentFeatures(): Promise<StudentFeaturesListResponse> {
    const response: AxiosResponse = await this.client.get('/student/features');
    return response.data;
  }

  // University Student Features endpoints
  async getUniversityStudentFeatures(universityId: string): Promise<StudentFeaturesListResponse> {
    const response: AxiosResponse = await this.client.get(`/student-features/universities/${universityId}/student-features`);
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
}

export const apiClient = new ApiClient();
export default apiClient;
