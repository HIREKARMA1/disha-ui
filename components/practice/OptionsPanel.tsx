"use client"

import { useState } from 'react'
import { Question } from '@/types/practice'
import { Flag, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OptionsPanelProps {
    question: Question
    answer: string[]
    isFlagged: boolean
    onAnswerChange: (answer: string[]) => void
    onFlagToggle: () => void
}

export function OptionsPanel({
    question,
    answer,
    isFlagged,
    onAnswerChange,
    onFlagToggle
}: OptionsPanelProps) {
    const [localAnswer, setLocalAnswer] = useState<string[]>(answer)

    const handleOptionSelect = (optionId: string) => {
        let newAnswer: string[]
        
        if (question.type === 'mcq_single') {
            // Single choice - replace current selection
            newAnswer = [optionId]
        } else if (question.type === 'mcq_multi') {
            // Multiple choice - toggle selection
            if (localAnswer.includes(optionId)) {
                newAnswer = localAnswer.filter(id => id !== optionId)
            } else {
                newAnswer = [...localAnswer, optionId]
            }
        } else {
            // For descriptive and coding questions, this shouldn't be called
            return
        }
        
        setLocalAnswer(newAnswer)
        onAnswerChange(newAnswer)
    }

    const handleTextChange = (text: string) => {
        const newAnswer = text ? [text] : []
        setLocalAnswer(newAnswer)
        onAnswerChange(newAnswer)
    }

    const isOptionSelected = (optionId: string) => {
        return localAnswer.includes(optionId)
    }

    return (
        <div className="space-y-4">
            {/* Flag for Review */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <Button
                    onClick={onFlagToggle}
                    variant={isFlagged ? "default" : "outline"}
                    size="sm"
                    className={`w-full ${isFlagged 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    }`}
                >
                    <Flag className="w-4 h-4 mr-2" />
                    {isFlagged ? 'Flagged for Review' : 'Mark for Review'}
                </Button>
            </div>

            {/* Answer Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Your Answer
                </h3>

                {question.type === 'mcq_single' && question.options && (
                    <div className="space-y-3">
                        {question.options.map((option) => (
                            <label
                                key={option.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.id}
                                    checked={isOptionSelected(option.id)}
                                    onChange={() => handleOptionSelect(option.id)}
                                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {option.text}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {question.type === 'mcq_multi' && question.options && (
                    <div className="space-y-3">
                        {question.options.map((option) => (
                            <label
                                key={option.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                                <div className="mt-1">
                                    {isOptionSelected(option.id) ? (
                                        <CheckSquare className="w-4 h-4 text-primary-600" />
                                    ) : (
                                        <Square className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {option.text}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {(question.type === 'descriptive' || question.type === 'coding') && (
                    <div>
                        <textarea
                            value={localAnswer[0] || ''}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder={
                                question.type === 'coding' 
                                    ? 'Write your code solution here...'
                                    : 'Write your answer here...'
                            }
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                        {question.type === 'coding' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                You can write code in any programming language. Make sure to include proper syntax and comments.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Answer Status */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        Status:
                    </span>
                    <span className={`font-medium ${
                        localAnswer.length > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                    }`}>
                        {localAnswer.length > 0 ? 'Answered' : 'Not Answered'}
                    </span>
                </div>
            </div>
        </div>
    )
}
