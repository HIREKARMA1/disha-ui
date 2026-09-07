import { useState, useEffect, useCallback, useRef } from 'react'
import { MockExamSession, MockQuestionAnswer, SubmitMockAttemptResponse } from '@/types/mockTest'
import { useSubmitMockAttempt } from './useMockTest'
import { useAuth } from './useAuth'

const STORAGE_KEY_PREFIX = 'mock_exam_session_'

export function useMockExamSession(mockTestId: string) {
  const [session, setSession] = useState<MockExamSession | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { user } = useAuth()
  const submitMutation = useSubmitMockAttempt()
  const isInitialized = useRef(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!mockTestId || isInitialized.current || !isClient) return

    const storageKey = `${STORAGE_KEY_PREFIX}${mockTestId}`
    const savedSession = localStorage.getItem(storageKey)

    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession)
        parsed.flaggedQuestions = new Set(parsed.flaggedQuestions || [])
        if (parsed.startTime && typeof parsed.startTime === 'string') {
          parsed.startTime = new Date(parsed.startTime)
        }
        setSession(parsed)
        isInitialized.current = true
        return
      } catch {
        localStorage.removeItem(storageKey)
      }
    }

    setSession({
      mockTestId,
      currentQuestionIndex: 0,
      answers: {},
      timeSpent: {},
      flaggedQuestions: new Set(),
      startTime: new Date(),
      isSubmitted: false,
    })
    isInitialized.current = true
  }, [mockTestId, isClient])

  useEffect(() => {
    if (!session || !mockTestId || !isInitialized.current || !isClient) return
    const storageKey = `${STORAGE_KEY_PREFIX}${mockTestId}`
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...session,
        flaggedQuestions: Array.from(session.flaggedQuestions),
      })
    )
  }, [session, mockTestId, isClient])

  const updateAnswer = useCallback((questionId: string, answer: string[]) => {
    setSession((prev) => {
      if (!prev) return null
      return { ...prev, answers: { ...prev.answers, [questionId]: answer } }
    })
  }, [])

  const updateTimeSpent = useCallback((questionId: string, seconds: number) => {
    setSession((prev) => {
      if (!prev) return null
      return {
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [questionId]: (prev.timeSpent[questionId] || 0) + seconds,
        },
      }
    })
  }, [])

  const setCurrentQuestionIndex = useCallback((index: number) => {
    setSession((prev) => (prev ? { ...prev, currentQuestionIndex: index } : null))
  }, [])

  const toggleFlag = useCallback((questionId: string) => {
    setSession((prev) => {
      if (!prev) return null
      const next = new Set(prev.flaggedQuestions)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return { ...prev, flaggedQuestions: next }
    })
  }, [])

  const clearSession = useCallback(() => {
    if (!mockTestId) return
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${mockTestId}`)
    setSession(null)
    isInitialized.current = false
  }, [mockTestId])

  const submitExam = useCallback(
    async (questionIds: string[]): Promise<SubmitMockAttemptResponse> => {
      if (!session || !user) throw new Error('No active session')

      const answers: MockQuestionAnswer[] = questionIds.map((qid) => ({
        question_id: qid,
        answer: session.answers[qid] || [],
        time_spent: session.timeSpent[qid] || 0,
      }))

      const result = await submitMutation.mutateAsync({
        mock_test_id: mockTestId,
        student_id: String(user.id || ''),
        answers,
        started_at: session.startTime.toISOString(),
        ended_at: new Date().toISOString(),
      })

      setSession((prev) => (prev ? { ...prev, isSubmitted: true } : null))
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${mockTestId}`)
      return result
    },
    [session, user, mockTestId, submitMutation]
  )

  return {
    session,
    isClient,
    updateAnswer,
    updateTimeSpent,
    setCurrentQuestionIndex,
    toggleFlag,
    submitExam,
    clearSession,
    isSubmitting: submitMutation.isPending,
  }
}
