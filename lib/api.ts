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

class ApiClient {
  public client: AxiosInstance;

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
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
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

  // Email OTP for signup
  async sendEmailOtp(email: string): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/send-email-otp', { email });
    return response.data;
  }

  async verifyEmailOtp(payload: { email: string; code: string }): Promise<{ message: string }> {
    const response: AxiosResponse = await this.client.post('/auth/verify-email-otp', payload);
    return response.data;
  }

  // OTP verification during registration
  async verifyOtpAndRegisterStudent(code: string, data: StudentRegisterRequest): Promise<{ message: string; student_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post(`/auth/register/student/verify-otp?code=${code}`, data);
    return response.data;
  }

  async verifyOtpAndRegisterCorporate(code: string, data: CorporateRegisterRequest): Promise<{ message: string; corporate_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post(`/auth/register/corporate/verify-otp?code=${code}`, data);
    return response.data;
  }

  async verifyOtpAndRegisterUniversity(code: string, data: UniversityRegisterRequest): Promise<{ message: string; university_id: string; email: string }> {
    const response: AxiosResponse = await this.client.post(`/auth/register/university/verify-otp?code=${code}`, data);
    return response.data;
  }

  // Admin registration removed for security - admin accounts must be created manually
  // async registerAdmin(data: AdminRegisterRequest): Promise<{ message: string; user_id: string; email: string }> {
  //   const response: AxiosResponse = await this.client.post('/auth/register/admin', data);
  //   return response.data;
  // }

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

  async getUniversityApplications(params: {
    status?: string;
    search?: string;
    company_name?: string;
    job_id?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/applications', { params });
    return response.data;
  }

  async exportUniversityApplications(params: {
    status?: string;
    search?: string;
    company_name?: string;
    job_id?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.client.get('/universities/applications/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async updateUniversityApplicationStatus(
    applicationId: string,
    status: string,
    notes?: string,
    interviewDate?: string,
    interviewLocation?: string
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('status', status);
    if (notes) params.append('notes', notes);
    if (interviewDate) params.append('interview_date', interviewDate);
    if (interviewLocation) params.append('interview_location', interviewLocation);

    const response: AxiosResponse = await this.client.put(
      `/universities/applications/${applicationId}/status?${params.toString()}`
    );
    return response.data;
  }

  async getAvailableJobs(page: number = 1, limit: number = 20): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/jobs/?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getJobById(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/jobs/${jobId}`);
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
    return response.data.universities || [];
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

  async toggleJobPublicStatus(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/jobs/admin/${jobId}/toggle-public`);
    return response.data;
  }

  async getPublicJob(publicLinkToken: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/jobs/public/${publicLinkToken}`);
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

  // Corporate endpoints
  async getCorporateDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/corporates/dashboard');
    return response.data;
  }

  // Authenticated corporate profile of current user
  async getCorporateProfile(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/corporates/profile');
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

  // University job management endpoints
  async getUniversityJobs(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/universities/jobs');
    return response.data;
  }

  async getJobAssignmentAttempts(jobId: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get(`/practice/job/${jobId}/attempts`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch job assignment attempts:', error);
      throw error;
    }
  }

  async approveUniversityJob(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/universities/jobs/${jobId}/approve`);
    return response.data;
  }

  async rejectUniversityJob(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/universities/jobs/${jobId}/reject`);
    return response.data;
  }

  async createUniversityJob(jobData: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/jobs/university/create', jobData);
    return response.data;
  }

  async updateJobUniversity(jobId: string, jobData: any): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/jobs/university/${jobId}`, jobData);
    return response.data;
  }

  async deleteJobUniversity(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/jobs/university/${jobId}`);
    return response.data;
  }

  async getAppliedStudentsUniversity(jobId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/universities/jobs/${jobId}/applied-students`);
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

  // Public corporate profile endpoint (by id)
  async getCorporateProfileById(corporateId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/corporates/${corporateId}`);
    return response.data;
  }

  async getPublicCorporateProfile(corporateId: string): Promise<any> {
    // Validate corporateId before making the request
    if (!corporateId ||
      corporateId === 'None' ||
      corporateId === 'null' ||
      corporateId === 'undefined' ||
      (typeof corporateId === 'string' && corporateId.trim() === '')) {
      throw new Error('Invalid corporate ID provided');
    }
    const response: AxiosResponse = await this.client.get(`/corporates/public/${corporateId}`);
    return response.data;
  }

  // Practice Modules by Job ID
  async getPracticeModulesByJobId(jobId: string): Promise<any[]> {
    const response: AxiosResponse = await this.client.get(`/practice/modules/by-job/${jobId}`);
    return response.data;
  }

  // Coding Practice endpoints
  async executeCodingCode(codeData: {
    code: string;
    language: string;
    input?: string;
    question_id?: string;
  }): Promise<{
    stdout: string;
    stderr: string;
    runtime: number;
    memory: number;
    status: string;
  }> {
    const response: AxiosResponse = await this.client.post('/practice/coding/execute', codeData);
    return response.data;
  }

  // Test Case Management endpoints
  async createTestCase(questionId: string, testCaseData: {
    input_data: string;
    expected_output: string;
    is_hidden: boolean;
    points: number;
    order: number;
  }): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/practice/questions/${questionId}/test-cases`, testCaseData);
    return response.data;
  }

  async getTestCases(questionId: string): Promise<any[]> {
    const response: AxiosResponse = await this.client.get(`/practice/questions/${questionId}/test-cases`);
    return response.data;
  }

  async updateTestCase(testCaseId: string, testCaseData: {
    input_data: string;
    expected_output: string;
    is_hidden: boolean;
    points: number;
    order: number;
  }): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/practice/test-cases/${testCaseId}`, testCaseData);
    return response.data;
  }

  async deleteTestCase(testCaseId: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/practice/test-cases/${testCaseId}`);
    return response.data;
  }

  // Image upload endpoint for company logos
  async uploadImage(file: File): Promise<{ file_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse = await this.client.post('/universities/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Upload company logo for university-created jobs (uses corporate folder structure)
  async uploadCompanyLogo(file: File): Promise<{ file_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse = await this.client.post('/universities/upload-company-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // The endpoint returns {file_url, message}, but we only need file_url for consistency
    return { file_url: response.data.file_url };
  }
  // Generic HTTP methods to support direct usage
  async get(url: string, config?: any): Promise<any> {
    const response: AxiosResponse = await this.client.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    const response: AxiosResponse = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    const response: AxiosResponse = await this.client.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: any): Promise<any> {
    const response: AxiosResponse = await this.client.delete(url, config);
    return response.data;
  }

  // Assessment Management (DISHA-SOLVIQ)
  async getAdminAssessments(params: {
    skip?: number;
    limit?: number;
    status?: string;
    mode?: string;
    university_id?: string;
  } = {}): Promise<any> {
    const response: AxiosResponse = await this.client.get('/admin/assessments/list', { params });
    return response.data;
  }

  async createAssessment(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/admin/assessments/create', data);
    return response.data;
  }

  async updateAssessment(id: string, data: any): Promise<any> {
    const response: AxiosResponse = await this.client.patch(`/admin/assessments/${id}`, data);
    return response.data;
  }

  async getAssessment(id: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/admin/assessments/${id}`);
    return response.data;
  }

  async publishAssessmentToSolviq(id: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/admin/assessments/${id}/publish`);
    return response.data;
  }

  async getAssessmentStats(id: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/admin/assessments/${id}/stats`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
