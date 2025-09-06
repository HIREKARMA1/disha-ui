"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule, StudentAttempt } from '@/types/practice'

interface AdminAttemptViewerProps {
    module: PracticeModule
    onBack: () => void
}

export function AdminAttemptViewer({ module, onBack }: AdminAttemptViewerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null)

    // Mock data - replace with real API calls
    const attempts: StudentAttempt[] = [
        {
            id: 'attempt-1',
            student_id: 'student-1',
            student_name: 'John Doe',
            module_id: module.id,
            module_title: module.title,
            score_percent: 85.5,
            time_taken_seconds: 3200,
            started_at: '2024-01-15T10:00:00Z',
            ended_at: '2024-01-15T10:53:20Z',
            answers: [
                { question_id: 'q1', answer: ['a'], time_spent: 120 },
                { question_id: 'q2', answer: ['a', 'c'], time_spent: 180 },
                { question_id: 'q3', answer: ['Binary search has O(log n) time complexity...'], time_spent: 300 }
            ],
            question_results: [
                { question_id: 'q1', is_correct: true, explanation: 'Correct answer' },
                { question_id: 'q2', is_correct: true, explanation: 'Both options are correct' },
                { question_id: 'q3', is_correct: false, explanation: 'Incomplete explanation' }
            ]
        },
        {
            id: 'attempt-2',
            student_id: 'student-2',
            student_name: 'Jane Smith',
            module_id: module.id,
            module_title: module.title,
            score_percent: 72.0,
            time_taken_seconds: 2800,
            started_at: '2024-01-15T14:30:00Z',
            ended_at: '2024-01-15T15:16:40Z',
            answers: [
                { question_id: 'q1', answer: ['b'], time_spent: 90 },
                { question_id: 'q2', answer: ['a'], time_spent: 150 },
                { question_id: 'q3', answer: ['Binary search eliminates half...'], time_spent: 240 }
            ],
            question_results: [
                { question_id: 'q1', is_correct: false, explanation: 'Incorrect answer' },
                { question_id: 'q2', is_correct: true, explanation: 'Correct' },
                { question_id: 'q3', is_correct: true, explanation: 'Good explanation' }
            ]
        }
    ]

    const filteredAttempts = attempts.filter(attempt =>
        attempt.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student_id.toLowerCase().includes(searchTerm.toLowerCase())
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
                        {selectedAttempt.question_results.map((result, index) => {
                            const answer = selectedAttempt.answers.find(a => a.question_id === result.question_id)
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
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {attempt.student_name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {attempt.student_id}
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
            </div>
        </div>
    )
}
