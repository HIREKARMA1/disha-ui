import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

export interface University {
    id: string
    university_name: string
    email: string
    phone: string
    institute_type: string
    address: string
    website_url?: string
    contact_person_name: string
    contact_designation: string
    verified: boolean
    status: string
    total_students: number
    total_faculty: number
    placement_rate: number
    average_package: number
    established_year: number
    courses_offered: string
    departments?: string
    programs_offered?: string
    top_recruiters?: string
    created_at: string
    updated_at: string
    last_login?: string
    is_archived: boolean
    email_verified: boolean
    phone_verified: boolean
    bio?: string
    profile_picture?: string
}

export interface UniversityListResponse {
    universities: University[]
    total: number
    skip: number
    limit: number
}

export function useUniversities(includeArchived: boolean = false) {
    const [data, setData] = useState<University[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchUniversities = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get('/practice/universities', {
                params: {
                    include_archived: includeArchived
                }
            })
            
            // Handle the API response structure
            const universities = response.data.universities || response.data
            setData(Array.isArray(universities) ? universities : [])
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch universities')
            setError(error)
            console.error('Error fetching universities:', err)
        } finally {
            setIsLoading(false)
        }
    }, [includeArchived])

    useEffect(() => {
        fetchUniversities()
    }, [fetchUniversities])

    return { data, isLoading, error, refetch: fetchUniversities }
}
