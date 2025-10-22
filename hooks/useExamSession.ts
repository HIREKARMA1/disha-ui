import { useState, useEffect, useCallback, useRef } from 'react'
import { ExamSession, QuestionAnswer, SubmitAttemptRequest, SubmitAttemptResponse } from '@/types/practice'
import { useSubmitAttempt } from './usePractice'
import { useAuth } from './useAuth'

const STORAGE_KEY_PREFIX = 'exam_session_'

export function useExamSession(moduleId: string) {
    const [session, setSession] = useState<ExamSession | null>(null)
    const [isClient, setIsClient] = useState(false)
    const { user } = useAuth()
    const submitAttemptMutation = useSubmitAttempt()
    const isInitialized = useRef(false)

    // Set client flag to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Load session from localStorage on mount (only on client)
    useEffect(() => {
        if (!moduleId || isInitialized.current || !isClient) return

        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        const savedSession = localStorage.getItem(storageKey)
        
        if (savedSession) {
            try {
                const parsedSession = JSON.parse(savedSession)
                // Convert flaggedQuestions Set back from array
                parsedSession.flaggedQuestions = new Set(parsedSession.flaggedQuestions || [])
                // Convert startTime string back to Date object
                if (parsedSession.startTime && typeof parsedSession.startTime === 'string') {
                    parsedSession.startTime = new Date(parsedSession.startTime)
                }
                setSession(parsedSession)
                isInitialized.current = true
            } catch (error) {
                console.error('Failed to parse saved session:', error)
                localStorage.removeItem(storageKey)
                // Create new session if parsing fails
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
                isInitialized.current = true
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
            isInitialized.current = true
            
            // Clear any cached mock data
            console.log('🔄 Starting new exam session, clearing any cached data')
            
            // Clear localStorage to remove any cached mock data
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith('exam_session_')) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
            console.log('🗑️ Cleared cached exam sessions:', keysToRemove)
        }
    }, [moduleId, isClient])

    // Save session to localStorage whenever it changes (only on client)
    useEffect(() => {
        if (!session || !moduleId || !isInitialized.current || !isClient) return

        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        const sessionToSave = {
            ...session,
            flaggedQuestions: Array.from(session.flaggedQuestions) // Convert Set to Array for JSON
        }
        localStorage.setItem(storageKey, JSON.stringify(sessionToSave))
    }, [session, moduleId, isClient])

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
        
        console.log('📝 Submitting answers:', answers)
        console.log('📝 Session answers:', session.answers)
        console.log('📝 Session timeSpent:', session.timeSpent)
        
        // Submit all answers - no filtering needed since we're using real data
        const validAnswers = answers
        
        console.log('✅ Valid answers to submit:', validAnswers)
        
        if (validAnswers.length === 0) {
            throw new Error('No valid answers to submit. Please refresh the page and try again.')
        }

        // Use a default student ID if the user is an admin (for testing purposes)
        const studentId = user.user_type === 'admin' ? '33ecff0a-7e83-4177-b657-85fe38aec1e4' : user.id
        
        // Ensure startTime is a Date object
        const startTime = session.startTime instanceof Date ? session.startTime : new Date(session.startTime)
        
        const request: SubmitAttemptRequest = {
            module_id: session.moduleId,
            student_id: studentId,
            attempt_id: `attempt_${Date.now()}`,
            answers: validAnswers,
            started_at: startTime.toISOString(),
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
