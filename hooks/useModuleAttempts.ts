import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

// Get Module Attempts Hook
export function useModuleAttempts(moduleId: string) {
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchAttempts = useCallback(async () => {
        if (!moduleId) {
            setData([])
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get(`/practice/admin/modules/${moduleId}/attempts`)
            console.log('🔄 Fetched attempts from API:', response.data)
            // Handle the API response structure - data is in response.data.value
            setData(response.data.value || response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch module attempts')
            setError(error)
            console.error('Error fetching module attempts:', err)
        } finally {
            setIsLoading(false)
        }
    }, [moduleId])

    useEffect(() => {
        fetchAttempts()
    }, [fetchAttempts])

    return { data, isLoading, error, refetch: fetchAttempts }
}
