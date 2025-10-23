import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { 
    PracticeModule, 
    Question, 
    CreatePracticeModuleSchema,
    UpdatePracticeModuleSchema,
    CreateQuestionSchema,
    UpdateQuestionSchema,
    PracticeCategory
} from '@/types/practice'

// Admin Practice Module Hooks

export function useAdminPracticeModules(
    category?: string,
    role?: string,
    difficulty?: string,
    searchTerm?: string
) {
    const [data, setData] = useState<PracticeModule[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchModules = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const params = new URLSearchParams()
            if (category) params.append('category', category)
            if (role) params.append('role', role)
            if (difficulty) params.append('difficulty', difficulty)
            if (searchTerm) params.append('search_term', searchTerm)
            
            const response = await apiClient.client.get(`/practice/university/modules?${params.toString()}`)
            console.log('🔄 Fetched modules from API:', response.data)
            // Handle the API response structure - data is in response.data.value
            setData(response.data.value || response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch practice modules')
            setError(error)
            console.error('Error fetching admin practice modules:', err)
        } finally {
            setIsLoading(false)
        }
    }, [category, role, difficulty, searchTerm])

    useEffect(() => {
        fetchModules()
    }, [fetchModules])

    return { data, isLoading, error, refetch: fetchModules }
}

export function useCreatePracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleData: CreatePracticeModuleSchema): Promise<PracticeModule> => {
        try {
            setIsPending(true)
            setError(null)
            
            const response = await apiClient.client.post('/practice/university/modules', moduleData)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create practice module')
            setError(error)
            console.error('Error creating practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

export function useUpdatePracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string, moduleData: UpdatePracticeModuleSchema): Promise<PracticeModule> => {
        try {
            setIsPending(true)
            setError(null)
            
            const response = await apiClient.client.put(`/practice/university/modules/${moduleId}`, moduleData)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update practice module')
            setError(error)
            console.error('Error updating practice module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

export function useDeletePracticeModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string): Promise<void> => {
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
    }

    return { mutateAsync, isPending, error }
}

// Admin Question Hooks

export function useAdminQuestions(moduleId?: string) {
    const [data, setData] = useState<Question[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchQuestions = useCallback(async () => {
        if (!moduleId) {
            setData([])
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get(`/practice/university/modules/${moduleId}/questions`)
            console.log('🔄 Fetched questions from API:', response.data)
            console.log('🔄 Raw response structure:', {
                hasValue: 'value' in response.data,
                hasData: 'data' in response.data,
                isArray: Array.isArray(response.data),
                firstQuestion: response.data?.[0],
                firstQuestionOptions: response.data?.[0]?.options,
                firstQuestionOptionsType: typeof response.data?.[0]?.options
            })
            // Handle the API response structure - data is in response.data.value
            setData(response.data.value || response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch module questions')
            setError(error)
            console.error('Error fetching module questions:', err)
        } finally {
            setIsLoading(false)
        }
    }, [moduleId])

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    return { data, isLoading, error, refetch: fetchQuestions }
}

export function useCreateQuestion() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (questionData: CreateQuestionSchema): Promise<Question> => {
        try {
            setIsPending(true)
            setError(null)
            
            const response = await apiClient.client.post('/practice/university/questions', questionData)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create question')
            setError(error)
            console.error('Error creating question:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

export function useUpdateQuestion() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (questionId: string, questionData: UpdateQuestionSchema): Promise<Question> => {
        try {
            setIsPending(true)
            setError(null)
            
            const response = await apiClient.client.put(`/practice/university/questions/${questionId}`, questionData)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update question')
            setError(error)
            console.error('Error updating question:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

export function useDeleteQuestion() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (questionId: string): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.delete(`/practice/university/questions/${questionId}`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete question')
            setError(error)
            console.error('Error deleting question:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

// Module-Question Management Hooks

export function useAddQuestionToModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string, questionId: string): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.post(`/practice/university/modules/${moduleId}/questions/${questionId}`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to add question to module')
            setError(error)
            console.error('Error adding question to module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

export function useRemoveQuestionFromModule() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string, questionId: string): Promise<void> => {
        try {
            setIsPending(true)
            setError(null)
            
            await apiClient.client.delete(`/practice/university/modules/${moduleId}/questions/${questionId}`)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to remove question from module')
            setError(error)
            console.error('Error removing question from module:', err)
            throw error
        } finally {
            setIsPending(false)
        }
    }

    return { mutateAsync, isPending, error }
}

// Statistics Hooks

export function useModuleStatistics(moduleId: string) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchStatistics = useCallback(async () => {
        if (!moduleId) {
            setData(null)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get(`/practice/admin/modules/${moduleId}/statistics`)
            setData(response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch module statistics')
            setError(error)
            console.error('Error fetching module statistics:', err)
        } finally {
            setIsLoading(false)
        }
    }, [moduleId])

    useEffect(() => {
        fetchStatistics()
    }, [fetchStatistics])

    return { data, isLoading, error, refetch: fetchStatistics }
}

export function useQuestionStatistics(questionId: string) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchStatistics = useCallback(async () => {
        if (!questionId) {
            setData(null)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get(`/practice/admin/questions/${questionId}/statistics`)
            setData(response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch question statistics')
            setError(error)
            console.error('Error fetching question statistics:', err)
        } finally {
            setIsLoading(false)
        }
    }, [questionId])

    useEffect(() => {
        fetchStatistics()
    }, [fetchStatistics])

    return { data, isLoading, error, refetch: fetchStatistics }
}

// University Practice Statistics Hook
export function useUniversityPracticeStatistics() {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchStatistics = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.get('/practice/university/statistics')
            console.log('🔄 Fetched university practice statistics:', response.data)
            setData(response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch university practice statistics')
            setError(error)
            console.error('Error fetching university practice statistics:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStatistics()
    }, [fetchStatistics])

    return { data, isLoading, error, refetch: fetchStatistics }
}
