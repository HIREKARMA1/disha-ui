import { useState, useEffect, useCallback } from 'react'
import { ExamSession, QuestionAnswer, SubmitAttemptRequest, SubmitAttemptResponse } from '@/types/practice'
import { useSubmitAttempt } from './usePractice'
import { useAuth } from './useAuth'

const STORAGE_KEY_PREFIX = 'exam_session_'

export function useExamSession(moduleId: string) {
    const [session, setSession] = useState<ExamSession | null>(null)
    const { user } = useAuth()
    const submitAttemptMutation = useSubmitAttempt()

    // Load session from localStorage on mount
    useEffect(() => {
        if (!moduleId) return

        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        const savedSession = localStorage.getItem(storageKey)
        
        if (savedSession) {
            try {
                const parsedSession = JSON.parse(savedSession)
                // Convert flaggedQuestions Set back from array
                parsedSession.flaggedQuestions = new Set(parsedSession.flaggedQuestions || [])
                setSession(parsedSession)
            } catch (error) {
                console.error('Failed to parse saved session:', error)
                localStorage.removeItem(storageKey)
            }
        } else {
            // Create new session
            const newSession: ExamSession = {
                moduleId,
                currentQuestionIndex: 0,
                answers: {},
                timeSpent: {},
                flaggedQuestions: new Set(),
                startTime: new Date(),
                isSubmitted: false
            }
            setSession(newSession)
        }
    }, [moduleId])

    // Save session to localStorage whenever it changes
    useEffect(() => {
        if (!session || !moduleId) return

        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        const sessionToSave = {
            ...session,
            flaggedQuestions: Array.from(session.flaggedQuestions) // Convert Set to Array for JSON
        }
        localStorage.setItem(storageKey, JSON.stringify(sessionToSave))
    }, [session, moduleId])

    const updateAnswer = useCallback((questionId: string, answer: string[]) => {
        setSession(prev => {
            if (!prev) return null
            return {
                ...prev,
                answers: {
                    ...prev.answers,
                    [questionId]: answer
                }
            }
        })
    }, [])

    const updateTimeSpent = useCallback((questionId: string, timeSpent: number) => {
        setSession(prev => {
            if (!prev) return null
            return {
                ...prev,
                timeSpent: {
                    ...prev.timeSpent,
                    [questionId]: timeSpent
                }
            }
        })
    }, [])

    const toggleFlag = useCallback((questionId: string) => {
        setSession(prev => {
            if (!prev) return null
            const newFlaggedQuestions = new Set(prev.flaggedQuestions)
            if (newFlaggedQuestions.has(questionId)) {
                newFlaggedQuestions.delete(questionId)
            } else {
                newFlaggedQuestions.add(questionId)
            }
            return {
                ...prev,
                flaggedQuestions: newFlaggedQuestions
            }
        })
    }, [])

    const submitExam = useCallback(async (): Promise<SubmitAttemptResponse> => {
        if (!session || !user) {
            throw new Error('No active session or user')
        }

        const answers: QuestionAnswer[] = Object.entries(session.answers).map(([questionId, answer]) => ({
            question_id: questionId,
            answer,
            time_spent: session.timeSpent[questionId] || 0
        }))

        const request: SubmitAttemptRequest = {
            module_id: session.moduleId,
            student_id: user.id,
            attempt_id: `attempt_${Date.now()}`,
            answers,
            started_at: session.startTime.toISOString(),
            ended_at: new Date().toISOString()
        }

        try {
            const result = await submitAttemptMutation.mutateAsync(request)
            
            // Mark session as submitted
            setSession(prev => prev ? { ...prev, isSubmitted: true } : null)
            
            // Clear localStorage
            const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
            localStorage.removeItem(storageKey)
            
            return result
        } catch (error) {
            console.error('Failed to submit exam:', error)
            throw error
        }
    }, [session, user, submitAttemptMutation, moduleId])

    const clearSession = useCallback(() => {
        setSession(null)
        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        localStorage.removeItem(storageKey)
    }, [moduleId])

    return {
        session,
        updateAnswer,
        updateTimeSpent,
        toggleFlag,
        submitExam,
        clearSession,
        isSubmitting: submitAttemptMutation.isPending
    }
}
