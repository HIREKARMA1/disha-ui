"use client"

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
    if (!module) return null

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    {/* Compact Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                                            {module.title}
                                        </h2>
                                        {module.difficulty && (
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(module.difficulty)}`}>
                                                {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        {getCreatorIcon(module.creator_type)}
                                        <span>{getCreatorLabel(module.creator_type)}</span>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={onClose}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-96 overflow-y-auto">
                            <div className="p-4">
                                {/* Description */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Description
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                        {module.description || 'Test your skills with this practice assessment and improve your performance.'}
                                    </p>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {formatDuration(module.duration_seconds)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Questions</p>
                                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                {module.questions_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Role</p>
                                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                {module.role}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                        <Brain className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                                            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {isSubmitted ? 'Completed' : 'Available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-3 mb-4">
                                    {module.category && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-gray-900 dark:text-white">Category:</span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </div>
                                    )}

                                    {module.tags && module.tags.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <Tag className="w-3 h-3 text-gray-500" />
                                                <span className="text-xs font-medium text-gray-900 dark:text-white">Tags</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {module.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {module.tags.length > 3 && (
                                                    <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                                        +{module.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Result Section (if submitted) */}
                                {isSubmitted && result && (
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
                                )}

                                {/* Instructions */}
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                        Instructions
                                    </h4>
                                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
                                        <li>• Read questions carefully</li>
                                        <li>• Navigate between questions</li>
                                        <li>• Review before submitting</li>
                                        <li>• Timer starts when you begin</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex gap-2">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 py-2 text-sm"
                                    size="sm"
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
                                            className="flex-1 py-2 text-sm bg-green-600 hover:bg-green-700 text-white"
                                            size="sm"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Results
                                        </Button> */}
                                        {/* <Button
                                            onClick={() => {
                                                onStartPractice()
                                                onClose()
                                            }}
                                            className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                                            size="sm"
                                        >
                                            <Play className="w-4 h-4 mr-1" />
                                            Retake
                                        </Button> */}
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            onStartPractice()
                                            onClose()
                                        }}
                                        className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                                        size="sm"
                                    >
                                        <Play className="w-4 h-4 mr-1" />
                                        Start
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}