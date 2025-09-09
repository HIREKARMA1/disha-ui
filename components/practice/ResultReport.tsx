"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    ArrowLeft, 
    Download, 
    Trophy, 
    Clock, 
    Target, 
    TrendingUp, 
    CheckCircle, 
    XCircle,
    Eye,
    EyeOff
} from 'lucide-react'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { PDFExport } from './PDFExport'

interface ResultReportProps {
    result: SubmitAttemptResponse
    module: PracticeModule
    onBackToDashboard: () => void
    onBackToExam: () => void
}

export function ResultReport({ 
    result, 
    module, 
    onBackToDashboard, 
    onBackToExam 
}: ResultReportProps) {
    const [showReviewMode, setShowReviewMode] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`
        }
        return `${minutes}m ${secs}s`
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

    const handleExportPDF = async () => {
        setIsExporting(true)
        try {
            await PDFExport.exportReport(result, module)
        } catch (error) {
            console.error('Failed to export PDF:', error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={onBackToDashboard}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Practice
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Exam Results
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {module.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowReviewMode(!showReviewMode)}
                        variant="outline"
                        size="sm"
                    >
                        {showReviewMode ? (
                            <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Hide Review
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4 mr-2" />
                                Review Answers
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? 'Exporting...' : 'Download Report'}
                    </Button>
                </div>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${getScoreBgColor(result.score_percent)} rounded-xl border border-gray-200 dark:border-gray-700 p-6`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Overall Score
                            </p>
                            <p className={`text-3xl font-bold ${getScoreColor(result.score_percent)}`}>
                                {result.score_percent.toFixed(1)}%
                            </p>
                        </div>
                        <Trophy className={`w-8 h-8 ${getScoreColor(result.score_percent)}`} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Time Taken
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatTime(result.time_taken_seconds)}
                            </p>
                        </div>
                        <Clock className="w-6 h-6 text-gray-500" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Role Fit Score
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.role_fit_score.toFixed(1)}%
                            </p>
                        </div>
                        <Target className="w-6 h-6 text-gray-500" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Correct Answers
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.question_results.filter(r => r.is_correct).length}/{result.question_results.length}
                            </p>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                </motion.div>
            </div>

            {/* Weak Areas */}
            {result.weak_areas && result.weak_areas.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        Areas for Improvement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.weak_areas.map((area, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {area.tag}
                                    </span>
                                    <span className={`text-sm font-bold ${getScoreColor(area.accuracy)}`}>
                                        {area.accuracy.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            area.accuracy >= 60 ? 'bg-green-500' : 
                                            area.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${area.accuracy}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Question Review */}
            {showReviewMode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Question Review
                    </h3>
                    <div className="space-y-6">
                        {result.answer_review && result.answer_review.length > 0 ? (
                            result.answer_review.map((review, index) => (
                                <div
                                    key={review.question_id}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                                >
                                    <div className="space-y-4">
                                        {/* Question Header */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                {review.is_correct ? (
                                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
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
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Time spent: {Math.floor(review.time_spent / 60)}m {review.time_spent % 60}s
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question Statement */}
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Question:
                                            </h4>
                                            <div 
                                                className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: review.question_statement }}
                                            />
                                        </div>

                                        {/* Answer Comparison */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Your Answer */}
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                                    Your Answer:
                                                </h4>
                                                <div className="text-blue-800 dark:text-blue-200">
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
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                                                    Correct Answer:
                                                </h4>
                                                <div className="text-green-800 dark:text-green-200">
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
                                        </div>

                                        {/* Explanation */}
                                        {review.explanation && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                                                    Explanation:
                                                </h4>
                                                <div 
                                                    className="text-yellow-800 dark:text-yellow-200 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: review.explanation }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No detailed answer review available for this attempt.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                    onClick={onBackToExam}
                    variant="outline"
                    size="lg"
                >
                    Retake Exam
                </Button>
                <Button
                    onClick={onBackToDashboard}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    size="lg"
                >
                    Go to Practice Dashboard
                </Button>
            </div>
        </div>
    )
}