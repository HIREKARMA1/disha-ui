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
