"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule, StudentAttempt } from '@/types/practice'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface AdminAttemptViewerProps {
    module: PracticeModule
    onBack: () => void
}

export function AdminAttemptViewer({ module, onBack }: AdminAttemptViewerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)
    const [attempts, setAttempts] = useState<StudentAttempt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Fetch attempts from API
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                setIsLoading(true)
                const attemptsData = await apiClient.adminGetAttempts({ moduleId: module.id })
                console.log('Fetched attempts data:', attemptsData)
                setAttempts(attemptsData)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch attempts'))
                toast.error('Failed to load student attempts')
            } finally {
                setIsLoading(false)
            }
        }

        fetchAttempts()
    }, [module.id])

    // Fetch detailed attempt data
    const fetchAttemptDetails = async (attemptId: string) => {
        try {
            console.log('Fetching attempt details for ID:', attemptId)
            if (!attemptId || attemptId === 'undefined') {
                toast.error('Invalid attempt ID')
                return
            }
            setIsLoadingDetails(true)
            const details = await apiClient.adminGetAttemptDetails(attemptId)
            setSelectedAttempt(details)
        } catch (err: any) {
            console.error('Details error:', err)
            const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to load attempt details'
            toast.error(`Failed to load attempt details: ${errorMessage}`)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const filteredAttempts = attempts.filter(attempt =>
        (attempt.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (attempt.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}m ${remainingSeconds}s`
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400'
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
        return 'bg-red-100 dark:bg-red-900/20'
    }

    const handleExportAttempts = async () => {
        try {
            const blob = await apiClient.adminExportAttempts(module.id)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `practice-attempts-${module.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Attempts exported successfully')
        } catch (err) {
            toast.error('Failed to export attempts')
            console.error('Export error:', err)
        }
    }

    if (selectedAttempt) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setSelectedAttempt(null)}
                            variant="outline"
                            size="sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Attempts
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Attempt Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {selectedAttempt.student_name || 'Unknown Student'} - {selectedAttempt.module_title}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setSelectedAttempt(null)}
                        variant="outline"
                        size="sm"
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`${getScoreBgColor(selectedAttempt.score_percent)} rounded-xl border border-gray-200 dark:border-gray-700 p-6`}>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Score</p>
                            <p className={`text-3xl font-bold ${getScoreColor(selectedAttempt.score_percent)}`}>
                                {selectedAttempt.score_percent.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Taken</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatTime(selectedAttempt.time_taken_seconds)}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Started</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatDate(selectedAttempt.started_at)}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedAttempt.ended_at ? formatDate(selectedAttempt.ended_at) : 'In Progress'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detailed Answer Review */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Detailed Answer Review
                    </h3>
                    <div className="space-y-6">
                        {isLoadingDetails ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading detailed review...</p>
                            </div>
                        ) : selectedAttempt.answer_review?.length > 0 ? (
                            selectedAttempt.answer_review.map((review, index) => (
                                <div
                                    key={review.question_id}
                                    className={`p-6 rounded-xl border-2 ${
                                        review.is_correct
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {review.is_correct ? (
                                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            {/* Question Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Question {index + 1}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    review.is_correct
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                    {review.is_correct ? 'Correct' : 'Incorrect'}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    Time: {review.time_spent}s
                                                </span>
                                            </div>

                                            {/* Question Statement */}
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Question Statement:
                                                </h4>
                                                <p className="text-gray-900 dark:text-white">
                                                    {review.question_statement}
                                                </p>
                                            </div>

                                            {/* Question Options (for MCQ) */}
                                            {review.question_type.startsWith('mcq') && review.question_options?.length > 0 && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                        Available Options:
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {review.question_options.map((option, optIndex) => (
                                                            <div key={optIndex} className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                                                                    {String.fromCharCode(65 + optIndex)}.
                                                                </span>
                                                                <span className="text-sm text-gray-900 dark:text-white">
                                                                    {option.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Student Answer */}
                                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Student Answer:
                                                </h4>
                                                <div className="text-gray-900 dark:text-white">
                                                    {Array.isArray(review.user_answer) ? (
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {review.user_answer.map((answer, idx) => (
                                                                <li key={idx}>{answer}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{String(review.user_answer)}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Correct Answer */}
                                            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Correct Answer:
                                                </h4>
                                                <div className="text-gray-900 dark:text-white">
                                                    {Array.isArray(review.correct_answer) ? (
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {review.correct_answer.map((answer, idx) => (
                                                                <li key={idx}>{answer}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{String(review.correct_answer)}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            {review.explanation && (
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Explanation:
                                                    </h4>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {review.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : selectedAttempt.question_results?.length > 0 ? (
                            selectedAttempt.question_results.map((result, index) => {
                                const answer = selectedAttempt.answers?.find(a => a.question_id === result.question_id)
                                return (
                                    <div
                                        key={result.question_id}
                                        className={`p-4 rounded-lg border ${
                                            result.is_correct
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {result.is_correct ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Question {index + 1}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        result.is_correct
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                        {result.is_correct ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Time: {answer?.time_spent || 0}s
                                                    </span>
                                                </div>
                                                
                                                <div className="mb-2">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Student Answer:
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                        {Array.isArray(answer?.answer) ? answer.answer.join(', ') : (answer?.answer || 'No answer')}
                                                    </p>
                                                </div>

                                                {result.explanation && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Explanation:
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {result.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>No detailed review available for this attempt.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {module.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Student Attempts ({attempts.length})
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleExportAttempts}
                        variant="outline"
                        size="sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by student name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Attempts Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Loading attempts...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 dark:text-red-400">{error.message}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                        >
                            Retry
                        </Button>
                    </div>
                ) : filteredAttempts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No attempts match your search.' : 'No attempts found for this module.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Time Taken
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Started
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAttempts.map((attempt) => (
                                    <tr key={attempt.attempt_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {attempt.student_name || 'Unknown Student'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    ID: {attempt.student_id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${getScoreColor(attempt.score_percent)}`}>
                                                {attempt.score_percent.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatTime(attempt.time_taken_seconds)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatDate(attempt.started_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                onClick={() => fetchAttemptDetails(attempt.attempt_id)}
                                                variant="outline"
                                                size="sm"
                                                disabled={isLoadingDetails}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                {isLoadingDetails ? 'Loading...' : 'View Details'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}