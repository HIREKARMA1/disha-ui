import { apiClient } from '@/lib/api'
import { universityManagementService } from '@/services/universityManagementService'
import {
    UniversityListResponse,
    UniversityListItem
} from '@/types/university'
import {
    StudentListResponse,
    StudentListItem,
    CreateStudentRequest,
    CreateStudentResponse,
    BulkUploadResponse,
    StudentTemplateResponse
} from '@/types/university'

export interface AdminStudentListResponse {
    students: StudentListItem[]
    total_students: number
    active_students: number
    archived_students: number
}

/**
 * Service for admin to manage students across any university.
 * Uses admin endpoints for create, upload, archive, delete; reuses university service for list.
 */
export class StudentManagementService {
    /** Get all universities (for selector). */
    async getUniversities(includeArchived: boolean = false): Promise<UniversityListResponse> {
        return universityManagementService.getUniversities(includeArchived)
    }

    /**
     * Get students (admin). By default returns all students.
     * Pass universityId to filter by a specific university.
     */
    async getAllStudents(universityId?: string, includeArchived: boolean = false): Promise<AdminStudentListResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const params: { include_archived: boolean; university_id?: string } = { include_archived: includeArchived }
            if (universityId) params.university_id = universityId
            const response = await apiClient.client.get('/admins/students', { params })
            return response.data
        } catch (error: any) {
            console.error('Error fetching students (admin):', error)
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to fetch students.')
        }
    }

    /** Get students for a specific university (admin). */
    async getUniversityStudents(universityId: string, includeArchived: boolean = false): Promise<AdminStudentListResponse> {
        return this.getAllStudents(universityId, includeArchived)
    }

    /** Create a student for a university (admin). */
    async createStudent(universityId: string, data: CreateStudentRequest): Promise<CreateStudentResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const response = await apiClient.client.post(`/admins/universities/${universityId}/students`, data)
            return response.data
        } catch (error: any) {
            console.error('Error creating student (admin):', error)
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            }
            if (error.response?.status === 404) {
                throw new Error('University not found.')
            }
            if (error.response?.status === 409) {
                throw new Error(error.response?.data?.detail || 'Student with this email already exists.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to create student.')
        }
    }

    /** Bulk upload CSV for a university (admin). */
    async uploadStudentsCSV(universityId: string, file: File): Promise<BulkUploadResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const formData = new FormData()
            formData.append('file', file)
            const response = await apiClient.client.post(
                `/admins/universities/${universityId}/students/upload-csv`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return response.data
        } catch (error: any) {
            console.error('Error uploading CSV (admin):', error)
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            }
            if (error.response?.status === 404) {
                throw new Error('University not found.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to upload CSV.')
        }
    }

    /** Get student upload template (admin). */
    async getStudentTemplate(universityId: string): Promise<StudentTemplateResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const response = await apiClient.client.get(`/admins/universities/${universityId}/students/template`)
            return response.data
        } catch (error: any) {
            console.error('Error fetching template (admin):', error)
            throw new Error(error.response?.data?.detail || 'Failed to get template.')
        }
    }

    /** Archive or unarchive a student (admin, any university). */
    async archiveStudent(studentId: string, archive: boolean): Promise<{ message: string }> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const response = await apiClient.client.patch(`/admins/students/${studentId}/archive`, { archive })
            return response.data
        } catch (error: any) {
            console.error('Error archiving student (admin):', error)
            if (error.response?.status === 404) {
                throw new Error('Student not found.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to archive student.')
        }
    }

    /** Permanently delete a student (admin, any university). */
    async deleteStudent(studentId: string): Promise<{ message: string }> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const response = await apiClient.client.delete(`/admins/students/${studentId}`)
            return response.data
        } catch (error: any) {
            console.error('Error deleting student (admin):', error)
            if (error.response?.status === 404) {
                throw new Error('Student not found.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to delete student.')
        }
    }

    /** Get full student profile by ID (admin). */
    async getStudentProfile(studentId: string): Promise<any> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const response = await apiClient.client.get(`/admins/students/${studentId}/profile`)
            return response.data
        } catch (error: any) {
            console.error('Error fetching student profile (admin):', error)
            if (error.response?.status === 404) {
                throw new Error('Student not found.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to fetch student profile.')
        }
    }

    /** Update student profile (admin). Partial updates supported. */
    async updateStudent(studentId: string, data: Record<string, unknown>): Promise<any> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }
            const response = await apiClient.client.put(`/admins/students/${studentId}`, data)
            return response.data
        } catch (error: any) {
            console.error('Error updating student (admin):', error)
            if (error.response?.status === 404) {
                throw new Error('Student not found.')
            }
            throw new Error(error.response?.data?.detail || 'Failed to update student.')
        }
    }
}

export const studentManagementService = new StudentManagementService()
