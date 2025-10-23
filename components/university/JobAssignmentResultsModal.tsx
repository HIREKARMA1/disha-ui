"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Filter, Download, Eye, CheckCircle, XCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface UniversityJob {
    id: string
    title: string
    company_name?: string
}

interface JobAssignmentResultsModalProps {
    isOpen: boolean
    onClose: () => void
    job: UniversityJob
}

interface StudentAttempt {
    id: string
    student_id: string
    student_name: string
    score_percent: number
    time_taken_seconds: number
    started_at: string
    ended_at: string
    question_results?: Array<{
        question_id: string
        is_correct: boolean
        explanation?: string
    }>
    answers?: Array<{
        question_id: string
        answer: string[]
        time_spent: number
    }>
}

export function JobAssignmentResultsModal({ isOpen, onClose, job }: JobAssignmentResultsModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)
    const [attempts, setAttempts] = useState<StudentAttempt[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch assignment results for this job
    useEffect(() => {
        if (isOpen && job) {
            fetchAttempts()
        }
    }, [isOpen, job])

    const fetchAttempts = async () => {
        setIsLoading(true)
        setError(null)
        try {
            // Fetch assignment attempts for this job
            const response = await apiClient.getJobAssignmentAttempts(job.id)
            // Handle both array response and empty response
            if (Array.isArray(response)) {
                setAttempts(response)
            } else if (response && Array.isArray(response.data)) {
                setAttempts(response.data)
            } else {
                setAttempts([])
            }
        } catch (error: any) {
            console.error('Failed to fetch assignment attempts:', error)
            // Don't show error for 404 or empty results - just show empty state
            if (error.response?.status === 404 || error.message?.includes('404')) {
                setAttempts([])
                setError(null)
            } else {
                setError(error.message || 'Failed to load assignment results')
                setAttempts([])
            }
        } finally {
            setIsLoading(false)
        }
    }

    const filteredAttempts = attempts.filter(attempt =>
        attempt.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`
        }
        return `${minutes}m ${secs}s`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
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

    const handleExportCSV = () => {
        if (!attempts || attempts.length === 0) {
            toast.error('No data to export')
            return
        }

        // CSV Headers
        const headers = [
            'Student Name',
            'Student ID',
            'Score (%)',
            'Time Taken',
            'Started At',
            'Ended At',
            'Total Questions',
            'Correct Answers'
        ]

        // CSV Rows
        const rows = attempts.map(attempt => {
            const correctAnswers = attempt.question_results?.filter(r => r.is_correct).length || 0
            const totalQuestions = attempt.question_results?.length || 0
            
            return [
                attempt.student_name || 'N/A',
                attempt.student_id || 'N/A',
                attempt.score_percent.toFixed(1),
                formatTime(attempt.time_taken_seconds),
                formatDate(attempt.started_at),
                formatDate(attempt.ended_at),
                totalQuestions.toString(),
                correctAnswers.toString()
            ]
        })

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `${job.title.replace(/[^a-z0-9]/gi, '_')}_assignment_results_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Results exported successfully!')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
                    >
                        {selectedAttempt ? (
                            // Attempt Detail View
                            <div className="p-6 overflow-y-auto max-h-[90vh]">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Attempt Details
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            {selectedAttempt.student_name} - {job.title}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setSelectedAttempt(null)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className={`${getScoreBgColor(selectedAttempt.score_percent)} rounded-xl border border-gray-200 dark:border-gray-700 p-4`}>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Score
                                            </p>
                                            <p className={`text-2xl font-bold ${getScoreColor(selectedAttempt.score_percent)}`}>
                                                {selectedAttempt.score_percent.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Time Taken
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {formatTime(selectedAttempt.time_taken_seconds)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Started
                                            </p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                {formatDate(selectedAttempt.started_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                Completed
                                            </p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                {formatDate(selectedAttempt.ended_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Results */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Question Results
                                    </h3>
                                    <div className="space-y-4">
                                        {(selectedAttempt.question_results || []).map((result, index) => {
                                            const answer = (selectedAttempt.answers || []).find(a => a.question_id === result.question_id)
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
                                                                {answer && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Time: {answer.time_spent || 0}s
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="mb-2">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                    Student Answer:
                                                                </p>
                                                                <p className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                                    {answer?.answer.join(', ') || 'No answer'}
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
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // List View
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Assignment Results
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            {job.title}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleExportCSV}
                                            variant="outline"
                                            size="sm"
                                            disabled={!attempts || attempts.length === 0}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                        <Button
                                            onClick={onClose}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search by student name or ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                                            <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                                        <div className="text-center">
                                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                                                Error Loading Results
                                            </h3>
                                            <p className="text-red-600 dark:text-red-400 mb-4">
                                                {error}
                                            </p>
                                            <Button
                                                onClick={fetchAttempts}
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Results Table */}
                                {!isLoading && !error && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Attempts ({filteredAttempts.length})
                                            </h3>
                                        </div>
                                        
                                        {filteredAttempts.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                                    <Users className="w-16 h-16 mx-auto mb-4" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    No Attempts Yet
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                    {searchTerm 
                                                        ? 'No students found matching your search.'
                                                        : 'No students have attempted this assignment yet.'}
                                                </p>
                                                {!searchTerm && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                        Make sure you have created and sent a practice assignment for this job.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Student
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Score
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Time Taken
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Started
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {filteredAttempts.map((attempt) => (
                                                            <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {attempt.student_name}
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
                                                                        onClick={() => setSelectedAttempt(attempt)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        View Details
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    )
}

