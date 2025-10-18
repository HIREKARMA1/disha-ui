import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'

// Update University Practice Module Hook
export function useUpdateUniversityPracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = useCallback(async (moduleId: string, moduleData: any): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.put(`/practice/university/modules/${moduleId}`, moduleData)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update university practice module')
            setError(error)
            console.error('Error updating university practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return { mutateAsync, isPending, error }
}

// Archive University Practice Module Hook
export function useArchiveUniversityPracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = useCallback(async (moduleId: string): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.put(`/practice/university/modules/${moduleId}/archive`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to archive university practice module')
            setError(error)
            console.error('Error archiving university practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return { mutateAsync, isPending, error }
}

// Delete University Practice Module Hook
export function useDeleteUniversityPracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = useCallback(async (moduleId: string): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.delete(`/practice/university/modules/${moduleId}`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete university practice module')
            setError(error)
            console.error('Error deleting university practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return { mutateAsync, isPending, error }
}