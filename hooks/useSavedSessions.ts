import { useState, useEffect, useCallback } from 'react'
import { PracticeModule } from '@/types/practice'

interface SavedSession {
    moduleId: string
    moduleName: string
    currentQuestionIndex: number
    totalQuestions: number
    answeredQuestions: number
    startTime: string
    lastSaved: string
    progress: number
}

export function useSavedSessions(modules: PracticeModule[] = []) {
    const [savedSessions, setSavedSessions] = useState<SavedSession[]>([])

    const loadSessions = useCallback(() => {
        if (!modules.length) return

        const sessions: SavedSession[] = []
        
        modules.forEach(module => {
            const storageKey = `exam_session_${module.id}`
            const savedSession = localStorage.getItem(storageKey)
            
            if (savedSession) {
                try {
                    const parsedSession = JSON.parse(savedSession)
                    
                    // Only include incomplete sessions (not submitted)
                    if (!parsedSession.isSubmitted) {
                        const answeredQuestions = Object.keys(parsedSession.answers || {}).length
                        const progress = Math.round((answeredQuestions / module.questions_count) * 100)
                        
                        sessions.push({
                            moduleId: module.id,
                            moduleName: module.name,
                            currentQuestionIndex: parsedSession.currentQuestionIndex || 0,
                            totalQuestions: module.questions_count,
                            answeredQuestions,
                            startTime: parsedSession.startTime,
                            lastSaved: new Date().toISOString(),
                            progress
                        })
                    }
                } catch (error) {
                    console.error('Error parsing saved session:', error)
                }
            }
        })
        
        setSavedSessions(sessions)
    }, [modules])

    useEffect(() => {
        loadSessions()
    }, [loadSessions])

    // Listen for localStorage changes to update sessions in real-time
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Check if any exam session was modified
            if (e.key && e.key.startsWith('exam_session_')) {
                loadSessions()
            }
        }

        // Listen for custom events from same tab
        const handleCustomStorageChange = () => {
            loadSessions()
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('examSessionChanged', handleCustomStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('examSessionChanged', handleCustomStorageChange)
        }
    }, [loadSessions])

    const clearSession = (moduleId: string) => {
        const storageKey = `exam_session_${moduleId}`
        localStorage.removeItem(storageKey)
        localStorage.removeItem(`clear_flag_${moduleId}`)
        localStorage.removeItem(`notified_${moduleId}`)
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('examSessionChanged'))
        
        // Update the saved sessions list
        setSavedSessions(prev => prev.filter(session => session.moduleId !== moduleId))
    }

    return {
        savedSessions,
        clearSession
    }
}
