"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, Users, Trophy, ArrowLeft } from 'lucide-react'
import { PracticeCard } from './PracticeCard'
import { PracticeExam } from './PracticeExam'
import { ResultReport } from './ResultReport'
import { usePracticeModules } from '@/hooks/usePractice'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'

type ViewState = 'dashboard' | 'exam' | 'result'

export function PracticeDashboard() {
    const [currentView, setCurrentView] = useState<ViewState>('dashboard')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [examResult, setExamResult] = useState<SubmitAttemptResponse | null>(null)
    
    const { data: modules, isLoading, error } = usePracticeModules()

    const handleStartExam = (module: PracticeModule) => {
        setSelectedModule(module)
        setCurrentView('exam')
    }

    const handleExamComplete = (result: SubmitAttemptResponse) => {
        setExamResult(result)
        setCurrentView('result')
    }

    const handleBackToDashboard = () => {
        setCurrentView('dashboard')
        setSelectedModule(null)
        setExamResult(null)
    }

    const handleBackToExam = () => {
        setCurrentView('exam')
        setExamResult(null)
    }

    if (currentView === 'exam' && selectedModule) {
        return (
            <PracticeExam
                module={selectedModule}
                onComplete={handleExamComplete}
                onBack={handleBackToDashboard}
            />
        )
    }

    if (currentView === 'result' && examResult) {
        return (
            <ResultReport
                result={examResult}
                module={selectedModule!}
                onBackToDashboard={handleBackToDashboard}
                onBackToExam={handleBackToExam}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary-500" />
                        Practice Module
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Test your skills with practice assessments and mock exams
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Available Tests
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modules?.length || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                            <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
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
                                Total Questions
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {modules?.reduce((sum, module) => sum + module.questions_count, 0) || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg">
                            <Clock className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                        </div>
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
                                Practice Areas
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {new Set(modules?.map(m => m.role) || []).size}
                            </p>
                        </div>
                        <div className="p-3 bg-accent-green-100 dark:bg-accent-green-900/20 rounded-lg">
                            <Trophy className="w-6 h-6 text-accent-green-600 dark:text-accent-green-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Practice Modules Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Practice Tests
                    </h2>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                            >
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                            Error Loading Practice Modules
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                            {error instanceof Error ? error.message : 'Failed to load practice modules'}
                        </p>
                    </div>
                ) : modules && modules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module, index) => (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <PracticeCard
                                    module={module}
                                    onStart={() => handleStartExam(module)}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Practice Modules Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Check back later for new practice tests and assessments.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
