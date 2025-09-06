import { config } from '@/lib/config'

export interface FileUploadResponse {
    certificate_url?: string
    resume_url?: string
    profile_picture_url?: string
    message: string
}

export class FileUploadService {
    private static async uploadFile(endpoint: string, file: File, token: string): Promise<FileUploadResponse> {
        const formData = new FormData()
        formData.append('file', file)

        try {
            // Ensure we have a valid API URL
            if (!config.api.fullUrl) {
                console.error('API configuration not found. Config:', config)
                throw new Error('API configuration not found. Please check your environment variables.')
            }

            const response = await fetch(`${config.api.fullUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || `Upload failed with status ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('File upload error:', error)
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Upload failed')
        }
    }

    static async uploadResume(file: File, token: string): Promise<FileUploadResponse> {
        return this.uploadFile('/students/upload-resume', file, token)
    }

    static async uploadTenthCertificate(file: File, token: string): Promise<FileUploadResponse> {
        return this.uploadFile('/students/upload-tenth-certificate', file, token)
    }

    static async uploadTwelfthCertificate(file: File, token: string): Promise<FileUploadResponse> {
        return this.uploadFile('/students/upload-twelfth-certificate', file, token)
    }

    static async uploadInternshipCertificates(file: File, token: string): Promise<FileUploadResponse> {
        return this.uploadFile('/students/upload-internship-certificates', file, token)
    }

    static async uploadProfilePicture(file: File, token: string): Promise<FileUploadResponse> {
        return this.uploadFile('/students/upload-profile-picture', file, token)
    }
}
