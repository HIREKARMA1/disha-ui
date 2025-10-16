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
}

// Helper to add/remove a class to body for hiding sidebar
function setSidebarHidden(hidden: boolean) {
    if (typeof document !== 'undefined') {
        if (hidden) {
            document.body.classList.add('hide-sidebar')
        } else {
            document.body.classList.remove('hide-sidebar')
        }
    }
}

// Add this style block at the top-level of the file (after imports)
const fullscreenExamStyle = `
.fullscreen-exam {
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background: #f8fafc; /* fallback, can be overridden by theme */
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding:20px;
  padding-bottom: 80px; /* Ensure space for navigation buttons */
}
@media (max-width: 1024px) {
  .fullscreen-exam {
    padding:20px;
  }
}
`;

export function PracticeExam({ module, onComplete, onBack }: PracticeExamProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [showConfirmExit, setShowConfirmExit] = useState(false)
    const [questionResults, setQuestionResults] = useState<Record<string, {
        correct: boolean
        score: number
        maxScore: number
        feedback?: string
    }>>({})
    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false)

    const { data: questions, isLoading } = usePracticeQuestions(module.id)
    const { session, updateAnswer, updateTimeSpent, toggleFlag, submitExam } = useExamSession(module.id)

    const currentQuestion = questions?.[currentQuestionIndex]
    const totalQuestions = questions?.length || 0

    // Auto-save answers every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (session && !session.isSubmitted) {
                // Auto-save is handled by the useExamSession hook
                console.log('Auto-saving exam progress...')
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [session])

    // Fullscreen logic
    useEffect(() => {
        // Enter fullscreen on mount
        const enterFullscreen = () => {
            const elem = document.documentElement
            if (elem.requestFullscreen) {
                elem.requestFullscreen()
            } else if ((elem as any).webkitRequestFullscreen) {
                (elem as any).webkitRequestFullscreen()
            } else if ((elem as any).msRequestFullscreen) {
                (elem as any).msRequestFullscreen()
            }
        }
        // Listen for fullscreen change
        const fullscreenChange = () => {
            const fs = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement
            setIsFullscreen(!!fs)
            setSidebarHidden(!!fs)
            // If exited fullscreen and exam is not submitted, submit automatically
            if (!fs && session && !session.isSubmitted) {
                toast.error("Exam submitted - Full screen mode was exited")
                handleSubmit()
            }
        }
        enterFullscreen()
        setSidebarHidden(true)
        document.addEventListener('fullscreenchange', fullscreenChange)
        document.addEventListener('webkitfullscreenchange', fullscreenChange)
        document.addEventListener('msfullscreenchange', fullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', fullscreenChange)
            document.removeEventListener('webkitfullscreenchange', fullscreenChange)
            document.removeEventListener('msfullscreenchange', fullscreenChange)
            setSidebarHidden(false)
            // Exit fullscreen if still in
            if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                } else if ((document as any).webkitExitFullscreen) {
                    (document as any).webkitExitFullscreen()
                } else if ((document as any).msExitFullscreen) {
                    (document as any).msExitFullscreen()
                }
            }
        }
    }, [])

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
                        setCurrentQuestionIndex(questionNum)
                    }
                    break
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeyPress)
            return () => window.removeEventListener('keydown', handleKeyPress)
        }
    }, [totalQuestions])

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleQuestionSelect = (index: number) => {
        setCurrentQuestionIndex(index)
    }

    const handleAnswerChange = (answer: string[]) => {
        if (currentQuestion) {
            updateAnswer(currentQuestion.id, answer)
        }
    }

    const handleTimeSpent = (timeSpent: number) => {
        if (currentQuestion) {
            updateTimeSpent(currentQuestion.id, timeSpent)
        }
    }

    const handleFlagToggle = () => {
        if (currentQuestion) {
            toggleFlag(currentQuestion.id)
        }
    }

    const handleSubmit = async () => {
        if (!questions || !session) return
        // Exit fullscreen on submit
        if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen()
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen()
            }
        }
        try {
            const result = await submitExam()
            // Process question results from the submission response
            if (result.question_results && Array.isArray(result.question_results)) {
                const resultsMap: Record<string, {
                    correct: boolean
                    score: number
                    maxScore: number
                    feedback?: string
                }> = {}
                result.question_results.forEach((qr: any) => {
                    resultsMap[qr.question_id] = {
                        correct: qr.correct || false,
                        score: qr.score || 0,
                        maxScore: qr.max_score || 1,
                        feedback: qr.feedback
                    }
                })
                setQuestionResults(resultsMap)
            }
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

    const confirmExit = () => {
        setShowConfirmExit(false)
        onBack()
    }

    // Inject style tag for fullscreen
    useEffect(() => {
        let styleTag: HTMLStyleElement | null = null;
        if (typeof document !== 'undefined') {
            styleTag = document.createElement('style');
            styleTag.innerHTML = fullscreenExamStyle;
            document.head.appendChild(styleTag);
        }
        return () => {
            if (styleTag && document.head.contains(styleTag)) {
                document.head.removeChild(styleTag);
            }
        };
    }, []);

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
            </div>
        )
    }

    return (
        <div className={`space-y-6 ${isFullscreen ? 'fullscreen-exam' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Question Panel - Smaller for coding questions */}
                <div className={`${currentQuestion?.type === 'coding' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <QuestionPanel
                        question={currentQuestion!}
                        questionNumber={currentQuestionIndex + 1}
                        onTimeSpent={handleTimeSpent}
                    />
                </div>

                {/* Options Panel - Larger for coding questions */}
                <div className={`${currentQuestion?.type === 'coding' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                    <OptionsPanel
                        key={currentQuestion?.id}   // 👈 forces reset when question changes
                        question={currentQuestion!}
                        answer={session?.answers[currentQuestion?.id || ''] || []}
                        isFlagged={session?.flaggedQuestions.has(currentQuestion?.id || '') || false}
                        onAnswerChange={handleAnswerChange}
                        onFlagToggle={handleFlagToggle}
                        isSubmitted={session?.isSubmitted || false}
                        questionResult={currentQuestion ? questionResults[currentQuestion.id] : undefined}
                    />
                </div>
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
