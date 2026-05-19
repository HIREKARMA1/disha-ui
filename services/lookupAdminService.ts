import { apiClient } from '@/lib/api'
import type {
    BulkUploadApiResponse,
    CollegeListApiResponse,
    CollegeLookupRow,
    SkillLookupKind,
    SoftSkillListApiResponse,
    SoftSkillLookupRow,
    TechnicalSkillListApiResponse,
    TechnicalSkillLookupRow,
} from '@/types/lookup'

function ensureAuth() {
    if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in.')
    }
}

// —— Colleges ——

export async function listColleges(params: {
    skip?: number
    limit?: number
    search?: string
}): Promise<CollegeListApiResponse> {
    ensureAuth()
    return apiClient.get('/admin/lookups/colleges', { params })
}

export async function getCollege(id: string): Promise<CollegeLookupRow> {
    ensureAuth()
    return apiClient.get(`/admin/lookups/colleges/${id}`)
}

export async function createCollege(data: {
    name: string
    university_id?: string | null
}): Promise<CollegeLookupRow> {
    ensureAuth()
    return apiClient.post('/admin/lookups/colleges', data)
}

export async function updateCollege(
    id: string,
    data: { name?: string; university_id?: string | null }
): Promise<CollegeLookupRow> {
    ensureAuth()
    return apiClient.put(`/admin/lookups/colleges/${id}`, data)
}

export async function deleteCollege(id: string): Promise<void> {
    ensureAuth()
    await apiClient.client.delete(`/admin/lookups/colleges/${id}`)
}

// —— Technical skills ——

export async function listTechnicalSkills(params: {
    skip?: number
    limit?: number
    search?: string
}): Promise<TechnicalSkillListApiResponse> {
    ensureAuth()
    return apiClient.get('/admin/lookups/skills', { params })
}

export async function createTechnicalSkill(data: {
    name: string
    category?: string | null
    description?: string | null
}): Promise<TechnicalSkillLookupRow> {
    ensureAuth()
    return apiClient.post('/admin/lookups/skills', data)
}

export async function updateTechnicalSkill(
    id: string,
    data: { name?: string; category?: string | null; description?: string | null }
): Promise<TechnicalSkillLookupRow> {
    ensureAuth()
    return apiClient.put(`/admin/lookups/skills/${id}`, data)
}

export async function deleteTechnicalSkill(id: string): Promise<void> {
    ensureAuth()
    await apiClient.client.delete(`/admin/lookups/skills/${id}`)
}

// —— Soft skills ——

export async function listSoftSkills(params: {
    skip?: number
    limit?: number
    search?: string
}): Promise<SoftSkillListApiResponse> {
    ensureAuth()
    return apiClient.get('/admin/lookups/soft-skills', { params })
}

export async function createSoftSkill(data: { name: string }): Promise<SoftSkillLookupRow> {
    ensureAuth()
    return apiClient.post('/admin/lookups/soft-skills', data)
}

export async function updateSoftSkill(id: string, data: { name?: string }): Promise<SoftSkillLookupRow> {
    ensureAuth()
    return apiClient.put(`/admin/lookups/soft-skills/${id}`, data)
}

export async function deleteSoftSkill(id: string): Promise<void> {
    ensureAuth()
    await apiClient.client.delete(`/admin/lookups/soft-skills/${id}`)
}

// —— CSV bulk upload ——

export async function uploadSkillsCsv(
    kind: SkillLookupKind,
    file: File
): Promise<BulkUploadApiResponse> {
    ensureAuth()
    const tableType = kind === 'technical' ? 'skills' : 'soft_skills'
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.client.post<BulkUploadApiResponse>(
        `/admin/lookups/upload-file?table_type=${encodeURIComponent(tableType)}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
}
