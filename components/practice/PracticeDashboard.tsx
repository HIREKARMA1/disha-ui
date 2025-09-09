"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, Users, Trophy, ArrowLeft, History } from 'lucide-react'
import { PracticeCard } from './PracticeCard'
import { PracticeExam } from './PracticeExam'
import { ResultReport } from './ResultReport'
import { SavedSessionCard } from './SavedSessionCard'
import { StartPracticeDialog } from './StartPracticeDialog'
import { usePracticeModules } from '@/hooks/usePractice'
import { useSavedSessions } from '@/hooks/useSavedSessions'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Button } from '@/components/ui/button'

type ViewState = 'dashboard' | 'exam' | 'result'

export function PracticeDashboard() {
    const [currentView, setCurrentView] = useState<ViewState>('dashboard')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [examResult, setExamResult] = useState<SubmitAttemptResponse | null>(null)
    const [isResuming, setIsResuming] = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(false)
    const [pendingModule, setPendingModule] = useState<PracticeModule | null>(null)
    
    const { data: modules, isLoading, error } = usePracticeModules()
    const { savedSessions, clearSession } = useSavedSessions(modules || [])

    const handleStartExam = (module: PracticeModule) => {
        // Check if there's a saved session for this module
        const savedSession = savedSessions.find(session => session.moduleId === module.id)
        
        if (savedSession) {
            // Show dialog to ask user if they want to resume or start fresh
            setPendingModule(module)
            setShowStartDialog(true)
        } else {
            // No saved session, start fresh
            startFreshExam(module)
        }
    }

    const startFreshExam = (module: PracticeModule) => {
        // Clear any existing session for this module before starting
        const storageKey = `exam_session_${module.id}`
        localStorage.removeItem(storageKey)
        localStorage.removeItem(`clear_flag_${module.id}`)
        localStorage.removeItem(`notified_${module.id}`)
        
        setIsResuming(false)
        setSelectedModule(module)
        setCurrentView('exam')
        setShowStartDialog(false)
        setPendingModule(null)
    }

    const resumeExam = (module: PracticeModule) => {
        setIsResuming(true)
        setSelectedModule(module)
        setCurrentView('exam')
        setShowStartDialog(false)
        setPendingModule(null)
    }

    const handleExamComplete = (result: SubmitAttemptResponse) => {
        setExamResult(result)
        setCurrentView('result')
    }

    const handleBackToDashboard = () => {
        setCurrentView('dashboard')
        setSelectedModule(null)
        setExamResult(null)
        setIsResuming(false)
    }

    const handleBackToExam = () => {
        setCurrentView('exam')
        setExamResult(null)
    }

    const handleResumeSession = (moduleId: string) => {
        const module = modules?.find(m => m.id === moduleId)
        if (module) {
            setIsResuming(true)
            setSelectedModule(module)
            setCurrentView('exam')
        }
    }

    const handleClearSession = (moduleId: string) => {
        clearSession(moduleId)
    }

    if (currentView === 'exam' && selectedModule) {
        return (
            <PracticeExam
                module={selectedModule}
                onComplete={handleExamComplete}
                onBack={handleBackToDashboard}
                startFresh={!isResuming}
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
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
            >
                <div className="flex items-start space-x-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Practice Module 🧠
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Test your skills with practice assessments and mock exams ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
                            >
                                🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </motion.span>
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors cursor-pointer"
                            >
                                ✓ Skill Development
                            </motion.span>
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                            >
                                🚀 Practice Tests
                            </motion.span>
                        </div>
                    </div>
                </div>
            </motion.div>

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

            {/* Saved Sessions */}
            {savedSessions.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-primary-500" />
                            Saved Sessions
                        </h2>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {savedSessions.length} incomplete session{savedSessions.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedSessions.map((session, index) => (
                            <motion.div
                                key={session.moduleId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <SavedSessionCard
                                    session={session}
                                    onResume={handleResumeSession}
                                    onClear={handleClearSession}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Start Practice Dialog */}
            {pendingModule && (
                <StartPracticeDialog
                    isOpen={showStartDialog}
                    onClose={() => {
                        setShowStartDialog(false)
                        setPendingModule(null)
                    }}
                    onStartFresh={() => startFreshExam(pendingModule)}
                    onResume={() => resumeExam(pendingModule)}
                    savedSession={savedSessions.find(session => session.moduleId === pendingModule.id) || null}
                />
            )}
        </div>
    )
}
