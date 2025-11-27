"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Download, Eye, CheckCircle, XCircle, Users, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule, StudentAttempt, Question } from '@/types/practice'
import { useUniversityModuleAttempts } from '@/hooks/useUniversityModuleAttempts'
import { useAdminQuestions } from '@/hooks/useUniversityPractice'

interface UniversityAttemptViewerProps {
    module: PracticeModule
    onBack: () => void
}

export function UniversityAttemptViewer({ module, onBack }: UniversityAttemptViewerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)

    // Use real API calls to fetch attempts
    const { data: attempts, isLoading, error, refetch } = useUniversityModuleAttempts(module.id)
    
    // Fetch all questions for the module
    const { data: allQuestions, isLoading: questionsLoading } = useAdminQuestions(module.id)
    
    console.log('📊 UniversityAttemptViewer - Module:', module.id, 'Attempts:', attempts)

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

    const handleExportCSV = () => {
        if (!attempts || attempts.length === 0) {
            alert('No data to export')
            return
        }

        if (!allQuestions || allQuestions.length === 0) {
            alert('Questions not loaded yet')
            return
        }

        // CSV Headers - summary only, no individual questions
        const headers = [
            'Student Name',
            'Student ID',
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
                attempt.student_id || 'N/A',
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
        link.setAttribute('download', `${module.title.replace(/[^a-z0-9]/gi, '_')}_attempts_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage practice tests, questions, and view student attempts ✨
                            </p>
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
                        Question Results ({allQuestions?.length || 0} total questions)
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
                                            <div className="flex-shrink-0 mt-1">
                                                {!isAttempted ? (
                                                    <HelpCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                ) : result.is_correct ? (
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
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1" dangerouslySetInnerHTML={{ __html: question.statement }} />
                                                    </div>
                                                )}
                                                
                                                {isAttempted && (
                                                    <>
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
                            Student Attempts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {module.title}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    disabled={!attempts || attempts.length === 0}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by student name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Attempts Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
        </div>
    )
}
