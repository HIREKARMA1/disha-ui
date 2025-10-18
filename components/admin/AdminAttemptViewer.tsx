"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Download, Eye, CheckCircle, XCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule, StudentAttempt } from '@/types/practice'
import { useModuleAttempts } from '@/hooks/useModuleAttempts'
import { exportStudentAttemptsToCSV } from '@/utils/exportStudentAttempts'

interface AdminAttemptViewerProps {
    module: PracticeModule
    onBack: () => void
}

export function AdminAttemptViewer({ module, onBack }: AdminAttemptViewerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)

    // Use real API calls to fetch attempts
    const { data: attempts, isLoading, error, refetch } = useModuleAttempts(module.id)
    
    console.log('📊 AdminAttemptViewer - Module:', module.id, 'Attempts:', attempts)

    const filteredAttempts = attempts?.filter(attempt =>
        attempt.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    // Show loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
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
                            Student Attempts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {module.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading attempts...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-6">
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
                            Student Attempts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {module.title}
                        </p>
                    </div>
                </div>
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
            </div>
        )
    }

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

    if (selectedAttempt) {
        return (
            <div className="space-y-6">
                {/* Header */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Practice Module Management 🧠
                            </h1>
                            <div className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage practice tests, questions, and view student attempts ✨
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                    🧠 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    📚 Question Management
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    🎯 Student Analytics
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>


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
                                {selectedAttempt.student_name} - {module.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Attempt Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`${getScoreBgColor(selectedAttempt.score_percent)} rounded-xl border border-gray-200 dark:border-gray-700 p-6`}>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Score
                            </p>
                            <p className={`text-3xl font-bold ${getScoreColor(selectedAttempt.score_percent)}`}>
                                {selectedAttempt.score_percent.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Time Taken
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatTime(selectedAttempt.time_taken_seconds)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Started
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatDate(selectedAttempt.started_at)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Completed
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
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
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Time: {answer?.time_spent || 0}s
                                                </span>
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
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Student Attempts
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {module.title}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => exportStudentAttemptsToCSV(filteredAttempts, module.title)}
                    disabled={filteredAttempts.length === 0}
                    className="w-full sm:w-auto"
                >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export Data</span>
                    <span className="sm:hidden">Export</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by student name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                        />
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">
                        <Filter className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Filter</span>
                        <span className="sm:hidden">Filter</span>
                    </Button>
                </div>
            </div>

            {/* Attempts Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Attempts ({filteredAttempts.length})
                    </h2>
                </div>
                
                {filteredAttempts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <Users className="w-16 h-16 mx-auto mb-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No Attempts Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            No students have attempted this module yet.
                        </p>
                        <Button
                            onClick={() => refetch()}
                            variant="outline"
                        >
                            Refresh
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="w-1/4 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="w-1/6 px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Score
                                    </th>
                                    <th className="w-1/6 px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Time Taken
                                    </th>
                                    <th className="w-1/4 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Started
                                    </th>
                                    <th className="w-1/6 px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAttempts.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <td className="w-1/4 px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {attempt.student_name}
                                            </div>
                                        </td>
                                        <td className="w-1/6 px-2 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${getScoreColor(attempt.score_percent)}`}>
                                                {attempt.score_percent.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="w-1/6 px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className="hidden sm:inline">{formatTime(attempt.time_taken_seconds)}</span>
                                            <span className="sm:hidden text-xs">{Math.floor(attempt.time_taken_seconds / 60)}m</span>
                                        </td>
                                        <td className="w-1/4 px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="hidden sm:block">{formatDate(attempt.started_at)}</div>
                                            <div className="sm:hidden text-xs">
                                                {new Date(attempt.started_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="w-1/6 px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button
                                                onClick={() => setSelectedAttempt(attempt)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-center text-xs sm:text-sm"
                                            >
                                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                <span className="hidden sm:inline">View Details</span>
                                                <span className="sm:hidden">View</span>
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
