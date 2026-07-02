import { apiClient } from '@/lib/api'
import type {
    BulkUploadApiResponse,
    CollegeListApiResponse,
    CollegeLookupRow,
    NameLookupKind,
    NameLookupListApiResponse,
    NameLookupRow,
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

// —— Generic name-only lookups ——

type ListParams = { skip?: number; limit?: number; search?: string }

async function listNameLookup(
    endpoint: string,
    responseKey: string,
    params: ListParams
): Promise<NameLookupListApiResponse> {
    ensureAuth()
    const res = (await apiClient.get(endpoint, { params })) as Record<string, unknown>
    const rows = (res[responseKey] as NameLookupRow[] | undefined) ?? []
    return {
        items: rows,
        total: (res.total as number) ?? rows.length,
        skip: (res.skip as number) ?? params.skip ?? 0,
        limit: (res.limit as number) ?? params.limit ?? rows.length,
    }
}

export function listIndustries(params: ListParams) {
    return listNameLookup('/admin/lookups/industries', 'industries', params)
}

export function listEducationBranches(params: ListParams) {
    return listNameLookup('/admin/lookups/branches', 'branches', params)
}

export function listInstituteTypes(params: ListParams) {
    return listNameLookup('/admin/lookups/institute-types', 'institute_types', params)
}

export async function createIndustry(data: { name: string }): Promise<NameLookupRow> {
    ensureAuth()
    return apiClient.post('/admin/lookups/industries', data)
}

export async function updateIndustry(id: string, data: { name?: string }): Promise<NameLookupRow> {
    ensureAuth()
    return apiClient.put(`/admin/lookups/industries/${id}`, data)
}

export async function deleteIndustry(id: string): Promise<void> {
    ensureAuth()
    await apiClient.client.delete(`/admin/lookups/industries/${id}`)
}

export async function createEducationBranch(data: { name: string }): Promise<NameLookupRow> {
    ensureAuth()
    return apiClient.post('/admin/lookups/branches', data)
}

export async function updateEducationBranch(id: string, data: { name?: string }): Promise<NameLookupRow> {
    ensureAuth()
    return apiClient.put(`/admin/lookups/branches/${id}`, data)
}

export async function deleteEducationBranch(id: string): Promise<void> {
    ensureAuth()
    await apiClient.client.delete(`/admin/lookups/branches/${id}`)
}

export async function createInstituteType(data: { name: string }): Promise<NameLookupRow> {
    ensureAuth()
    return apiClient.post('/admin/lookups/institute-types', data)
}

export async function updateInstituteType(id: string, data: { name?: string }): Promise<NameLookupRow> {
    ensureAuth()
    return apiClient.put(`/admin/lookups/institute-types/${id}`, data)
}

export async function deleteInstituteType(id: string): Promise<void> {
    ensureAuth()
    await apiClient.client.delete(`/admin/lookups/institute-types/${id}`)
}

const NAME_LOOKUP_API: Record<
    NameLookupKind,
    {
        list: (params: ListParams) => Promise<NameLookupListApiResponse>
        create: (data: { name: string }) => Promise<NameLookupRow>
        update: (id: string, data: { name?: string }) => Promise<NameLookupRow>
        delete: (id: string) => Promise<void>
    }
> = {
    industry: {
        list: listIndustries,
        create: createIndustry,
        update: updateIndustry,
        delete: deleteIndustry,
    },
    'education-branches': {
        list: listEducationBranches,
        create: createEducationBranch,
        update: updateEducationBranch,
        delete: deleteEducationBranch,
    },
    'institute-type': {
        list: listInstituteTypes,
        create: createInstituteType,
        update: updateInstituteType,
        delete: deleteInstituteType,
    },
}

export function getNameLookupApi(kind: NameLookupKind) {
    return NAME_LOOKUP_API[kind]
}
