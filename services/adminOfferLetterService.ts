import { apiClient } from '@/lib/api'
import type {
  AdminOfferLetter,
  AdminOfferLetterBulkImportResponse,
  AdminOfferLetterListResponse,
  CreateAdminOfferLetterInput,
  PassoutYearsResponse,
} from '@/types/adminOfferLetter'

function ensureAuth() {
  if (!apiClient.isAuthenticated()) {
    throw new Error('User not authenticated. Please log in.')
  }
}

export class AdminOfferLetterService {
  async list(params: {
    search?: string
    college_id?: string
    passout_year?: number
    skip?: number
    limit?: number
  } = {}): Promise<AdminOfferLetterListResponse> {
    ensureAuth()
    const response = await apiClient.client.get('/admin/offer-letters', { params })
    return response.data
  }

  async listPassoutYears(): Promise<PassoutYearsResponse> {
    ensureAuth()
    const response = await apiClient.client.get('/admin/offer-letters/passout-years')
    return response.data
  }

  async create(input: CreateAdminOfferLetterInput): Promise<AdminOfferLetter> {
    ensureAuth()
    const formData = new FormData()
    formData.append('student_name', input.student_name)
    formData.append('company_name', input.company_name)
    formData.append('college_id', input.college_id)
    formData.append('passout_year', String(input.passout_year))
    formData.append('file', input.file)
    if (input.designation?.trim()) {
      formData.append('designation', input.designation.trim())
    }
    if (input.salary_ctc?.trim()) {
      formData.append('salary_ctc', input.salary_ctc.trim())
    }
    if (input.salary_in_hand?.trim()) {
      formData.append('salary_in_hand', input.salary_in_hand.trim())
    }

    const response = await apiClient.client.post('/admin/offer-letters', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async downloadTemplate(): Promise<Blob> {
    ensureAuth()
    const response = await apiClient.client.get('/admin/offer-letters/template', {
      responseType: 'blob',
    })
    return response.data
  }

  async bulkImport(file: File): Promise<AdminOfferLetterBulkImportResponse> {
    ensureAuth()
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post('/admin/offer-letters/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    })
    return response.data
  }

  async listForUniversity(params: {
    search?: string
    passout_year?: number
    skip?: number
    limit?: number
  } = {}): Promise<AdminOfferLetterListResponse> {
    ensureAuth()
    const response = await apiClient.client.get('/universities/me/offer-letters', { params })
    return response.data
  }

  async listPassoutYearsForUniversity(): Promise<PassoutYearsResponse> {
    ensureAuth()
    const response = await apiClient.client.get('/universities/me/offer-letters/passout-years')
    return response.data
  }
}

export const adminOfferLetterService = new AdminOfferLetterService()
