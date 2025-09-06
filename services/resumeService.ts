import { apiClient } from '@/lib/api'

export interface ResumeContent {
    header: {
        fullName: string
        email: string
        phone: string
        location: string
        linkedin: string
        website: string
        profilePhoto?: string
    }
    summary: string
    experience: Array<{
        id: string
        company: string
        position: string
        location: string
        startDate: string
        endDate: string
        current: boolean
        description: string[]
    }>
    education: Array<{
        id: string
        institution: string
        degree: string
        field: string
        location: string
        startDate: string
        endDate: string
        current: boolean
        gpa: string
        achievements: string[]
    }>
    skills: {
        technical: string[]
        soft: string[]
        languages: string[]
    }
    projects: Array<{
        id: string
        name: string
        description: string
        technologies: string[]
        link: string
        github: string
    }>
    certifications: Array<{
        id: string
        name: string
        issuer: string
        date: string
        link: string
    }>
}

export interface ResumeData {
    id: string
    student_id: string
    template_id: string
    name: string
    content: ResumeContent
    settings: Record<string, any>
    status: 'draft' | 'published' | 'archived'
    created_at: string
    updated_at: string
    template?: {
        id: string
        name: string
        description?: string
        category: string
    }
}

export interface CreateResumeRequest {
    template_id: string
    name: string
    content: ResumeContent
    settings?: Record<string, any>
    status?: 'draft' | 'published' | 'archived'
}

export interface UpdateResumeRequest {
    template_id?: string
    name?: string
    content?: ResumeContent
    settings?: Record<string, any>
    status?: 'draft' | 'published' | 'archived'
}

export interface ResumeListResponse {
    resumes: ResumeData[]
    total: number
}

class ResumeService {
    // Create a new resume
    async createResume(data: CreateResumeRequest): Promise<ResumeData> {
        const response = await apiClient.client.post('/resume/resumes', data)
        return response.data
    }

    // Get all resumes for the current student
    async getResumes(): Promise<ResumeListResponse> {
        const response = await apiClient.client.get('/resume/resumes')
        return response.data
    }

    // Get a specific resume by ID
    async getResumeById(resumeId: string): Promise<ResumeData> {
        const response = await apiClient.client.get(`/resume/resumes/${resumeId}`)
        return response.data
    }

    // Update a resume
    async updateResume(resumeId: string, data: UpdateResumeRequest): Promise<ResumeData> {
        const response = await apiClient.client.put(`/resume/resumes/${resumeId}`, data)
        return response.data
    }

    // Delete a resume
    async deleteResume(resumeId: string): Promise<{ message: string }> {
        const response = await apiClient.client.delete(`/resume/resumes/${resumeId}`)
        return response.data
    }

    // Duplicate a resume
    async duplicateResume(resumeId: string, newName: string): Promise<ResumeData> {
        const response = await apiClient.client.post(`/resume/resumes/${resumeId}/duplicate`, {
            new_name: newName
        })
        return response.data
    }

    // Get resume templates
    async getTemplates(): Promise<{ templates: any[], total: number }> {
        const response = await apiClient.client.get('/resume/templates')
        return response.data
    }

    // Get a specific template by ID
    async getTemplateById(templateId: string): Promise<any> {
        const response = await apiClient.client.get(`/resume/templates/${templateId}`)
        return response.data
    }
}

export const resumeService = new ResumeService()
export default resumeService

