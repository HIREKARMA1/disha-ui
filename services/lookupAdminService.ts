import { apiClient } from '@/lib/api'
import type { CollegeListApiResponse, CollegeLookupRow } from '@/types/lookup'

export async function listColleges(params: {
    skip?: number
    limit?: number
    search?: string
}): Promise<CollegeListApiResponse> {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
    }
    return apiClient.get('/admin/lookups/colleges', { params })
}

export async function getCollege(id: string): Promise<CollegeLookupRow> {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
    }
    return apiClient.get(`/admin/lookups/colleges/${id}`)
}

export async function createCollege(data: {
    name: string
    university_id?: string | null
}): Promise<CollegeLookupRow> {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
    }
    return apiClient.post('/admin/lookups/colleges', data)
}

export async function updateCollege(
    id: string,
    data: { name?: string; university_id?: string | null }
): Promise<CollegeLookupRow> {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
    }
    return apiClient.put(`/admin/lookups/colleges/${id}`, data)
}

export async function deleteCollege(id: string): Promise<void> {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
    }
    await apiClient.client.delete(`/admin/lookups/colleges/${id}`)
}
