"use client"

import React, { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, Clock, Zap, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TestResult {
    test_case_id: number
    input: string
    expected_output: string
    actual_output: string
    passed: boolean
    points: number
    is_hidden: boolean
}

interface TestResultsPopupProps {
    isVisible: boolean
    onClose: () => void
    results: TestResult[]
    isRunning: boolean
    autoHideDelay?: number // in milliseconds
}

export function TestResultsPopup({ 
    isVisible, 
    onClose, 
    results, 
    isRunning,
    autoHideDelay = 5000 
}: TestResultsPopupProps) {
    const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000)

    // Auto-hide functionality
    useEffect(() => {
        if (!isVisible || isRunning) {
            setTimeLeft(autoHideDelay / 1000)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onClose()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isVisible, isRunning, autoHideDelay, onClose])

    // Reset timer when results change
    useEffect(() => {
        if (isVisible && results.length > 0) {
            setTimeLeft(autoHideDelay / 1000)
        }
    }, [results, isVisible, autoHideDelay])

    if (!isVisible) return null

    const passedTests = results.filter(r => r.passed).length
    const totalTests = results.length
    const totalPoints = results.reduce((sum, r) => sum + (r.passed ? r.points : 0), 0)
    const maxPoints = results.reduce((sum, r) => sum + r.points, 0)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Test Case Results
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isRunning ? 'Running tests...' : `${passedTests}/${totalTests} test cases passed`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Auto-hide timer */}
                        {!isRunning && timeLeft > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>Auto-hide in {Math.ceil(timeLeft)}s</span>
                            </div>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isRunning ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Running test cases...</p>
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12">
                            <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No test results available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {passedTests}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Passed
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {totalTests - passedTests}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Failed
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {totalPoints}/{maxPoints}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Points
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {Math.round((passedTests / totalTests) * 100)}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Success Rate
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Individual Test Results */}
                            <div className="space-y-3">
                                {results.map((result, index) => (
                                    <div
                                        key={result.test_case_id || index}
                                        className={`rounded-lg border p-4 ${
                                            result.passed
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Test Case {index + 1}
                                                </span>
                                                {result.is_hidden && (
                                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs rounded-md">
                                                        Hidden
                                                    </span>
                                                )}
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-md">
                                                    {result.points} point{result.points !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {result.passed ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className={`text-sm font-medium ${
                                                    result.passed 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {result.passed ? 'PASSED' : 'FAILED'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Input */}
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Input:
                                                </div>
                                                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 font-mono text-sm">
                                                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">
                                                        {result.input || '(no input)'}
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Expected Output */}
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Expected Output:
                                                </div>
                                                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 font-mono text-sm">
                                                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">
                                                        {result.expected_output || '(no output)'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actual Output */}
                                        <div className="mt-4">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Your Output:
                                            </div>
                                            <div className={`rounded-md p-3 font-mono text-sm ${
                                                result.passed 
                                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700' 
                                                    : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
                                            }`}>
                                                <pre className={`whitespace-pre-wrap ${
                                                    result.passed 
                                                        ? 'text-green-900 dark:text-green-100' 
                                                        : 'text-red-900 dark:text-red-100'
                                                }`}>
                                                    {result.actual_output || '(no output)'}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isRunning && results.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {passedTests === totalTests ? (
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                    🎉 All test cases passed! Great job!
                                </span>
                            ) : (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                    {totalTests - passedTests} test case{totalTests - passedTests !== 1 ? 's' : ''} failed. Keep trying!
                                </span>
                            )}
                        </div>
                        
                        <Button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
