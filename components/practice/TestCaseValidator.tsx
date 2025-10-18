"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Eye, EyeOff, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCodingValidation } from '@/hooks/useCodingValidation'

interface TestCaseValidatorProps {
    questionId: string
    code: string
    language: string
    onValidationComplete?: (isValid: boolean, testResults: any[]) => void
}

export function TestCaseValidator({ 
    questionId, 
    code, 
    language, 
    onValidationComplete 
}: TestCaseValidatorProps) {
    const { isValidating, validationResult, error, validateCode, clearValidation } = useCodingValidation()
    const [showHiddenTests, setShowHiddenTests] = useState(false)

    const handleValidate = async () => {
        try {
            const result = await validateCode(questionId, code, language)
            onValidationComplete?.(result.valid, result.test_results)
        } catch (err) {
            console.error('Validation failed:', err)
        }
    }

    const toggleHiddenTests = () => {
        setShowHiddenTests(!showHiddenTests)
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Validation Error</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <Button
                    onClick={clearValidation}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                >
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Validation Button */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleValidate}
                    disabled={isValidating || !code.trim()}
                    className="flex items-center gap-2"
                >
                    {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Play className="w-4 h-4" />
                    )}
                    {isValidating ? 'Validating...' : 'Run Test Cases'}
                </Button>

                {validationResult && (
                    <Button
                        onClick={clearValidation}
                        variant="outline"
                        size="sm"
                    >
                        Clear Results
                    </Button>
                )}
            </div>

            {/* Validation Results */}
            <AnimatePresence>
                {validationResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        {/* Summary */}
                        <div className={`p-4 rounded-lg border ${
                            validationResult.valid 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {validationResult.valid ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                )}
                                <span className={`font-medium ${
                                    validationResult.valid 
                                        ? 'text-green-800 dark:text-green-200' 
                                        : 'text-yellow-800 dark:text-yellow-200'
                                }`}>
                                    {validationResult.message}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {validationResult.passed_tests} out of {validationResult.total_tests} test cases passed
                            </div>
                        </div>

                        {/* Test Case Results */}
                        {validationResult.test_results.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Test Case Results
                                    </h4>
                                    {validationResult.test_results.some(t => t.is_hidden) && (
                                        <Button
                                            onClick={toggleHiddenTests}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1"
                                        >
                                            {showHiddenTests ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                            {showHiddenTests ? 'Hide' : 'Show'} Hidden Tests
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {validationResult.test_results.map((test, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-3 rounded-lg border ${
                                                test.passed 
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {test.passed ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    )}
                                                    <span className="font-medium text-sm">
                                                        Test Case {test.test_case_id}
                                                    </span>
                                                    {test.is_hidden && (
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                                            Hidden
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {test.points} point{test.points !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                                                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
                                                        {test.is_hidden && !showHiddenTests ? 'Hidden' : test.input}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span>
                                                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
                                                        {test.is_hidden && !showHiddenTests ? 'Hidden' : test.expected_output}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Actual:</span>
                                                    <div className={`mt-1 p-2 rounded font-mono text-xs ${
                                                        test.passed 
                                                            ? 'bg-green-100 dark:bg-green-900/30' 
                                                            : 'bg-red-100 dark:bg-red-900/30'
                                                    }`}>
                                                        {test.is_hidden && !showHiddenTests ? 'Hidden' : test.actual_output}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
