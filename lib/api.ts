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
        console.log('🔐 API Client: Auth token:', token ? 'Present' : 'Missing');
        console.log('🔐 API Client: Token value:', token);
        console.log('🔐 API Client: Request URL:', config.url);
        console.log('🔐 API Client: Request method:', config.method);
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
    // Practice Module API methods
    async getPracticeModules(role?: string): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/modules', {
        params: { role }
      });
      return response.data;
    }
  
    async getPracticeModuleWithQuestions(moduleId: string): Promise<any> {
      const response: AxiosResponse = await this.client.get(`/practice/modules/${moduleId}`);
      return response.data;
    }
  
    async submitPracticeAttempt(payload: any): Promise<any> {
      const response: AxiosResponse = await this.client.post('/practice/submit', payload);
      return response.data;
    }
  
    async getPracticeStats(): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/stats');
      return response.data;
    }
  
    async getPracticeAttempts(params?: Record<string, any>): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/attempts', { params });
      return response.data;
    }
  
    // Admin Practice Module API methods
    async adminGetPracticeModules(role?: string, archived: boolean = false): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/admin/modules', {
        params: { role, archived }
      });
      return response.data;
    }
  
    async adminCreatePracticeModule(data: any): Promise<any> {
      const response: AxiosResponse = await this.client.post('/practice/admin/modules', data);
      return response.data;
    }
  
    async adminUpdatePracticeModule(moduleId: string, data: any): Promise<any> {
      const response: AxiosResponse = await this.client.put(`/practice/admin/modules/${moduleId}`, data);
      return response.data;
    }
  
    async adminDeletePracticeModule(moduleId: string): Promise<any> {
      const response: AxiosResponse = await this.client.delete(`/practice/admin/modules/${moduleId}`);
      return response.data;
    }
  
    async adminArchivePracticeModule(moduleId: string, archive: boolean = true): Promise<any> {
      const response: AxiosResponse = await this.client.post(`/practice/admin/modules/${moduleId}/archive`, {
        archive: archive
      });
      return response.data;
    }
  
    async adminGetQuestions(role?: string, difficulty?: string): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/admin/questions', {
        params: { role, difficulty }
      });
      return response.data;
    }
  
    async adminCreateQuestion(data: any): Promise<any> {
      const response: AxiosResponse = await this.client.post('/practice/admin/questions', data);
      return response.data;
    }
  
    async adminUpdateQuestion(questionId: string, data: any): Promise<any> {
      const response: AxiosResponse = await this.client.put(`/practice/admin/questions/${questionId}`, data);
      return response.data;
    }
  
    async adminDeleteQuestion(questionId: string): Promise<any> {
      const response: AxiosResponse = await this.client.delete(`/practice/admin/questions/${questionId}`);
      return response.data;
    }
  
    async adminBulkUploadQuestions(formData: FormData): Promise<any> {
      const response: AxiosResponse = await this.client.post('/practice/admin/questions/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  
    async adminGetAttempts(params?: Record<string, any>): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/admin/attempts', { params });
      return response.data;
    }
  
    async adminGetAttemptDetails(attemptId: string): Promise<any> {
      const response: AxiosResponse = await this.client.get(`/practice/admin/attempts/${attemptId}`);
      return response.data;
    }

    async adminGetPracticeStats(): Promise<any> {
      const response: AxiosResponse = await this.client.get('/practice/admin/stats');
      return response.data;
    }
  
    async adminExportAttempts(moduleId?: string): Promise<Blob> {
      const response: AxiosResponse = await this.client.get('/practice/admin/attempts/export', {
        params: { moduleId },
        responseType: 'blob'
      });
      return response.data;
    }
  
    // Exam session management
    async saveExamProgress(sessionData: any): Promise<any> {
      const response: AxiosResponse = await this.client.post('/practice/session/save', sessionData);
      return response.data;
    }
  
    async updateExamTime(moduleId: string, timeRemaining: number): Promise<any> {
      const response: AxiosResponse = await this.client.post('/practice/session/time', {
        moduleId,
        timeRemaining
      });
      return response.data;
    }
}

export const apiClient = new ApiClient();
export default apiClient;
