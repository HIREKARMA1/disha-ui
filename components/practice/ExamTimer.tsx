"use client"

import { useState, useEffect, useCallback } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface ExamTimerProps {
    duration: number // in seconds
    moduleId: string
    onTimeUp: () => void
}

export function ExamTimer({ duration, moduleId, onTimeUp }: ExamTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration)
    const [isWarning, setIsWarning] = useState(false)
    const [isCritical, setIsCritical] = useState(false)

    // Debug logging and update timer when duration changes
    useEffect(() => {
        console.log('ExamTimer initialized with duration:', duration)
        setTimeLeft(duration)
    }, [duration])

    // Sync time to backend every minute
    const syncTimeToBackend = useCallback(async (timeRemaining: number) => {
        try {
            await apiClient.updateExamTime(moduleId, timeRemaining)
        } catch (error) {
            console.error('Failed to sync time to backend:', error)
        }
    }, [moduleId])

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    onTimeUp()
                    return 0
                }
                const newTime = prev - 1
                
                // Sync to backend every minute
                if (newTime % 60 === 0) {
                    syncTimeToBackend(newTime)
                }
                
                return newTime
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [onTimeUp, syncTimeToBackend])

    useEffect(() => {
        // Warning when 10 minutes left
        if (timeLeft <= 600 && timeLeft > 60) {
            setIsWarning(true)
            setIsCritical(false)
        }
        // Critical when 1 minute left
        else if (timeLeft <= 60) {
            setIsWarning(false)
            setIsCritical(true)
        }
        else {
            setIsWarning(false)
            setIsCritical(false)
        }
    }, [timeLeft])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (isCritical) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
        if (isWarning) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }

    const getIconColor = () => {
        if (isCritical) return 'text-red-600 dark:text-red-400'
        if (isWarning) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-gray-600 dark:text-gray-400'
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${getTimerColor()}`}>
            {isCritical ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
                <Clock className={`w-5 h-5 ${getIconColor()}`} />
            )}
            <span className={`font-mono text-lg font-semibold ${getIconColor()}`}>
                {formatTime(timeLeft)}
            </span>
            {isCritical && (
                <span className="text-xs font-medium animate-pulse">
                    Time's up!
                </span>
            )}
        </div>
    )
}