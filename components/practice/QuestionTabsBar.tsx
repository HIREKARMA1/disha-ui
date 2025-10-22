"use client"

import { Question } from '@/types/practice'
import { CheckCircle, Circle, Flag } from 'lucide-react'

interface QuestionTabsBarProps {
    questions: Question[]
    currentIndex: number
    answers: Record<string, string[]>
    flaggedQuestions: Set<string>
    onQuestionSelect: (index: number) => void
}

export function QuestionTabsBar({
    questions,
    currentIndex,
    answers,
    flaggedQuestions,
    onQuestionSelect
}: QuestionTabsBarProps) {
    const getQuestionStatus = (questionId: string, index: number) => {
        if (index === currentIndex) return 'current'
        if (flaggedQuestions.has(questionId)) return 'flagged'
        if (answers[questionId] && answers[questionId].length > 0) return 'answered'
        return 'unanswered'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'current':
                return 'bg-primary-500 text-white border-primary-500'
            case 'answered':
                return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
            case 'flagged':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700'
            default:
                return 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'answered':
                return <CheckCircle className="w-3 h-3" />
            case 'flagged':
                return <Flag className="w-3 h-3" />
            default:
                return <Circle className="w-3 h-3" />
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Questions
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                        <span>Current</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full"></div>
                        <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-full"></div>
                        <span>Flagged</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {questions.map((question, index) => {
                    const status = getQuestionStatus(question.id, index)
                    const isCurrent = index === currentIndex
                    
                    return (
                        <button
                            key={question.id}
                            onClick={() => onQuestionSelect(index)}
                            className={`
                                flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                                ${getStatusColor(status)}
                                ${isCurrent ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}
                                hover:scale-105 active:scale-95
                            `}
                        >
                            {getStatusIcon(status)}
                            <span>{index + 1}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
