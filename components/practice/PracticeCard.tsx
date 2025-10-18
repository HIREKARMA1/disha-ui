"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Brain, Play, Star, CheckCircle, Eye, Shield, GraduationCap, Target, BookOpen } from 'lucide-react'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PracticeDetailsModal } from './PracticeDetailsModal'
import { toast } from 'react-hot-toast'

interface PracticeCardProps {
    module: PracticeModule
    onStart: () => void
    isSubmitted?: boolean
    result?: SubmitAttemptResponse
}



export function PracticeCard({ module, onStart, isSubmitted = false, result }: PracticeCardProps) {
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
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

    const getRoleColor = (role: string) => {
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
            'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
        ]
        const hash = role.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400'
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getCardColors = () => {
        const colorSchemes = [
            // Blue Family
            {
                bg: 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-900/15 dark:to-indigo-900/15',
                border: 'border-blue-200/60 dark:border-blue-700/60',
                hover: 'hover:shadow-blue-100/60 dark:hover:shadow-blue-900/25',
                accent: 'text-blue-600 dark:text-blue-400'
            },
            {
                bg: 'bg-gradient-to-br from-cyan-50/90 to-sky-50/90 dark:from-cyan-900/15 dark:to-sky-900/15',
                border: 'border-cyan-200/60 dark:border-cyan-700/60',
                hover: 'hover:shadow-cyan-100/60 dark:hover:shadow-cyan-900/25',
                accent: 'text-cyan-600 dark:text-cyan-400'
            },
            // Purple Family
            {
                bg: 'bg-gradient-to-br from-purple-50/90 to-violet-50/90 dark:from-purple-900/15 dark:to-violet-900/15',
                border: 'border-purple-200/60 dark:border-purple-700/60',
                hover: 'hover:shadow-purple-100/60 dark:hover:shadow-purple-900/25',
                accent: 'text-purple-600 dark:text-purple-400'
            },
            {
                bg: 'bg-gradient-to-br from-fuchsia-50/90 to-pink-50/90 dark:from-fuchsia-900/15 dark:to-pink-900/15',
                border: 'border-fuchsia-200/60 dark:border-fuchsia-700/60',
                hover: 'hover:shadow-fuchsia-100/60 dark:hover:shadow-fuchsia-900/25',
                accent: 'text-fuchsia-600 dark:text-fuchsia-400'
            },
            // Green Family
            {
                bg: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/15 dark:to-teal-900/15',
                border: 'border-emerald-200/60 dark:border-emerald-700/60',
                hover: 'hover:shadow-emerald-100/60 dark:hover:shadow-emerald-900/25',
                accent: 'text-emerald-600 dark:text-emerald-400'
            },
            {
                bg: 'bg-gradient-to-br from-green-50/90 to-lime-50/90 dark:from-green-900/15 dark:to-lime-900/15',
                border: 'border-green-200/60 dark:border-green-700/60',
                hover: 'hover:shadow-green-100/60 dark:hover:shadow-green-900/25',
                accent: 'text-green-600 dark:text-green-400'
            },
            // Orange Family
            {
                bg: 'bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-900/15 dark:to-amber-900/15',
                border: 'border-orange-200/60 dark:border-orange-700/60',
                hover: 'hover:shadow-orange-100/60 dark:hover:shadow-orange-900/25',
                accent: 'text-orange-600 dark:text-orange-400'
            },
            {
                bg: 'bg-gradient-to-br from-yellow-50/90 to-orange-50/90 dark:from-yellow-900/15 dark:to-orange-900/15',
                border: 'border-yellow-200/60 dark:border-yellow-700/60',
                hover: 'hover:shadow-yellow-100/60 dark:hover:shadow-yellow-900/25',
                accent: 'text-yellow-600 dark:text-yellow-400'
            },
            // Red Family
            {
                bg: 'bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-900/15 dark:to-rose-900/15',
                border: 'border-red-200/60 dark:border-red-700/60',
                hover: 'hover:shadow-red-100/60 dark:hover:shadow-red-900/25',
                accent: 'text-red-600 dark:text-red-400'
            },
            {
                bg: 'bg-gradient-to-br from-rose-50/90 to-pink-50/90 dark:from-rose-900/15 dark:to-pink-900/15',
                border: 'border-rose-200/60 dark:border-rose-700/60',
                hover: 'hover:shadow-rose-100/60 dark:hover:shadow-rose-900/25',
                accent: 'text-rose-600 dark:text-rose-400'
            },
            // Indigo Family
            {
                bg: 'bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-900/15 dark:to-blue-900/15',
                border: 'border-indigo-200/60 dark:border-indigo-700/60',
                hover: 'hover:shadow-indigo-100/60 dark:hover:shadow-indigo-900/25',
                accent: 'text-indigo-600 dark:text-indigo-400'
            },
            {
                bg: 'bg-gradient-to-br from-slate-50/90 to-gray-50/90 dark:from-slate-900/15 dark:to-gray-900/15',
                border: 'border-slate-200/60 dark:border-slate-700/60',
                hover: 'hover:shadow-slate-100/60 dark:hover:shadow-slate-900/25',
                accent: 'text-slate-600 dark:text-slate-400'
            }
        ]

        // Use a combination of module ID and title for better distribution
        const hash = (module.id + module.title).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        return colorSchemes[hash % colorSchemes.length]
    }

    const cardColors = getCardColors()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${cardColors.bg} rounded-xl border ${cardColors.border} ${cardColors.hover} transition-all duration-200 hover:shadow-md group flex flex-col h-full`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white group-hover:${cardColors.accent} transition-colors line-clamp-2`}>
                            {module.title}
                        </h3>
                        {/* Creator Info */}
                        {module.creator_type && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                                {module.creator_type === 'admin' ? (
                                    <Shield className="w-4 h-4" />
                                ) : (module.creator_type as string) === 'corporate' ? (
                                    <Target className="w-4 h-4" />
                                ) : (
                                    <GraduationCap className="w-4 h-4" />
                                )}
                                {module.creator_type === 'admin' ? 'Admin Practice Test' :
                                    (module.creator_type as string) === 'corporate' ? 'Corporate Practice Test' :
                                        'University Practice Test'}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {/* Difficulty Badge */}
                        {module.difficulty && (
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                getDifficultyColor(module.difficulty)
                            )}>
                                {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                            </span>
                        )}

                        {/* Score Badge for completed tests */}
                        {isSubmitted && result && (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${result.score_percent >= 80 ? 'bg-green-500 text-white' :
                                    result.score_percent >= 60 ? 'bg-orange-500 text-white' :
                                        'bg-red-500 text-white'
                                }`}>
                                {result.score_percent.toFixed(1)}% Score
                            </div>
                        )}
                    </div>
                </div>

                {/* Practice Test Meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className={`w-4 h-4 ${cardColors.accent}`} />
                        <span className="truncate">{formatDuration(module.duration_seconds)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Target className={`w-4 h-4 ${cardColors.accent}`} />
                        <span className="truncate">{module.questions_count} Questions</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <BookOpen className={`w-4 h-4 ${cardColors.accent}`} />
                        <span className="truncate">{module.role}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Brain className={`w-4 h-4 ${cardColors.accent}`} />
                        <span className="truncate">
                            {isSubmitted ? 'Completed' : 'Available'}
                        </span>
                    </div>

                    {/* Days Remaining */}
                    {module.days_remaining !== null && module.days_remaining !== undefined && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className={`w-4 h-4 ${cardColors.accent}`} />
                            <span className="truncate">
                                {module.days_remaining === 0
                                    ? 'Expires Today'
                                    : module.days_remaining === 1
                                        ? '1 Day Left'
                                        : `${module.days_remaining} Days Left`
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* Tags/Skills */}
                {module.tags && module.tags.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                            {module.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                            {module.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                                    +{module.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {module.description || 'Test your skills with this practice assessment and improve your performance.'}
                </p>

                {/* Additional Info */}
                <div className="space-y-2 mb-4 flex-1">
                    {module.category && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Brain className={`w-3 h-3 ${cardColors.accent}`} />
                            <span>{module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                    )}

                    {isSubmitted && result && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>
                                {result.question_results.filter(r => r.is_correct).length}/{result.question_results.length} correct answers
                            </span>
                        </div>
                    )}
                </div>

                {/* Status Indicators */}
                {isSubmitted && result && (
                    <div className="mb-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Practice Completed
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto pt-4">
                    <Button
                        onClick={() => setIsDetailsModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </Button>

                    <Button
                        onClick={() => {
                            if (!isSubmitted || !result) {
                                // Only trigger fullscreen when it's a new practice session
                                handleEnterFullscreen();
                            }
                            onStart();
                        }}
                        disabled={isSubmitted && !result}
                        size="sm"
                        className={cn(
                            "flex-1 flex items-center gap-2 transition-all duration-200 hover:shadow-md",
                            isSubmitted && result
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-primary-500 hover:bg-primary-600"
                        )}
                    >
                        {isSubmitted && result ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                View Results
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Start Practice
                            </>
                        )}
                    </Button>

                </div>
            </div>

            {/* Practice Details Modal */}
            <PracticeDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                module={module}
                onStartPractice={onStart}
                isSubmitted={isSubmitted}
                result={result}
            />
        </motion.div>
    )
}
