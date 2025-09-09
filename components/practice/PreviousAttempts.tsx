"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Play, RotateCcw, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PreviousAttempt } from '@/hooks/usePreviousAttempts'
import { PracticeModule } from '@/types/practice'

interface PreviousAttemptsProps {
    attempts: PreviousAttempt[]
    modules: PracticeModule[]
    onRetake: (moduleId: string) => void
    onContinue: (moduleId: string) => void
    onClear: (moduleId: string) => void
}

export function PreviousAttempts({ 
    attempts, 
    modules, 
    onRetake, 
    onContinue, 
    onClear
}: PreviousAttemptsProps) {
    const [showAll, setShowAll] = useState(false)

    if (attempts.length === 0) {
        return null
    }

    const displayedAttempts = showAll ? attempts : attempts.slice(0, 3)
    const hasMore = attempts.length > 3

    const getStatusIcon = (status: PreviousAttempt['status']) => {
        switch (status) {
            case 'in-progress':
                return <Clock className="w-4 h-4 text-blue-500" />
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'submitted':
                return <CheckCircle className="w-4 h-4 text-purple-500" />
            default:
                return <Clock className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusText = (status: PreviousAttempt['status']) => {
        switch (status) {
            case 'in-progress':
                return 'In Progress'
            case 'completed':
                return 'Completed'
            case 'submitted':
                return 'Submitted'
            default:
                return 'Unknown'
        }
    }

    const getStatusColor = (status: PreviousAttempt['status']) => {
        switch (status) {
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            case 'submitted':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        
        if (diffInHours < 1) {
            return 'Just now'
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays}d ago`
        }
    }

    const getModuleInfo = (moduleId: string) => {
        return modules.find(module => module.id === moduleId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Previous Attempts
                </h2>
                {hasMore && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show Less' : `Show All (${attempts.length})`}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedAttempts.map((attempt, index) => {
                    const moduleInfo = getModuleInfo(attempt.moduleId)
                    if (!moduleInfo) return null

                    return (
                        <motion.div
                            key={`${attempt.moduleId}-${attempt.lastUpdated}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {moduleInfo.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                            {moduleInfo.role}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(attempt.status)}`}>
                                            {getStatusIcon(attempt.status)}
                                            {getStatusText(attempt.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Progress</span>
                                    <span>{attempt.answeredQuestions}/{attempt.questionsCount} questions</span>
                                </div>
                                
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${(attempt.answeredQuestions / attempt.questionsCount) * 100}%` 
                                        }}
                                    />
                                </div>

                                {attempt.status === 'in-progress' && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span>Current: Question {attempt.currentQuestionIndex + 1}</span>
                                    </div>
                                )}

                                {attempt.status === 'submitted' && attempt.score !== undefined && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span>Score: {attempt.score}%</span>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    Last updated: {formatDate(attempt.lastUpdated)}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {attempt.status === 'in-progress' ? (
                                    <Button
                                        onClick={() => onContinue(attempt.moduleId)}
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => onRetake(attempt.moduleId)}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Retake
                                    </Button>
                                )}

                                <Button
                                    onClick={() => onClear(attempt.moduleId)}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}