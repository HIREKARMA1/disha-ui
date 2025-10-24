"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Filter, Download, Eye, CheckCircle, XCircle, Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule, StudentAttempt } from '@/types/practice'
import { useUniversityModuleAttempts } from '@/hooks/useUniversityModuleAttempts'

interface UniversityAttemptViewerModalProps {
    isOpen: boolean
    onClose: () => void
    module: PracticeModule
}

export function UniversityAttemptViewerModal({ isOpen, onClose, module }: UniversityAttemptViewerModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)

    // Use real API calls to fetch attempts
    const { data: attempts, isLoading, error, refetch } = useUniversityModuleAttempts(module.id)
    
    console.log('📊 UniversityAttemptViewerModal - Module:', module.id, 'Attempts:', attempts)

    const filteredAttempts = attempts?.filter(attempt =>
        attempt.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const handleExportCSV = () => {
        if (!attempts || attempts.length === 0) {
            return
        }

        // Prepare CSV data
        const headers = ['Student Name', 'Student ID', 'Score (%)', 'Time Taken', 'Started At', 'Ended At', 'Status']
        const rows = attempts.map(attempt => [
            attempt.student_name || 'N/A',
            attempt.student_id || 'N/A',
            attempt.score_percent?.toFixed(2) || '0',
            formatTimeTaken(attempt.time_taken_seconds),
            new Date(attempt.started_at).toLocaleString(),
            attempt.ended_at ? new Date(attempt.ended_at).toLocaleString() : 'In Progress',
            attempt.ended_at ? 'Completed' : 'In Progress'
        ])

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${module.title}_attempts_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const formatTimeTaken = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}m ${remainingSeconds}s`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-600" />
                                Student Attempts
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {module.title}
                            </p>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Search and Export Bar */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by student name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <Button
                                onClick={handleExportCSV}
                                variant="outline"
                                size="sm"
                                disabled={!attempts || attempts.length === 0}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export Data
                            </Button>
                            <Button
                                onClick={() => refetch()}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Loading attempts...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-gray-900 dark:text-white font-semibold mb-2">Failed to Load Attempts</p>
                                    <p className="text-gray-600 dark:text-gray-400">{error.message || 'Something went wrong'}</p>
                                </div>
                            </div>
                        ) : !attempts || attempts.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Attempts Yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400">No students have attempted this module yet.</p>
                                </div>
                            </div>
                        ) : selectedAttempt ? (
                            /* Detailed View */
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <Button
                                        onClick={() => setSelectedAttempt(null)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        ← Back to List
                                    </Button>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Viewing {selectedAttempt.student_name}'s attempt
                                    </div>
                                </div>

                                {/* Attempt Summary */}
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAttempt.student_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {selectedAttempt.score_percent.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Time Taken</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatTimeTaken(selectedAttempt.time_taken_seconds)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Started</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatDate(selectedAttempt.started_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Question-by-Question Results */}
                                {selectedAttempt.question_results && selectedAttempt.question_results.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Question Results</h3>
                                        {selectedAttempt.question_results.map((result, index) => (
                                            <div
                                                key={result.question_id}
                                                className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                            Question {index + 1}
                                                        </span>
                                                        {result.is_correct ? (
                                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Correct
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                                <XCircle className="w-4 h-4" />
                                                                Incorrect
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {result.explanation && (
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {result.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* List View */
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Attempts ({filteredAttempts.length})
                                    </h3>
                                </div>

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
                                                <motion.tr
                                                    key={attempt.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                {attempt.student_name?.charAt(0).toUpperCase() || 'S'}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {attempt.student_name || 'Unknown'}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {attempt.student_id?.slice(0, 8)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`text-sm font-semibold ${
                                                                attempt.score_percent >= 80 ? 'text-green-600 dark:text-green-400' :
                                                                attempt.score_percent >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                                'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {attempt.score_percent.toFixed(2)}%
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {formatTimeTaken(attempt.time_taken_seconds)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {formatDate(attempt.started_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <Button
                                                            onClick={() => setSelectedAttempt(attempt)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View Details
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

