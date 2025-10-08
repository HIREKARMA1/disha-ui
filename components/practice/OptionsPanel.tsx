"use client"

import { useState, useCallback } from 'react'
import { Question } from '@/types/practice'
import { Flag, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodingIDE } from './CodingIDE'

interface TestResult {
    passed: boolean
    actualOutput?: string
    error?: string
}

interface OptionsPanelProps {
    question: Question
    answer: string[]
    isFlagged: boolean
    onAnswerChange: (answer: string[]) => void
    onFlagToggle: () => void
    testResults?: TestResult[]
    isTestRunning?: boolean
    isSubmitted?: boolean
    questionResult?: {
        correct: boolean
        score: number
        maxScore: number
        feedback?: string
    }
}

export function OptionsPanel({
    question,
    answer,
    isFlagged,
    onAnswerChange,
    onFlagToggle,
    testResults = [],
    isTestRunning = false,
    isSubmitted = false,
    questionResult
}: OptionsPanelProps) {
    const [localAnswer, setLocalAnswer] = useState<string[]>(answer)
    const [localTestResults, setLocalTestResults] = useState<TestResult[]>(testResults)
    const [localIsTestRunning, setLocalIsTestRunning] = useState<boolean>(isTestRunning)

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

    const handleTextChange = useCallback((text: string) => {
        const newAnswer = text ? [text] : []
        setLocalAnswer(newAnswer)
        onAnswerChange(newAnswer)
    }, [onAnswerChange])

    const handleCodeSubmit = useCallback((code: string, language: string) => {
        // Store both code and language
        const submissionData = JSON.stringify({ code, language })
        handleTextChange(submissionData)
    }, [handleTextChange])

    const handleTestResults = useCallback((results: TestResult[], isRunning: boolean) => {
        setLocalTestResults(results)
        setLocalIsTestRunning(isRunning)
    }, [])

    const isOptionSelected = (optionId: string) => {
        return localAnswer.includes(optionId)
    }

    return (
        <div className="space-y-4">
            {/* Flag for Review */}
            {/* Flag for Review */}
            {question.type !== 'coding' && (
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
            )}


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
                                onClick={() => handleOptionSelect(option.id)}
                            >
                                <input
                                    type="checkbox"
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

                {question.type === 'descriptive' && (
                    <div>
                        <textarea
                            value={localAnswer[0] || ''}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder="Write your answer here..."
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                    </div>
                )}

                {question.type === 'coding' && (
                    <div className="mt-4">
                        <CodingIDE
                            questionId={question.id}
                            question={question}
                            initialCode={localAnswer[0] || ''}
                            initialLanguage="python"
                            onSubmit={handleCodeSubmit}
                            onTestResults={handleTestResults}
                            className="w-full"
                        />
                    </div>
                )}
            </div>

            {/* Answer Status */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="space-y-3">
                    {/* Basic Status */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Status:
                        </span>
                        <span className={`font-medium ${localAnswer.length > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {localAnswer.length > 0 ? 'Answered' : 'Not Answered'}
                        </span>
                    </div>

                    {/* Test Case Results for Coding Questions */}
                    {question.type === 'coding' && question.test_cases && question.test_cases.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Test Cases:
                                </span>
                                {localIsTestRunning ? (
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        Testing...
                                    </span>
                                ) : localTestResults.length > 0 ? (
                                    <span className="font-medium">
                                        {localTestResults.filter(r => r.passed).length}/{localTestResults.length} Passed
                                    </span>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Not Tested
                                    </span>
                                )}
                            </div>
                            
                            {/* Test Case Results */}
                            {localTestResults.length > 0 && (
                                <div className="space-y-1">
                                    {localTestResults.map((result, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Test Case {index + 1}:
                                            </span>
                                            <span className={`font-medium ${
                                                result.passed 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {result.passed ? '✓ Passed' : '✗ Failed'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Marks Evaluation for Submitted Answers */}
                    {isSubmitted && questionResult && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Marks:
                                </span>
                                <span className={`font-medium ${
                                    questionResult.correct 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {questionResult.score}/{questionResult.maxScore}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Result:
                                </span>
                                <span className={`font-medium ${
                                    questionResult.correct 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {questionResult.correct ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                            </div>

                            {questionResult.feedback && (
                                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                    {questionResult.feedback}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
