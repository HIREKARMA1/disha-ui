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

// Corporate Practice Module Hooks

export function useCorporatePracticeModules(
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
            
            const response = await apiClient.client.get(`/practice/corporate/modules?${params.toString()}`)
            console.log('🔄 Fetched corporate modules from API:', response.data)
            // Handle the API response structure - data is in response.data.value
            setData(response.data.value || response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch corporate practice modules')
            setError(error)
            console.error('Error fetching corporate practice modules:', err)
        } finally {
            setIsLoading(false)
        }
    }, [category, role, difficulty, searchTerm])

    useEffect(() => {
        fetchModules()
    }, [fetchModules])

    const refetch = useCallback(() => {
        fetchModules()
    }, [fetchModules])

    return { data, isLoading, error, refetch }
}

export function useCorporateQuestions(moduleId?: string) {
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
            
            const response = await apiClient.client.get(`/practice/corporate/modules/${moduleId}/questions`)
            console.log('🔄 Fetched corporate module questions from API:', response.data)
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
            const error = err instanceof Error ? err : new Error('Failed to fetch corporate module questions')
            setError(error)
            console.error('Error fetching corporate module questions:', err)
        } finally {
            setIsLoading(false)
        }
    }, [moduleId])

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    const refetch = useCallback(() => {
        fetchQuestions()
    }, [fetchQuestions])

    return { data, isLoading, error, refetch }
}

export function useCreateCorporatePracticeModule() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleData: CreatePracticeModuleSchema) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.post('/practice/corporate/modules', moduleData)
            console.log('✅ Corporate practice module created:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create corporate practice module')
            setError(error)
            console.error('Error creating corporate practice module:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useCorporatePracticeQuestions(
    category?: string,
    role?: string,
    difficulty?: string,
    searchTerm?: string
) {
    const [data, setData] = useState<Question[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchQuestions = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const params = new URLSearchParams()
            if (category) params.append('category', category)
            if (role) params.append('role', role)
            if (difficulty) params.append('difficulty', difficulty)
            if (searchTerm) params.append('search_term', searchTerm)
            
            const response = await apiClient.client.get(`/practice/corporate/questions?${params.toString()}`)
            console.log('🔄 Fetched corporate questions from API:', response.data)
            // Handle the API response structure - data is in response.data.value
            setData(response.data.value || response.data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch corporate practice questions')
            setError(error)
            console.error('Error fetching corporate practice questions:', err)
        } finally {
            setIsLoading(false)
        }
    }, [category, role, difficulty, searchTerm])

    useEffect(() => {
        fetchQuestions()
    }, [fetchQuestions])

    const refetch = useCallback(() => {
        fetchQuestions()
    }, [fetchQuestions])

    return { data, isLoading, error, refetch }
}

export function useCreateCorporatePracticeQuestion() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (questionData: CreateQuestionSchema) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.post('/practice/corporate/questions', questionData)
            console.log('✅ Corporate practice question created:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create corporate practice question')
            setError(error)
            console.error('Error creating corporate practice question:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useUpdateCorporatePracticeModule() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string, moduleData: UpdatePracticeModuleSchema) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.put(`/practice/corporate/modules/${moduleId}`, moduleData)
            console.log('✅ Corporate practice module updated:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update corporate practice module')
            setError(error)
            console.error('Error updating corporate practice module:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useUpdateCorporatePracticeQuestion() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (questionId: string, questionData: UpdateQuestionSchema) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.put(`/practice/corporate/questions/${questionId}`, questionData)
            console.log('✅ Corporate practice question updated:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update corporate practice question')
            setError(error)
            console.error('Error updating corporate practice question:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useDeleteCorporatePracticeModule() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.delete(`/practice/corporate/modules/${moduleId}`)
            console.log('✅ Corporate practice module deleted:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete corporate practice module')
            setError(error)
            console.error('Error deleting corporate practice module:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useDeleteCorporatePracticeQuestion() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (questionId: string) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.delete(`/practice/corporate/questions/${questionId}`)
            console.log('✅ Corporate practice question deleted:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete corporate practice question')
            console.error('Error deleting corporate practice question:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useAddQuestionToModule() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string, questionId: string) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.post(`/practice/corporate/modules/${moduleId}/questions`, {
                question_id: questionId
            })
            console.log('✅ Question added to corporate module:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to add question to corporate module')
            console.error('Error adding question to corporate module:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}

export function useRemoveQuestionFromModule() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const mutateAsync = async (moduleId: string, questionId: string) => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await apiClient.client.delete(`/practice/corporate/modules/${moduleId}/questions/${questionId}`)
            console.log('✅ Question removed from corporate module:', response.data)
            return response.data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to remove question from corporate module')
            console.error('Error removing question from corporate module:', err)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return { mutateAsync, isLoading, error }
}
