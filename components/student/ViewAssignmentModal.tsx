"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Clock, Target, Brain, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface PracticeModule {
    id: string
    title: string
    description?: string
    role: string
    duration_seconds: number
    difficulty?: string
    category?: string
    questions_count: number
}

interface ViewAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    jobId: string
    jobTitle: string
    isOnCampus?: boolean  // Whether this is an on-campus feature (university-created job)
}

export function ViewAssignmentModal({ isOpen, onClose, jobId, jobTitle, isOnCampus = false }: ViewAssignmentModalProps) {
    const [modules, setModules] = useState<PracticeModule[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isOpen && jobId) {
            fetchModules()
        }
    }, [isOpen, jobId])

    const fetchModules = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getPracticeModulesByJobId(jobId)
            setModules(response || [])
        } catch (error) {
            console.error('Failed to fetch practice modules:', error)
            toast.error('Failed to load assignments')
        } finally {
            setLoading(false)
        }
    }

    const handleStartTest = (moduleId: string) => {
        // Redirect to practice test page
        router.push(`/dashboard/student/practice/${moduleId}`)
        onClose()
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        return `${minutes} min${minutes !== 1 ? 's' : ''}`
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy':
                return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
            case 'medium':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
            case 'hard':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && onClose()}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {isOnCampus ? 'Exam Assignments' : 'Practice Assignments'}
                                        </h2>
                                        <p className="text-sm text-white/80">{jobTitle}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : modules.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Brain className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            No practice assignments available for this job yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Complete the following practice assignments to showcase your skills for this position.
                                        </p>
                                        
                                        {modules.map((module) => (
                                            <motion.div
                                                key={module.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {module.title}
                                                            </h3>
                                                        </div>
                                                        {module.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                {module.description}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                                <Clock className="w-4 h-4" />
                                                                <span>{formatDuration(module.duration_seconds)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                                <Target className="w-4 h-4" />
                                                                <span>{module.questions_count} Questions</span>
                                                            </div>
                                                            {module.difficulty && (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                                                                    {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Submit Assignment Button */}
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <Button
                                                        onClick={() => handleStartTest(module.id)}
                                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                                                    >
                                                        <Play className="w-4 h-4 mr-2" />
                                                        Submit Assignment
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

