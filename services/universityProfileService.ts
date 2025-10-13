import { apiClient } from '@/lib/api'

export interface UniversityProfile {
    id: string
    email: string
    name: string
    phone?: string
    status: string
    email_verified: boolean
    phone_verified: boolean
    created_at: string
    updated_at?: string
    last_login?: string
    profile_picture?: string
    bio?: string
    university_name?: string
    website_url?: string
    institute_type?: string
    established_year?: number
    contact_person_name?: string
    contact_designation?: string
    address?: string
    courses_offered?: string
    branch?: string
    total_students?: number
    total_faculty?: number
    departments?: string
    programs_offered?: string
    placement_rate?: number
    average_package?: number
    top_recruiters?: string
    total_jobs_approved?: number
    total_jobs?: number
}

export interface UniversityProfileUpdateData {
    name?: string
    phone?: string
    bio?: string
    university_name?: string
    website_url?: string
    institute_type?: string
    established_year?: number
    contact_person_name?: string
    contact_designation?: string
    address?: string
    courses_offered?: string
    branch?: string
    total_students?: number
    total_faculty?: number
    departments?: string
    programs_offered?: string
    placement_rate?: number
    average_package?: number
    top_recruiters?: string
    profile_picture?: string
    total_jobs?: number
    total_jobs_approved?: number
}

export interface FileUploadResponse {
    success: boolean
    file_url: string
    message: string
}

export class UniversityProfileService {
    /**
     * Get university profile
     */
    async getProfile(): Promise<UniversityProfile> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.client.get('/universities/profile')
            return response.data
        } catch (error: any) {
            console.error('Error fetching university profile:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 404) {
                throw new Error('Profile not found.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to fetch profile.')
            }
        }
    }

    /**
     * Update university profile
     */
    async updateProfile(data: UniversityProfileUpdateData): Promise<UniversityProfile> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.client.put('/universities/profile', data)
            return response.data
        } catch (error: any) {
            console.error('Error updating university profile:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 422) {
                throw new Error('Invalid data provided. Please check your input.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to update profile.')
            }
        }
    }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(file: File): Promise<FileUploadResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const formData = new FormData()
            formData.append('file', file)

            const response = await apiClient.client.post('/universities/upload-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            return response.data
        } catch (error: any) {
            console.error('Error uploading profile picture:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 413) {
                throw new Error('File too large. Please choose a smaller image.')
            } else if (error.response?.status === 415) {
                throw new Error('Invalid file type. Please upload a valid image.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to upload profile picture.')
            }
        }
    }
}

export const universityProfileService = new UniversityProfileService()


