"use client"

import { useState, useEffect } from 'react'
import { Question } from '@/types/practice'
import { Clock, Code, Image as ImageIcon } from 'lucide-react'

interface QuestionPanelProps {
    question: Question
    questionNumber: number
    onTimeSpent: (timeSpent: number) => void
}

export function QuestionPanel({ question, questionNumber, onTimeSpent }: QuestionPanelProps) {
    const [timeSpent, setTimeSpent] = useState(0)

    // Track time spent on this question
    useEffect(() => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            setTimeSpent(elapsed)
            onTimeSpent(elapsed)
        }, 1000)

        return () => {
            clearInterval(interval)
            const finalTime = Math.floor((Date.now() - startTime) / 1000)
            onTimeSpent(finalTime)
        }
    }, [question.id, onTimeSpent])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Question {questionNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Time: {formatTime(timeSpent)}</span>
                </div>
            </div>

            {/* Question Statement */}
            <div className="mb-6">
                <div 
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: question.statement }}
                />
            </div>

            {/* Question Type Indicator */}
            <div className="flex items-center gap-2 mb-4">
                {question.type === 'coding' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-md text-xs font-medium">
                        <Code className="w-3 h-3" />
                        Coding Question
                    </div>
                )}
                {question.type === 'descriptive' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-md text-xs font-medium">
                        <ImageIcon className="w-3 h-3" />
                        Descriptive Answer
                    </div>
                )}
                {question.type === 'mcq_single' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-md text-xs font-medium">
                        Single Choice
                    </div>
                )}
                {question.type === 'mcq_multi' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded-md text-xs font-medium">
                        Multiple Choice
                    </div>
                )}
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
