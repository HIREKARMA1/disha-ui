"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Download, Eye, CheckCircle, XCircle, Users, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule, StudentAttempt, Question } from '@/types/practice'
import { useModuleAttempts } from '@/hooks/useModuleAttempts'
import { useAdminQuestions } from '@/hooks/useAdminPractice'
import { toast } from 'react-hot-toast'

interface AdminAttemptViewerProps {
    isOpen: boolean
    onClose: () => void
    module: PracticeModule
}

export function AdminAttemptViewer({ isOpen, onClose, module }: AdminAttemptViewerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)

    // Use real API calls to fetch attempts
    const { data: attempts, isLoading, error, refetch } = useModuleAttempts(module.id)
    
    // Fetch all questions for the module
    const { data: allQuestions, isLoading: questionsLoading } = useAdminQuestions(module.id)
    
    console.log('📊 AdminAttemptViewer - Module:', module.id, 'Attempts:', attempts)

    const filteredAttempts = attempts?.filter(attempt =>
        attempt.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (attempt.student_email || attempt.email)?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

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

        if (!allQuestions || allQuestions.length === 0) {
            toast.error('Questions not loaded yet')
            return
        }

        // CSV Headers - summary only, no individual questions
        const headers = [
            'Student Name',
            'Student Email',
            'Score (%)',
            'Time Taken',
            'Started At',
            'Ended At',
            'Total Questions',
            'Attempted Questions',
            'Correct Answers'
        ]

        // CSV Rows
        const rows = attempts.map(attempt => {
            const correctAnswers = attempt.question_results?.filter((r: { is_correct: boolean }) => r.is_correct).length || 0
            const attemptedQuestions = attempt.question_results?.length || 0
            const totalQuestions = allQuestions.length

            return [
                attempt.student_name || 'N/A',
                (attempt.student_email || attempt.email) || 'N/A',
                attempt.score_percent.toFixed(1),
                formatTime(attempt.time_taken_seconds),
                formatDate(attempt.started_at),
                formatDate(attempt.ended_at),
                totalQuestions.toString(),
                attemptedQuestions.toString(),
                correctAnswers.toString()
            ]
        })

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', `${module.title.replace(/[^a-z0-9]/gi, '_')}_practice_attempts_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Attempts exported successfully!')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4">
                <div className="flex min-h-screen items-center justify-center">
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
                        className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-full sm:max-w-6xl max-h-[calc(100vh-1rem)] sm:max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {selectedAttempt ? (
                            // Attempt Detail View
                            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6 flex-shrink-0">
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                            Attempt Details
                                        </h2>
                                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 break-words">
                                            {selectedAttempt.student_name} - {module.title}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setSelectedAttempt(null)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Summary Cards - 2x2 on mobile, 4 cols on desktop */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
                                    <div className={`${getScoreBgColor(selectedAttempt.score_percent)} rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4`}>
                                        <div className="text-center">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">Score</p>
                                            <p className={`text-lg sm:text-2xl font-bold ${getScoreColor(selectedAttempt.score_percent)}`}>
                                                {selectedAttempt.score_percent.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                                        <div className="text-center">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">Time Taken</p>
                                            <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                                {formatTime(selectedAttempt.time_taken_seconds)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                                        <div className="text-center">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">Started</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                                                {formatDate(selectedAttempt.started_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                                        <div className="text-center">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">Completed</p>
                                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                                                {formatDate(selectedAttempt.ended_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Results - scrollable on small screens */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                        Question-by-Question Breakdown ({allQuestions?.length || 0} total questions)
                                    </h3>
                                    {questionsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {(allQuestions || []).map((question, index) => {
                                                const result = (selectedAttempt.question_results || []).find(r => r.question_id === question.id)
                                                const answer = (selectedAttempt.answers || []).find(a => a.question_id === question.id)
                                                const isAttempted = !!result
                                                
                                                return (
                                                    <div
                                                        key={question.id}
                                                        className={`p-4 rounded-lg border ${
                                                            !isAttempted
                                                                ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                                                                : result.is_correct
                                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {!isAttempted ? (
                                                                <HelpCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                                            ) : result.is_correct ? (
                                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        Question {index + 1}
                                                                    </p>
                                                                    {isAttempted ? (
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                            result.is_correct
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                        }`}>
                                                                            {result.is_correct ? 'Correct' : 'Incorrect'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                                            Not Attempted
                                                                        </span>
                                                                    )}
                                                                    {answer && (
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Time: {answer.time_spent || 0}s
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {question.statement && (
                                                                    <div className="mb-2">
                                                                        <p className="text-sm text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: question.statement }} />
                                                                    </div>
                                                                )}
                                                                
                                                                {isAttempted && (
                                                                    <>
                                                                        {answer && (
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                                                                <span className="font-medium">Student Answer:</span> {answer.answer.join(', ') || 'No answer'}
                                                                            </p>
                                                                        )}
                                                                        {result.explanation && (
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                                                                <span className="font-medium">Explanation:</span> {result.explanation}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Attempts List View
                            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
                                    <div className="min-w-0">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                            Student Attempts
                                        </h2>
                                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                                            {module.title}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            onClick={handleExportCSV}
                                            variant="outline"
                                            size="sm"
                                            disabled={!attempts || attempts.length === 0}
                                            className="w-full sm:w-auto"
                                        >
                                            <Download className="h-4 w-4 mr-2 shrink-0" />
                                            <span className="truncate">Export CSV</span>
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

                                {/* Search */}
                                <div className="mb-4 sm:mb-6 flex-shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by student name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                                            <p className="text-gray-600 dark:text-gray-400">Loading attempts...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                                        <div className="text-center">
                                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                                                Error Loading Attempts
                                            </h3>
                                            <p className="text-red-600 dark:text-red-400 mb-4">
                                                {error.message}
                                            </p>
                                            <Button
                                                onClick={() => refetch()}
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Attempts List */}
                                {!isLoading && !error && (
                                    <>
                                        {filteredAttempts.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    No Attempts Found
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {searchTerm ? 'Try adjusting your search criteria.' : 'No students have attempted this module yet.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Card layout - prominent on small screens */}
                                                <div className="md:hidden space-y-4 flex-1 min-h-0 overflow-y-auto">
                                                    {filteredAttempts.map((attempt, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => setSelectedAttempt(attempt)}
                                                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-4 cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors active:scale-[0.99]"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                                        {attempt.student_name || 'N/A'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                                                        {(attempt.student_email || attempt.email) || 'N/A'}
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                                        <span>{formatTime(attempt.time_taken_seconds)}</span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(attempt.ended_at)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <span className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-lg ${getScoreBgColor(attempt.score_percent)} ${getScoreColor(attempt.score_percent)}`}>
                                                                        {attempt.score_percent.toFixed(1)}%
                                                                    </span>
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setSelectedAttempt(attempt)
                                                                        }}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-9 w-9 p-0 shrink-0"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Table layout - desktop */}
                                                <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto flex-1 min-h-0">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                                            <tr>
                                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                                                    Student
                                                                </th>
                                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                                                    Score
                                                                </th>
                                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                                                    Time
                                                                </th>
                                                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                                                    Date
                                                                </th>
                                                                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                            {filteredAttempts.map((attempt, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                                                    onClick={() => setSelectedAttempt(attempt)}
                                                                >
                                                                    <td className="px-4 lg:px-6 py-4">
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {attempt.student_name || 'N/A'}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                                {(attempt.student_email || attempt.email) || 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 lg:px-6 py-4">
                                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBgColor(attempt.score_percent)} ${getScoreColor(attempt.score_percent)}`}>
                                                                            {attempt.score_percent.toFixed(1)}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                                                        {formatTime(attempt.time_taken_seconds)}
                                                                    </td>
                                                                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                                        {formatDate(attempt.ended_at)}
                                                                    </td>
                                                                    <td className="px-4 lg:px-6 py-4 text-right">
                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                setSelectedAttempt(attempt)
                                                                            }}
                                                                            variant="ghost"
                                                                            size="sm"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    )
}
