import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

export interface Branch {
    id: string
    name: string
    description?: string
    created_at: string
    updated_at: string
    tenant_id: string
}

export interface BranchListResponse {
    branches: Branch[]
    total: number
    skip: number
    limit: number
}

export function useBranches() {
    const [data, setData] = useState<Branch[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchBranches = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get('/lookups/student-branches')
            
            // Handle the API response structure
            const branches = response.data.branches || response.data
            setData(Array.isArray(branches) ? branches : [])
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch branches')
            setError(error)
            console.error('Error fetching branches:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBranches()
    }, [fetchBranches])

    return { data, isLoading, error, refetch: fetchBranches }
}
