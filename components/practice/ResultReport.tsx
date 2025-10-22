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
import { toast } from 'react-hot-toast'

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

    const handleEnterFullscreen = async () => {
        try {
            const elem: any = document.documentElement
            if (elem.requestFullscreen) {
                // navigationUI: 'hide' is supported by some browsers (e.g., Firefox)
                await elem.requestFullscreen({ navigationUI: 'hide' } as any)
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen()
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen()
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen()
            }

            // Verify that fullscreen actually engaged
            const becameFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement)
            if (!becameFullscreen) {
                toast.error('Fullscreen was blocked. Allow fullscreen for this site and try again.')
            }
        } catch (error) {
            console.error('Failed to enter fullscreen:', error)
            toast.error('Unable to enter fullscreen. Please click again or check browser settings.')
        }
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
                                        className={`h-2 rounded-full ${area.accuracy >= 60 ? 'bg-green-500' :
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
                    <div className="space-y-4">
                        {result.question_results.map((questionResult, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${questionResult.is_correct
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {questionResult.is_correct ? (
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${questionResult.is_correct
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                {questionResult.is_correct ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>
                                        {questionResult.explanation && (
                                            <div
                                                className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: questionResult.explanation }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-6">
                <Button
                    onClick={() => {
                        handleEnterFullscreen();
                        onBackToExam(); // start the exam after fullscreen
                    }}
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
