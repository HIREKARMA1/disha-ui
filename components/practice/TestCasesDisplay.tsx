"use client"

import { useState } from 'react'
import { TestCase } from '@/types/practice'
import { ChevronDown, ChevronRight, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TestCasesDisplayProps {
    testCases: TestCase[]
    showResults?: boolean
    results?: Array<{
        test_case_id: number
        input: string
        expected_output: string
        actual_output: string
        passed: boolean
        points: number
        is_hidden: boolean
    }>
}

export function TestCasesDisplay({ testCases, showResults = false, results = [] }: TestCasesDisplayProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [showHidden, setShowHidden] = useState(false)

    if (!testCases || testCases.length === 0) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">No test cases available</span>
                </div>
            </div>
        )
    }

    // Filter test cases based on hidden visibility
    const visibleTestCases = testCases.filter(tc => !tc.is_hidden || showHidden)
    const hiddenCount = testCases.length - visibleTestCases.length

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-0 h-auto hover:bg-transparent"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                    </Button>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Test Cases ({testCases.length})
                    </h3>
                    {hiddenCount > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({hiddenCount} hidden)
                        </span>
                    )}
                </div>
                
                {hiddenCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHidden(!showHidden)}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        {showHidden ? (
                            <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Hide Hidden
                            </>
                        ) : (
                            <>
                                <Eye className="w-3 h-3 mr-1" />
                                Show Hidden
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Test Cases List */}
            {isExpanded && (
                <div className="p-4 space-y-3">
                    {visibleTestCases.map((testCase, index) => {
                        const result = results.find(r => r.test_case_id === index + 1)
                        const isPassed = result?.passed
                        const hasResult = result !== undefined

                        return (
                            <div
                                key={testCase.id || index}
                                className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
                            >
                                {/* Test Case Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Test Case {index + 1}
                                        </span>
                                        {testCase.is_hidden && (
                                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs rounded-md">
                                                Hidden
                                            </span>
                                        )}
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-md">
                                            {testCase.points} point{testCase.points !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    {hasResult && (
                                        <div className="flex items-center gap-1">
                                            {isPassed ? (
                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            )}
                                            <span className={`text-xs font-medium ${
                                                isPassed 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {isPassed ? 'Passed' : 'Failed'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input:</span>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 font-mono text-sm">
                                        <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">
                                            {hasResult ? result.input : (testCase.input_data || '(no input)')}
                                        </pre>
                                    </div>
                                </div>

                                {/* Expected Output */}
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Output:</span>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 font-mono text-sm">
                                        <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">
                                            {hasResult ? result.expected_output : (testCase.expected_output || '(no output)')}
                                        </pre>
                                    </div>
                                </div>

                                {/* Actual Output (if available) */}
                                {hasResult && result?.actual_output !== undefined && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actual Output:</span>
                                        </div>
                                        <div className={`rounded-md p-3 font-mono text-sm ${
                                            isPassed 
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                                        }`}>
                                            <pre className={`whitespace-pre-wrap ${
                                                isPassed 
                                                    ? 'text-green-900 dark:text-green-100' 
                                                    : 'text-red-900 dark:text-red-100'
                                            }`}>
                                                {result.actual_output}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Error (if available) */}
                                {hasResult && result?.actual_output && result.actual_output.startsWith('Error:') && (
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">Error:</span>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
                                            <pre className="text-sm text-red-900 dark:text-red-100 whitespace-pre-wrap">
                                                {result.actual_output}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
