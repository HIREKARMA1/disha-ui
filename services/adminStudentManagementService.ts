import { apiClient } from '@/lib/api'
import {
  AdminStudentListResponse,
  AdminStudentListItem,
  CreateAdminStudentRequest,
  CreateAdminStudentResponse,
  UpdateAdminStudentRequest,
  AdminStudentImportResponse,
  ResetPasswordResponse,
} from '@/types/adminStudent'

export class AdminStudentManagementService {
  async getStudents(includeArchived: boolean = false): Promise<AdminStudentListResponse> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.get('/admins/students', {
      params: { include_archived: includeArchived },
    })
    return response.data
  }

  async getStudent(studentId: string): Promise<AdminStudentListItem> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.get(`/admins/students/${studentId}`)
    return response.data
  }

  async createStudent(data: CreateAdminStudentRequest): Promise<CreateAdminStudentResponse> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.post('/admins/students', data)
    return response.data
  }

  async updateStudent(studentId: string, data: UpdateAdminStudentRequest): Promise<AdminStudentListItem> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.put(`/admins/students/${studentId}`, data)
    return response.data
  }

  async deleteStudent(studentId: string): Promise<{ message: string }> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.delete(`/admins/students/${studentId}`)
    return response.data
  }

  async exportStudents(params: {
    includeArchived?: boolean
    format?: 'csv' | 'xlsx'
    status?: string
    registration?: string
    search?: string
  } = {}): Promise<Blob> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.get('/admins/students/export', {
      params: {
        include_archived: params.includeArchived ?? false,
        format: params.format ?? 'csv',
        status: params.status,
        registration: params.registration,
        search: params.search,
      },
      responseType: 'blob',
    })
    return response.data
  }

  async downloadTemplate(): Promise<Blob> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.get('/admins/students/template', {
      responseType: 'blob',
    })
    return response.data
  }

  async importStudents(file: File): Promise<AdminStudentImportResponse> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post('/admins/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async resetPassword(studentId: string, sendEmail: boolean = false): Promise<ResetPasswordResponse> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.post(
      `/admins/students/${studentId}/reset-password`,
      null,
      { params: { send_email: sendEmail } }
    )
    return response.data
  }

  async sendWelcomeEmail(studentId: string): Promise<{ message: string }> {
    if (!apiClient.isAuthenticated()) {
      throw new Error('User not authenticated. Please log in.')
    }
    const response = await apiClient.client.post(`/admins/students/${studentId}/send-welcome-email`)
    return response.data
  }
}

export const adminStudentManagementService = new AdminStudentManagementService()
