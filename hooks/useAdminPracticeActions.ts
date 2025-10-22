import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { 
    PracticeModule, 
    UpdatePracticeModuleSchema
} from '@/types/practice'

// Update Practice Module Hook
export function useUpdatePracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = useCallback(async (moduleId: string, moduleData: UpdatePracticeModuleSchema): Promise<PracticeModule> => {
        try {
            setIsPending(true)
            setError(null)
            
            const response = await apiClient.client.put(`/practice/admin/modules/${moduleId}`, moduleData)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update practice module')
            setError(error)
            console.error('Error updating practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return { mutateAsync, isPending, error }
}

// Archive/Unarchive Practice Module Hook
export function useArchivePracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = useCallback(async (moduleId: string, archive: boolean): Promise<PracticeModule> => {
        try {
            setIsPending(true)
            setError(null)
            
            const response = await apiClient.client.post(`/practice/admin/modules/${moduleId}/archive`, { archive })
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to archive practice module')
            setError(error)
            console.error('Error archiving practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return { mutateAsync, isPending, error }
}

// Delete Practice Module Hook
export function useDeletePracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = useCallback(async (moduleId: string): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.delete(`/practice/admin/modules/${moduleId}`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete practice module')
            setError(error)
            console.error('Error deleting practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }, [])

    return { mutateAsync, isPending, error }
}
