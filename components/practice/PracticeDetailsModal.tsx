"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Users, Brain, Target, BookOpen, Shield, GraduationCap, Calendar, Tag, CheckCircle, Play, Eye } from 'lucide-react'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'

interface PracticeDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    module: PracticeModule | null
    onStartPractice: () => void
    onViewResults?: () => void
    isSubmitted?: boolean
    result?: SubmitAttemptResponse
}

export function PracticeDetailsModal({
    isOpen,
    onClose,
    module,
    onStartPractice,
    onViewResults,
    isSubmitted = false,
    result
}: PracticeDetailsModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!module || !mounted) return null

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    const getCreatorIcon = (creatorType?: string) => {
        if (creatorType === 'admin') {
            return <Shield className="w-4 h-4" />
        }
        return <GraduationCap className="w-4 h-4" />
    }

    const getCreatorLabel = (creatorType?: string) => {
        if (creatorType === 'admin') {
            return 'Admin Practice Test'
        }
        return 'University Practice Test'
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop - No Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />

                    {/* Enhanced Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {module.title}
                                        </h2>
                                        {module.difficulty && (
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(module.difficulty)}`}>
                                                {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        {getCreatorIcon(module.creator_type)}
                                        <span>{getCreatorLabel(module.creator_type)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[calc(90vh-250px)] overflow-y-auto">
                            <div className="p-6">
                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        Description
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {module.description || 'Test your skills with this practice assessment and improve your performance.'}
                                    </p>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                                            <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                                                {formatDuration(module.duration_seconds)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Questions</p>
                                            <p className="text-base font-bold text-green-600 dark:text-green-400">
                                                {module.questions_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Role</p>
                                            <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                                                {module.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                                            <Brain className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                            <p className="text-base font-bold text-orange-600 dark:text-orange-400">
                                                {isSubmitted ? 'Completed' : 'Available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-4 mb-6">
                                    {module.category && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Category:</span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {module.tags && module.tags.length > 0 && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {module.tags.slice(0, 5).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {module.tags.length > 5 && (
                                                    <span className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                                                        +{module.tags.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Result Section (if submitted) - COMMENTED OUT */}
                                {/* {isSubmitted && result && (
                                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                        <h4 className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Your Results
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {result.score_percent}%
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300">Score</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {result.question_results?.filter(q => (q as any).is_correct ?? (q as any).correct)?.length}/{result.question_results?.length}
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300">Correct</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {result.time_taken_seconds}s
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300">Time</p>
                                            </div>
                                        </div>
                                    </div>
                                )} */}

                                {/* Instructions */}
                                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Test Instructions
                                    </h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">•</span>
                                            <span>Read each question carefully before selecting your answer</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">•</span>
                                            <span>You can navigate between questions using the navigation buttons</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">•</span>
                                            <span>Review all your answers before submitting the test</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 dark:text-blue-400">•</span>
                                            <span>Timer will start automatically when you begin the test</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                >
                                    Close
                                </Button>
                                {isSubmitted && result && onViewResults ? (
                                    <>
                                        {/* <Button
                                            onClick={() => {
                                                onViewResults()
                                                onClose()
                                            }}
                                            className="flex-1 py-3 text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Results
                                        </Button> */}
                                        {/* <Button
                                            onClick={() => {
                                                onStartPractice()
                                                onClose()
                                            }}
                                            className="flex-1 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Retake
                                        </Button> */}
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            onStartPractice()
                                            onClose()
                                        }}
                                        className="flex-1 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Practice Test
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
}