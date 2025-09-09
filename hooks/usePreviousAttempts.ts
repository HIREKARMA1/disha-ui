import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'

export interface PreviousAttempt {
    moduleId: string
    moduleName: string
    moduleRole: string
    questionsCount: number
    duration: number
    status: 'in-progress' | 'completed' | 'submitted'
    currentQuestionIndex: number
    answeredQuestions: number
    startTime: string
    lastUpdated: string
    score?: number
    totalTimeSpent?: number
}

const PREVIOUS_ATTEMPTS_KEY = 'previous_attempts'

export function usePreviousAttempts() {
    const [attempts, setAttempts] = useState<PreviousAttempt[]>([])
    const [forceUpdate, setForceUpdate] = useState(0)
    const { user } = useAuth()
    
    // Ref to always have current attempts
    const attemptsRef = useRef(attempts)
    
    // Create a key that changes when we want to force re-render
    const renderKey = attempts.length + forceUpdate

    // Load attempts from localStorage on mount
    useEffect(() => {
        if (!user) return

        try {
            const savedAttempts = localStorage.getItem(PREVIOUS_ATTEMPTS_KEY)
            if (savedAttempts) {
                const parsedAttempts = JSON.parse(savedAttempts)
                // Filter attempts for current user
                const userAttempts = parsedAttempts.filter((attempt: PreviousAttempt) => 
                    attempt.moduleId // Basic filtering, you might want to add user ID tracking
                )
                setAttempts(userAttempts)
            }
        } catch (error) {
            console.error('Failed to load previous attempts:', error)
        }
    }, [user])

    // Save attempts to localStorage whenever it changes
    useEffect(() => {
        if (attempts.length > 0) {
            localStorage.setItem(PREVIOUS_ATTEMPTS_KEY, JSON.stringify(attempts))
        }
    }, [attempts])

    // Update ref when attempts change
    useEffect(() => {
        attemptsRef.current = attempts
    }, [attempts])

    const addOrUpdateAttempt = useCallback((attempt: PreviousAttempt) => {
        setAttempts(prev => {
            const existingIndex = prev.findIndex(a => a.moduleId === attempt.moduleId)
            
            if (existingIndex >= 0) {
                // Update existing attempt
                const updated = [...prev]
                updated[existingIndex] = attempt
                return updated
            } else {
                // Add new attempt
                return [...prev, attempt]
            }
        })
    }, [])

    const updateAttemptProgress = useCallback((
        moduleId: string, 
        currentQuestionIndex: number, 
        answeredQuestions: number,
        status: 'in-progress' | 'completed' | 'submitted' = 'in-progress'
    ) => {
        setAttempts(prev => 
            prev.map(attempt => 
                attempt.moduleId === moduleId 
                    ? {
                        ...attempt,
                        currentQuestionIndex,
                        answeredQuestions,
                        status,
                        lastUpdated: new Date().toISOString()
                    }
                    : attempt
            )
        )
    }, [])

    const markAttemptAsSubmitted = useCallback((moduleId: string, score?: number, totalTimeSpent?: number) => {
        setAttempts(prev => 
            prev.map(attempt => 
                attempt.moduleId === moduleId 
                    ? {
                        ...attempt,
                        status: 'submitted' as const,
                        score,
                        totalTimeSpent,
                        lastUpdated: new Date().toISOString()
                    }
                    : attempt
            )
        )
    }, [])

    const retakeAttempt = useCallback((moduleId: string) => {
        // Clear the session data first
        const sessionStorageKey = `exam_session_${moduleId}`
        localStorage.removeItem(sessionStorageKey)
        sessionStorage.removeItem(`notified_${moduleId}`)
        
        // Set a flag to indicate this session should be cleared (using localStorage for persistence)
        localStorage.setItem(`clear_flag_${moduleId}`, 'true')
        
        // Update the attempt data
        setAttempts(prev => 
            prev.map(attempt => 
                attempt.moduleId === moduleId 
                    ? {
                        ...attempt,
                        currentQuestionIndex: 0,
                        answeredQuestions: 0,
                        status: 'in-progress' as const,
                        startTime: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        score: undefined,
                        totalTimeSpent: undefined
                    }
                    : attempt
            )
        )
    }, [])

    const clearAttempt = useCallback((moduleId: string) => {
        // Clear the attempt from state
        setAttempts(prev => prev.filter(attempt => attempt.moduleId !== moduleId))
        
        // Also clear the corresponding session data from localStorage
        const sessionStorageKey = `exam_session_${moduleId}`
        localStorage.removeItem(sessionStorageKey)
        
        // Clear any session storage notifications
        sessionStorage.removeItem(`notified_${moduleId}`)
        
        // Set a flag to indicate this session should be cleared (using localStorage for persistence)
        localStorage.setItem(`clear_flag_${moduleId}`, 'true')
        
        // Force a re-render to fix any stale closure issues
        setForceUpdate(prev => prev + 1)
    }, [])

    const getAttemptByModuleId = useCallback((moduleId: string) => {
        return attempts.find(attempt => attempt.moduleId === moduleId)
    }, [attempts])

    const clearAllAttempts = useCallback(() => {
        // Clear all session data for all attempts
        attempts.forEach(attempt => {
            const sessionStorageKey = `exam_session_${attempt.moduleId}`
            localStorage.removeItem(sessionStorageKey)
            sessionStorage.removeItem(`notified_${attempt.moduleId}`)
            localStorage.setItem(`clear_flag_${attempt.moduleId}`, 'true')
        })
        
        // Clear all attempts
        setAttempts([])
    }, [attempts])


    // Function to get current attempts (always fresh from ref)
    const getCurrentAttempts = useCallback(() => {
        return attemptsRef.current
    }, [])

    return {
        attempts,
        forceUpdate,
        getCurrentAttempts,
        addOrUpdateAttempt,
        updateAttemptProgress,
        markAttemptAsSubmitted,
        retakeAttempt,
        clearAttempt,
        clearAllAttempts,
        getAttemptByModuleId
    }
}