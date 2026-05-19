/** Admin-managed lookup rows (colleges first; extend for more tables later). */

export interface CollegeLookupRow {
    id: string
    name: string
    university_id?: string | null
}

export interface CollegeListApiResponse {
    colleges: CollegeLookupRow[]
    total: number
    skip: number
    limit: number
}

export interface TechnicalSkillLookupRow {
    id: string
    name: string
    category?: string | null
    description?: string | null
}

export interface TechnicalSkillListApiResponse {
    skills: TechnicalSkillLookupRow[]
    total: number
    skip: number
    limit: number
}

export interface SoftSkillLookupRow {
    id: string
    name: string
}

export interface SoftSkillListApiResponse {
    soft_skills: SoftSkillLookupRow[]
    total: number
    skip: number
    limit: number
}

export interface BulkUploadApiResponse {
    success: boolean
    message: string
    records_processed: number
    records_created: number
    records_failed: number
    errors?: string[] | null
}

export type SkillLookupKind = 'technical' | 'soft'
