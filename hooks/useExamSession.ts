import { useState, useEffect, useCallback } from 'react'
import { ExamSession, QuestionAnswer, SubmitAttemptRequest, SubmitAttemptResponse } from '@/types/practice'
import { useSubmitAttempt } from './usePractice'
import { useAuth } from './useAuth'
import { apiClient } from '@/lib/api'

const STORAGE_KEY_PREFIX = 'exam_session_'

export function useExamSession(moduleId: string) {
    const [session, setSession] = useState<ExamSession | null>(null)
    const { user } = useAuth()
    const submitAttemptMutation = useSubmitAttempt()

    // Load session from localStorage on mount
    useEffect(() => {
        if (!moduleId) return

        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        const clearFlagKey = `clear_flag_${moduleId}`
        
        // Check if there's a clear flag for this module (using localStorage for persistence)
        const clearFlag = localStorage.getItem(clearFlagKey)
        
        if (clearFlag) {
            // Clear flag exists, remove it and create fresh session
            localStorage.removeItem(clearFlagKey)
            localStorage.removeItem(storageKey)
            
            // Create fresh session immediately
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
            return
        }
        
        try {
            // Try to load existing session from localStorage
            const savedSession = localStorage.getItem(storageKey)
            
            if (savedSession) {
                const parsedSession = JSON.parse(savedSession)
                
                // Convert flaggedQuestions array back to Set
                const restoredSession: ExamSession = {
                    ...parsedSession,
                    flaggedQuestions: new Set(parsedSession.flaggedQuestions || []),
                    startTime: new Date(parsedSession.startTime)
                }
                
                // Only restore if session is not submitted and not too old (24 hours)
                const isRecent = Date.now() - restoredSession.startTime.getTime() < 24 * 60 * 60 * 1000
                
                if (!restoredSession.isSubmitted && isRecent) {
                    setSession(restoredSession)
                    return
                }
            }
        } catch (error) {
            console.error('Failed to load session from localStorage:', error)
        }
        
        // Create a fresh session only if no valid session was found
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
    }, [moduleId])

    // Listen for storage changes to detect when session is cleared
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `${STORAGE_KEY_PREFIX}${moduleId}` && e.newValue === null) {
                // Session was cleared, create a fresh one
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
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
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

    // Sync to backend every 30 seconds (only if not submitted)
    useEffect(() => {
        if (!session || !moduleId || session.isSubmitted) return

        const syncToBackend = async () => {
            try {
                const sessionToSave = {
                    ...session,
                    flaggedQuestions: Array.from(session.flaggedQuestions)
                }
                await apiClient.saveExamProgress(sessionToSave)
            } catch (error) {
                console.error('Failed to sync exam progress to backend:', error)
            }
        }
        
        const interval = setInterval(syncToBackend, 30000)
        return () => clearInterval(interval)
    }, [session?.isSubmitted, moduleId])

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
            // Store failed attempt for retry
            const storageKey = `failed_attempt_${moduleId}`
            localStorage.setItem(storageKey, JSON.stringify(request))
            throw error
        }
    }, [session, user, submitAttemptMutation, moduleId])

    const clearSession = useCallback(() => {
        setSession(null)
        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        localStorage.removeItem(storageKey)
    }, [moduleId])

    const forceFreshSession = useCallback(() => {
        const storageKey = `${STORAGE_KEY_PREFIX}${moduleId}`
        localStorage.removeItem(storageKey)
        
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
    }, [moduleId])

    return {
        session,
        setSession,
        updateAnswer,
        updateTimeSpent,
        toggleFlag,
        submitExam,
        clearSession,
        forceFreshSession,
        isSubmitting: submitAttemptMutation.isPending
    }
}