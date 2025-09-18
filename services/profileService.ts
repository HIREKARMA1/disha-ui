import { apiClient } from '@/lib/api'

export interface StudentProfile {
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
    institution?: string
    degree?: string
    branch?: string
    graduation_year?: number
    major?: string
    dob?: string
    gender?: string
    country?: string
    state?: string
    city?: string
    tenth_grade_percentage?: number
    twelfth_grade_percentage?: number
    btech_cgpa?: number
    total_percentage?: number
    technical_skills?: string
    soft_skills?: string
    certifications?: string
    preferred_industry?: string
    job_roles_of_interest?: string
    location_preferences?: string
    language_proficiency?: string
    extracurricular_activities?: string
    internship_experience?: string
    project_details?: string
    linkedin_profile?: string
    github_profile?: string
    personal_website?: string
    resume?: string
    tenth_certificate?: string
    twelfth_certificate?: string
    internship_certificates?: string
    profile_completion_percentage: number
    university_id?: string
    college_id?: string
    // New academic fields
    twelfth_institution?: string
    twelfth_stream?: string
    twelfth_year?: string
    tenth_institution?: string
    tenth_stream?: string
    tenth_year?: string
}

export interface ProfileUpdateData {
    name?: string
    phone?: string
    bio?: string
    institution?: string
    degree?: string
    branch?: string
    graduation_year?: number
    major?: string
    dob?: string
    gender?: string
    country?: string
    state?: string
    city?: string
    tenth_grade_percentage?: number
    twelfth_grade_percentage?: number
    btech_cgpa?: number
    total_percentage?: number
    technical_skills?: string
    soft_skills?: string
    certifications?: string
    preferred_industry?: string
    job_roles_of_interest?: string
    location_preferences?: string
    language_proficiency?: string
    extracurricular_activities?: string
    internship_experience?: string
    project_details?: string
    linkedin_profile?: string
    github_profile?: string
    personal_website?: string
    // New academic fields
    twelfth_institution?: string
    twelfth_stream?: string
    twelfth_year?: string
    tenth_institution?: string
    tenth_stream?: string
    tenth_year?: string
}

export interface ProfileCompletionResponse {
    completion_percentage: number
    completed_fields: string[]
    missing_fields: string[]
    total_fields: number
    completed_count: number
}

export interface FileUploadResponse {
    success: boolean
    file_url: string
    message: string
}

export class ProfileService {
    /**
     * Get student profile
     */
    async getProfile(): Promise<StudentProfile> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.client.get('/students/profile')
            return response.data
        } catch (error: any) {
            console.error('Error fetching profile:', error)
            
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
     * Update student profile
     */
    async updateProfile(data: ProfileUpdateData): Promise<StudentProfile> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.client.put('/students/profile', data)
            return response.data
        } catch (error: any) {
            console.error('Error updating profile:', error)
            
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
            formData.append('profile_picture', file)

            const response = await apiClient.client.post('/students/upload-profile-picture', formData, {
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

    /**
     * Upload resume
     */
    async uploadResume(file: File): Promise<FileUploadResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const formData = new FormData()
            formData.append('resume', file)

            const response = await apiClient.client.post('/students/upload-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            return response.data
        } catch (error: any) {
            console.error('Error uploading resume:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 413) {
                throw new Error('File too large. Please choose a smaller file.')
            } else if (error.response?.status === 415) {
                throw new Error('Invalid file type. Please upload a valid document.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to upload resume.')
            }
        }
    }

    /**
     * Upload certificate
     */
    async uploadCertificate(file: File, certificateType: string): Promise<FileUploadResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const formData = new FormData()
            formData.append('certificate', file)
            formData.append('type', certificateType)

            const response = await apiClient.client.post('/students/upload-certificate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            return response.data
        } catch (error: any) {
            console.error('Error uploading certificate:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 413) {
                throw new Error('File too large. Please choose a smaller file.')
            } else if (error.response?.status === 415) {
                throw new Error('Invalid file type. Please upload a valid document.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to upload certificate.')
            }
        }
    }

    /**
     * Get profile completion percentage with detailed information
     */
    async getProfileCompletion(): Promise<ProfileCompletionResponse> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.client.get('/students/profile-completion')
            return response.data
        } catch (error: any) {
            console.error('Error fetching profile completion:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to fetch profile completion.')
            }
        }
    }

    /**
     * Delete uploaded file
     */
    async deleteFile(fileType: string): Promise<{ success: boolean; message: string }> {
        try {
            if (!apiClient.isAuthenticated()) {
                throw new Error('User not authenticated. Please log in.')
            }

            const response = await apiClient.client.delete(`/students/files/${fileType}`)
            return response.data
        } catch (error: any) {
            console.error('Error deleting file:', error)
            
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.')
            } else if (error.response?.status === 404) {
                throw new Error('File not found.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error(error.response?.data?.detail || 'Failed to delete file.')
            }
        }
    }
}

export const profileService = new ProfileService()
