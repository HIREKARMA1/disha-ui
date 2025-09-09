"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Flag, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { PracticeModule, Question, ExamSession, QuestionAnswer } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { QuestionTabsBar } from './QuestionTabsBar'
import { QuestionPanel } from './QuestionPanel'
import { OptionsPanel } from './OptionsPanel'
import { ExamTimer } from './ExamTimer'
import { usePracticeQuestions } from '@/hooks/usePractice'
import { useExamSession } from '@/hooks/useExamSession'
import { toast } from 'react-hot-toast'

interface PracticeExamProps {
    module: PracticeModule
    onComplete: (result: any) => void
    onBack: () => void
    onProgressUpdate?: (currentQuestionIndex: number, answeredQuestions: number) => void
    startFresh?: boolean
}

export function PracticeExam({ module, onComplete, onBack, onProgressUpdate, startFresh = false }: PracticeExamProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [showConfirmExit, setShowConfirmExit] = useState(false)
    
    const { data: questions, isLoading } = usePracticeQuestions(module.id)
    const { session, updateAnswer, updateTimeSpent, toggleFlag, submitExam, setSession, forceFreshSession, saveToBackend } = useExamSession(module.id, startFresh)

    const currentQuestion = questions?.[currentQuestionIndex]
    const totalQuestions = questions?.length || 0

    // Note: Fresh session is now handled automatically by useExamSession hook

    // Restore current question index from session when session loads
    useEffect(() => {
        if (session && session.currentQuestionIndex !== undefined) {
            setCurrentQuestionIndex(session.currentQuestionIndex)
        }
    }, [session?.currentQuestionIndex])

    // Track progress and notify parent component
    useEffect(() => {
        if (onProgressUpdate && questions) {
            const answeredQuestions = Object.keys(session?.answers || {}).length
            onProgressUpdate(currentQuestionIndex, answeredQuestions)
        }
    }, [currentQuestionIndex, session?.answers, onProgressUpdate, questions])

    // Show restoration notification only once when session is first loaded with answers
    useEffect(() => {
        if (session && Object.keys(session.answers).length > 0) {
            const hasBeenNotified = sessionStorage.getItem(`notified_${module.id}`)
            if (!hasBeenNotified) {
                toast.success('Session restored! Your progress has been saved.')
                sessionStorage.setItem(`notified_${module.id}`, 'true')
            }
        }
    }, [session?.answers, module.id])

    const handleNext = useCallback(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            const newIndex = currentQuestionIndex + 1
            setCurrentQuestionIndex(newIndex)
            // Update session with new current question index
            if (session) {
                setSession(prev => prev ? { ...prev, currentQuestionIndex: newIndex } : null)
            }
        }
    }, [currentQuestionIndex, totalQuestions, session, setSession])

    const handlePrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            const newIndex = currentQuestionIndex - 1
            setCurrentQuestionIndex(newIndex)
            // Update session with new current question index
            if (session) {
                setSession(prev => prev ? { ...prev, currentQuestionIndex: newIndex } : null)
            }
        }
    }, [currentQuestionIndex, session, setSession])

    const handleQuestionSelect = useCallback((index: number) => {
        setCurrentQuestionIndex(index)
        // Update session with new current question index
        if (session) {
            setSession(prev => prev ? { ...prev, currentQuestionIndex: index } : null)
        }
    }, [session, setSession])

    // Auto-save answers every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (session && !session.isSubmitted) {
                // Auto-save is handled by the useExamSession hook
                console.log('Auto-saving exam progress...')
                // Only show toast if there are actual answers to save
                const hasAnswers = Object.keys(session.answers).length > 0
                if (hasAnswers) {
                    toast.success('Progress auto-saved!', { duration: 2000 })
                }
            }
        }, 10000)

        return () => clearInterval(interval)
    }, [session?.answers, session?.isSubmitted])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return // Don't handle keyboard shortcuts when typing
            }

            switch (e.key.toLowerCase()) {
                case 'n':
                    handleNext()
                    break
                case 'p':
                    handlePrevious()
                    break
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    const questionNum = parseInt(e.key) - 1
                    if (questionNum < totalQuestions) {
                        handleQuestionSelect(questionNum)
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [handleNext, handlePrevious, handleQuestionSelect, totalQuestions])

    const handleAnswerChange = useCallback((answer: string[]) => {
        if (currentQuestion) {
            updateAnswer(currentQuestion.id, answer)
        }
    }, [currentQuestion, updateAnswer])

    const handleTimeSpent = useCallback((timeSpent: number) => {
        if (currentQuestion) {
            updateTimeSpent(currentQuestion.id, timeSpent)
        }
    }, [currentQuestion, updateTimeSpent])

    const handleFlagToggle = useCallback(() => {
        if (currentQuestion) {
            toggleFlag(currentQuestion.id)
        }
    }, [currentQuestion, toggleFlag])

    const handleSubmit = async () => {
        if (!questions || !session) return

        try {
            const result = await submitExam()
            // Session will be automatically cleared by the useExamSession hook
            onComplete(result)
        } catch (error) {
            toast.error('Failed to submit exam. Please try again.')
            console.error('Submit error:', error)
        }
    }

    const handleExit = () => {
        if (session && Object.keys(session.answers).length > 0) {
            setShowConfirmExit(true)
        } else {
            onBack()
        }
    }

    const confirmExit = async () => {
        // Save progress before exiting
        if (saveToBackend) {
            await saveToBackend()
        }
        setShowConfirmExit(false)
        onBack()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                    No Questions Available
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">
                    This practice module doesn't have any questions yet.
                </p>
                <Button onClick={onBack} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Practice
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleExit}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {module.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                    </div>
                </div>
                <ExamTimer
                    duration={module.duration_seconds}
                    moduleId={module.id}
                    onTimeUp={handleSubmit}
                />
            </div>

            {/* Question Tabs */}
            <QuestionTabsBar
                questions={questions}
                currentIndex={currentQuestionIndex}
                answers={session?.answers || {}}
                flaggedQuestions={session?.flaggedQuestions || new Set()}
                onQuestionSelect={handleQuestionSelect}
            />

            {/* Main Content */}
            <div className={`grid gap-8 ${currentQuestion?.type === 'coding' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
                {/* Question Panel - Full width for coding, 2/3 width for others */}
                <div className={currentQuestion?.type === 'coding' ? 'col-span-1' : 'lg:col-span-2'}>
                    <QuestionPanel
                        question={currentQuestion!}
                        questionNumber={currentQuestionIndex + 1}
                        onTimeSpent={handleTimeSpent}
                        answer={session?.answers[currentQuestion?.id || ''] || []}
                        onAnswerChange={handleAnswerChange}
                        isFlagged={session?.flaggedQuestions.has(currentQuestion?.id || '') || false}
                        onFlagToggle={handleFlagToggle}
                    />
                </div>

                {/* Right Column - Options Panel (only for non-coding questions) */}
                {currentQuestion?.type !== 'coding' && (
                    <div className="lg:col-span-1">
                        <OptionsPanel
                            question={currentQuestion!}
                            answer={session?.answers[currentQuestion?.id || ''] || []}
                            onAnswerChange={handleAnswerChange}
                        />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Use keyboard: N (Next), P (Previous), 1-9 (Jump to question)
                    </span>
                </div>

                {currentQuestionIndex === totalQuestions - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                        Submit Exam
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>

            {/* Exit Confirmation Modal */}
            <AnimatePresence>
                {showConfirmExit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowConfirmExit(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Exit Practice Test?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Your progress will be saved and you can continue later. Are you sure you want to exit?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    onClick={() => setShowConfirmExit(false)}
                                    variant="outline"
                                >
                                    Continue Test
                                </Button>
                                <Button
                                    onClick={confirmExit}
                                    variant="destructive"
                                >
                                    Exit Test
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}