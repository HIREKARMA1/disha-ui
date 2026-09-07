import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import {
  MockTest,
  MockTestQuestion,
  CreateMockTestPayload,
  UpdateMockTestPayload,
  CreateMockTestQuestionPayload,
  GenerateQuestionsPayload,
  MockTestAttempt,
  MockTestAnalytics,
  SubmitMockAttemptRequest,
  SubmitMockAttemptResponse,
} from '@/types/mockTest'

export function useAdminMockTests(filters?: {
  status?: string
  difficulty?: string
  search_term?: string
  topic?: string
}) {
  const [data, setData] = useState<MockTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.difficulty) params.append('difficulty', filters.difficulty)
      if (filters?.search_term) params.append('search_term', filters.search_term)
      if (filters?.topic) params.append('topic', filters.topic)
      const qs = params.toString()
      const response = await apiClient.client.get(`/mock-tests/admin${qs ? `?${qs}` : ''}`)
      setData(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch mock tests'))
    } finally {
      setIsLoading(false)
    }
  }, [filters?.status, filters?.difficulty, filters?.search_term, filters?.topic])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  return { data, isLoading, error, refetch: fetchTests }
}

export function useAdminMockTest(mockTestId?: string) {
  const [data, setData] = useState<MockTest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTest = useCallback(async () => {
    if (!mockTestId) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.client.get(`/mock-tests/admin/${mockTestId}`)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch mock test'))
    } finally {
      setIsLoading(false)
    }
  }, [mockTestId])

  useEffect(() => {
    fetchTest()
  }, [fetchTest])

  return { data, isLoading, error, refetch: fetchTest }
}

export function useCreateMockTest() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (payload: CreateMockTestPayload): Promise<MockTest> => {
    setIsPending(true)
    try {
      const response = await apiClient.client.post('/mock-tests/admin', payload)
      return response.data
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useUpdateMockTest() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: string, payload: UpdateMockTestPayload): Promise<MockTest> => {
    setIsPending(true)
    try {
      const response = await apiClient.client.put(`/mock-tests/admin/${id}`, payload)
      return response.data
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useDeleteMockTest() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: string) => {
    setIsPending(true)
    try {
      await apiClient.client.delete(`/mock-tests/admin/${id}`)
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function usePublishMockTest() {
  const mutateAsync = async (id: string): Promise<MockTest> => {
    const response = await apiClient.client.post(`/mock-tests/admin/${id}/publish`)
    return response.data
  }
  return { mutateAsync }
}

export function useUnpublishMockTest() {
  const mutateAsync = async (id: string): Promise<MockTest> => {
    const response = await apiClient.client.post(`/mock-tests/admin/${id}/unpublish`)
    return response.data
  }
  return { mutateAsync }
}

export function useDuplicateMockTest() {
  const mutateAsync = async (id: string): Promise<MockTest> => {
    const response = await apiClient.client.post(`/mock-tests/admin/${id}/duplicate`)
    return response.data
  }
  return { mutateAsync }
}

export function useGenerateMockQuestions() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: string, payload?: GenerateQuestionsPayload) => {
    setIsPending(true)
    try {
      const response = await apiClient.client.post(
        `/mock-tests/admin/${id}/questions/generate`,
        payload || {}
      )
      return response.data
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useCreateMockQuestion() {
  const mutateAsync = async (
    mockTestId: string,
    payload: CreateMockTestQuestionPayload
  ): Promise<MockTestQuestion> => {
    const response = await apiClient.client.post(
      `/mock-tests/admin/${mockTestId}/questions`,
      payload
    )
    return response.data
  }
  return { mutateAsync }
}

export function useUpdateMockQuestion() {
  const mutateAsync = async (
    mockTestId: string,
    questionId: string,
    payload: Partial<CreateMockTestQuestionPayload>
  ): Promise<MockTestQuestion> => {
    const response = await apiClient.client.put(
      `/mock-tests/admin/${mockTestId}/questions/${questionId}`,
      payload
    )
    return response.data
  }
  return { mutateAsync }
}

export function useDeleteMockQuestion() {
  const mutateAsync = async (mockTestId: string, questionId: string) => {
    await apiClient.client.delete(`/mock-tests/admin/${mockTestId}/questions/${questionId}`)
  }
  return { mutateAsync }
}

export function useMockTestAttempts(mockTestId?: string) {
  const [data, setData] = useState<MockTestAttempt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAttempts = useCallback(async () => {
    if (!mockTestId) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.client.get(`/mock-tests/admin/${mockTestId}/attempts`)
      setData(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch attempts'))
    } finally {
      setIsLoading(false)
    }
  }, [mockTestId])

  useEffect(() => {
    fetchAttempts()
  }, [fetchAttempts])

  return { data, isLoading, error, refetch: fetchAttempts }
}

export function useMockTestAnalytics(mockTestId?: string) {
  const [data, setData] = useState<MockTestAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    if (!mockTestId) return
    try {
      setIsLoading(true)
      const response = await apiClient.client.get(`/mock-tests/admin/${mockTestId}/analytics`)
      setData(response.data)
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [mockTestId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { data, isLoading, refetch: fetchAnalytics }
}

// Student hooks

export function usePublishedMockTests(searchTerm?: string) {
  const [data, setData] = useState<MockTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const params = searchTerm ? `?search_term=${encodeURIComponent(searchTerm)}` : ''
      const response = await apiClient.client.get(`/mock-tests${params}`)
      setData(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch mock tests'))
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  return { data, isLoading, error, refetch: fetchTests }
}

export function useMockTestDetail(mockTestId?: string) {
  const [data, setData] = useState<MockTest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTest = useCallback(async () => {
    if (!mockTestId) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.client.get(`/mock-tests/${mockTestId}`)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch mock test'))
    } finally {
      setIsLoading(false)
    }
  }, [mockTestId])

  useEffect(() => {
    fetchTest()
  }, [fetchTest])

  return { data, isLoading, error, refetch: fetchTest }
}

export function useSubmitMockAttempt() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (
    payload: SubmitMockAttemptRequest
  ): Promise<SubmitMockAttemptResponse> => {
    setIsPending(true)
    try {
      const response = await apiClient.client.post('/mock-tests/submit', payload)
      return response.data
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}
