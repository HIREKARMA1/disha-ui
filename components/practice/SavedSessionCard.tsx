import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Play, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Progress component replaced with HTML progress bar
// AlertDialog components replaced with browser confirm

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

interface SavedSessionCardProps {
    session: SavedSession
    onResume: (moduleId: string) => void
    onClear: (moduleId: string) => void
}

export function SavedSessionCard({ session, onResume, onClear }: SavedSessionCardProps) {

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getProgressColor = (progress: number) => {
        if (progress === 0) return 'bg-gray-400'
        if (progress < 30) return 'bg-red-400'
        if (progress < 70) return 'bg-yellow-400'
        return 'bg-green-400'
    }

    const getProgressText = (progress: number) => {
        if (progress === 0) return 'Not started'
        if (progress < 30) return 'Just started'
        if (progress < 70) return 'In progress'
        return 'Almost done'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {session.moduleName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Question {session.currentQuestionIndex + 1} of {session.totalQuestions}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {session.answeredQuestions} answered
                    </span>
                    <div className="flex items-center gap-1">
                        {session.answeredQuestions > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {session.progress}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(session.progress)}`}
                        style={{ width: `${session.progress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getProgressText(session.progress)}
                </p>
            </div>

            {/* Session Info */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Started: {formatTime(session.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last saved: {formatTime(session.lastSaved)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={() => onResume(session.moduleId)}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Resume Practice
                </Button>
                
                <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                        if (confirm('Are you sure you want to delete this saved session? This action cannot be undone. You will lose all your progress on this practice test.')) {
                            onClear(session.moduleId)
                        }
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    )
}
