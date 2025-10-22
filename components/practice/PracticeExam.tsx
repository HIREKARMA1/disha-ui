"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Flag, CheckCircle, Circle, ChevronLeft, ChevronRight, Monitor, Maximize2, X, User } from 'lucide-react'
import { PracticeModule, Question, ExamSession, QuestionAnswer } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { QuestionTabsBar } from './QuestionTabsBar'
import { QuestionPanel } from './QuestionPanel'
import { OptionsPanel } from './OptionsPanel'
import { ExamTimer } from './ExamTimer'
import { usePracticeQuestions } from '@/hooks/usePractice'
import { useExamSession } from '@/hooks/useExamSession'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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

// Updated style block incorporating themes from StudentProfile (gradients, backdrops, rounded cards, shadows, hover effects)
const fullscreenExamStyle = `
/* CSS Variables for theme colors - aligned with StudentProfile's primary, gradients, and dark mode */
:root {
  --exam-bg: #f8fafc; /* slate-50 similar to bg-gray-50 */
  --exam-header-bg: white; /* Changed to white */
  --exam-header-color: #4b5563; /* Changed to gray-700 for text */
  --exam-border: #e2e8f0; /* gray-200 */
  --question-footer-bg: #ffffff; /* white */
  --question-footer-border: #e5e7eb; /* gray-300 */
  --question-content-bg: #ffffff; /* white with backdrop-blur */
  --question-content-text: #1f2937; /* gray-800 */
  --option-bg: #f9fafb; /* gray-50 */
  --option-border: #d1d5db; /* gray-300 */
  --option-text: #1f2937;
  --option-hover-bg: #f3f4f6; /* gray-100 */
  --option-selected-bg: #dbeafe; /* blue-100 */
  --option-selected-border: #3b82f6; /* blue-500 */
  --button-primary-bg: linear-gradient(to right, #3b82f6, #6366f1);
  --button-primary-text: white;
  --button-secondary-bg: #f3f4f6;
  --button-secondary-text: #4b5563;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-sm */
  --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* hover:shadow-md */
  --backdrop-blur: blur(8px);
}

/* Dark mode variables - matching StudentProfile dark classes */
.dark {
  --exam-bg: #0f172a; /* slate-900 */
  --exam-header-bg: #1e293b; /* Changed to slate-800 for dark gray */
  --exam-header-color: white; /* Kept as white */
  --exam-border: #334155; /* slate-700 */
  --question-footer-bg: #1e293b; /* slate-800 */
  --question-footer-border: #334155;
  --question-content-bg: #1e293b;
  --question-content-text: #f8fafc; /* slate-50 */
  --option-bg: #1e293b;
  --option-border: #475569; /* slate-600 */
  --option-text: #f8fafc;
  --option-hover-bg: #334155;
  --option-selected-bg: #1e40af; /* blue-900 */
  --option-selected-border: #60a5fa; /* blue-400 */
  --button-primary-bg: linear-gradient(to right, #2563eb, #4f46e5);
  --button-primary-text: white;
  --button-secondary-bg: #334155;
  --button-secondary-text: #e2e8f0; /* slate-300 */
}

.fullscreen-exam {
  position: fixed !important;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  background: var(--exam-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  max-width: 100% !important;
  max-height: 100% !important;
  font-family: inherit;
}

.fullscreen-exam .exam-header {
  background: var(--exam-header-bg);
  color: var(--exam-header-color);
  border-bottom: 1px solid var(--exam-border);
  box-shadow: var(--card-shadow);
}

.fullscreen-exam .exam-content {
  flex: 1;
  display: flex;
  gap: 1rem; /* gap-4 */
  width: 100%;
  height: calc(100vh - 130px);
  overflow: hidden;
  padding: 1rem;
}

.fullscreen-exam .question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--question-content-bg);
  border-radius: 1rem; /* rounded-xl */
  border: 1px solid var(--exam-border); /* border-gray-200/50 */
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease; /* transition-all duration-300 */
}

.fullscreen-exam .question-container:hover {
  box-shadow: var(--hover-shadow);
  transform: translateY(-2px); /* hover:-translate-y-1 */
}

.fullscreen-exam .question-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem; /* p-6 */
  background: rgba(255, 255, 255, 0.8); /* bg-white/80 */
  backdrop-filter: var(--backdrop-blur); /* backdrop-blur-sm */
  color: var(--question-content-text);
}

.dark .fullscreen-exam .question-content {
  background: rgba(31, 41, 55, 0.8); /* dark:bg-gray-800/80 */
}

.fullscreen-exam .question-footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  background: var(--question-footer-bg);
  border-top: 1px solid var(--question-footer-border);
  padding: 1rem;
  box-shadow: var(--card-shadow);
}

.fullscreen-exam .question-palette {
  width: 280px;
  height: 100%;
  overflow-y: auto;
  background: var(--question-content-bg);
  border-left: 1px solid var(--exam-border);
  border-radius: 1rem;
  border: 1px solid var(--exam-border);
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
}

.fullscreen-exam .question-palette:hover {
  box-shadow: var(--hover-shadow);
}

.fullscreen-exam .option-item {
  background: var(--option-bg);
  border: 1px solid var(--option-border);
  color: var(--option-text);
  border-radius: 0.5rem; /* rounded-lg */
  transition: all 0.2s ease;
}

.fullscreen-exam .option-item:hover {
  background: var(--option-hover-bg);
  transform: translateY(-1px);
  box-shadow: var(--card-shadow);
}

.fullscreen-exam .option-item.selected {
  background: var(--option-selected-bg);
  border-color: var(--option-selected-border);
}

.fullscreen-exam button.primary {
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.fullscreen-exam button.primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: var(--hover-shadow);
}

.fullscreen-exam button.secondary {
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.fullscreen-exam button.secondary:hover {
  background: var(--option-hover-bg);
}

@media (max-width: 1024px) {
  .fullscreen-exam .exam-content {
    flex-direction: column;
    padding: 0;
    height: calc(100vh - 60px);
  }
  .fullscreen-exam .question-palette {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
}

/* Browser-specific fullscreen selectors */
:fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

:-webkit-full-screen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

:-ms-fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

/* Additional StudentProfile-inspired styles: gradients, badges, icons */
.fullscreen-exam .gradient-header {
  background: linear-gradient(to right, #3b82f6, #6366f1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.fullscreen-exam .stat-badge {
  display: inline-flex;
  items-center;
  px-3;
  py-1;
  rounded-full;
  text-sm;
  font-medium;
  background: #dbeafe; /* blue-100 */
  color: #1e40af; /* blue-800 */
  border: 1px solid #93c5fd; /* blue-300 */
}

.dark .fullscreen-exam .stat-badge {
  background: #1e3a8a/30; /* primary-900/30 */
  color: #93c5fd;
}

.fullscreen-exam .icon-circle {
  display: flex;
  items-center;
  justify-center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #3b82f6, #6366f1);
  box-shadow: var(--card-shadow);
}
`

export function PracticeExam({ module, onComplete, onBack }: PracticeExamProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [questionResults, setQuestionResults] = useState<Record<string, {
        correct: boolean
        score: number
        maxScore: number
        feedback?: string
    }>>({})
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isExitingFullscreen, setIsExitingFullscreen] = useState(false)

    const { data: questions, isLoading } = usePracticeQuestions(module.id)
    const { session, updateAnswer, updateTimeSpent, toggleFlag, submitExam } = useExamSession(module.id)
    const { user } = useAuth()
    const { profile, isLoading: profileLoading } = useStudentProfile()
    const router = useRouter()

    const currentQuestion = questions?.[currentQuestionIndex]
    const totalQuestions = questions?.length || 0

    // Get question status for the dashboard
    const getQuestionStatus = useCallback((questionId: string) => {
        if (session?.isSubmitted) return 'submitted'
        const isFlagged = session?.flaggedQuestions.has(questionId)
        const hasAnswer = !!(session?.answers[questionId] && session.answers[questionId].length > 0)
        if (isFlagged && hasAnswer) return 'marked-answered'
        if (isFlagged) return 'flagged'
        if (hasAnswer) return 'answered'
        return 'not-visited'
    }, [session])

    // Auto-save progress
    useEffect(() => {
        const interval = setInterval(() => {
            if (session && !session.isSubmitted) {
                console.log('Auto-saving exam progress...')
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [session])

    // Updated fullscreen handling logic
    useEffect(() => {
        if (!session) return;

        const fullscreenChange = async () => {
            const fs = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement
            const isNowFullscreen = !!fs;
            
            if (isNowFullscreen && !isFullscreen) {
                setIsFullscreen(true)
                setSidebarHidden(true)
                return;
            }
            
            // Only auto-submit when exiting fullscreen mode
            if (!isNowFullscreen && isFullscreen) {
                setIsFullscreen(false)
                setSidebarHidden(false)
                
                // Auto-submit only when exiting fullscreen and not already submitted
                if (session && !session.isSubmitted && !isExitingFullscreen) {
                    setIsExitingFullscreen(true)
                    toast.error("Exam submitted - Full screen mode was exited")
                    try {
                        await handleSubmitAndRedirect()
                    } catch (error) {
                        console.error("Error submitting exam:", error)
                        window.location.href = '/dashboard/student/practice'
                    }
                }
            }
        }

        document.addEventListener('fullscreenchange', fullscreenChange)
        document.addEventListener('webkitfullscreenchange', fullscreenChange)
        document.addEventListener('msfullscreenchange', fullscreenChange)
        
        return () => {
            document.removeEventListener('fullscreenchange', fullscreenChange)
            document.removeEventListener('webkitfullscreenchange', fullscreenChange)
            document.removeEventListener('msfullscreenchange', fullscreenChange)
            // Do not toggle sidebar visibility or exit fullscreen here, as this cleanup
            // runs on every dependency change and would immediately exit fullscreen.
        }
    }, [session, isFullscreen, isExitingFullscreen])

    // On component unmount only: restore sidebar and exit fullscreen if still active
    useEffect(() => {
        return () => {
            try {
                setSidebarHidden(false)
                if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen()
                    } else if ((document as any).webkitExitFullscreen) {
                        (document as any).webkitExitFullscreen()
                    } else if ((document as any).msExitFullscreen) {
                        (document as any).msExitFullscreen()
                    }
                }
            } catch (error) {
                console.error('Failed to cleanup fullscreen on unmount:', error)
            }
        }
    }, [])

    // Keyboard shortcuts (unchanged)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
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

    // Add styles to head
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

    const handleClearResponse = () => {
        if (currentQuestion) {
            updateAnswer(currentQuestion.id, [])
        }
    }

    const handleMarkForReviewAnswered = () => {
        if (!currentQuestion) return
        const qid = currentQuestion.id
        const hasAnswer = !!(session?.answers[qid] && session!.answers[qid].length > 0)
        // Ensure question is flagged; palette color will depend on whether it's answered
        if (!session?.flaggedQuestions.has(qid)) {
            toggleFlag(qid)
        }
        if (!hasAnswer) {
            toast.error('No answer selected. Marked for review.')
        }
        handleNext()
    }

    // const handleEnterFullscreen = async () => {
    //     try {
    //         const elem: any = document.documentElement
    //         if (elem.requestFullscreen) {
    //             // navigationUI: 'hide' is supported by some browsers (e.g., Firefox)
    //             await elem.requestFullscreen({ navigationUI: 'hide' } as any)
    //         } else if (elem.mozRequestFullScreen) {
    //             await elem.mozRequestFullScreen()
    //         } else if (elem.webkitRequestFullscreen) {
    //             await elem.webkitRequestFullscreen()
    //         } else if (elem.msRequestFullscreen) {
    //             await elem.msRequestFullscreen()
    //         }

    //         // Verify that fullscreen actually engaged
    //         const becameFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement)
    //         if (!becameFullscreen) {
    //             toast.error('Fullscreen was blocked. Allow fullscreen for this site and try again.')
    //         }
    //     } catch (error) {
    //         console.error('Failed to enter fullscreen:', error)
    //         toast.error('Unable to enter fullscreen. Please click again or check browser settings.')
    //     }
    // }

    const handleSubmit = async () => {
        if (!questions || !session) return
        
        // Exit fullscreen before submitting
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

    const handleSubmitAndRedirect = async () => {
        if (!session) return
        try {
            setIsExitingFullscreen(true)
            // Perform submission first to ensure results are available
            const result = await submitExam()
            if (result?.question_results && Array.isArray(result.question_results)) {
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
            // Let parent flow handle result display (same as manual submit)
            onComplete(result)
        } catch (error) {
            console.error('Auto submit error:', error)
            toast.error('Failed to finalize results. Redirecting to dashboard...')
            try {
                router.push('/dashboard/student/practice')
            } catch {
                window.location.href = '/dashboard/student/practice'
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700 rounded-xl p-6 backdrop-blur-sm">
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
        <div className="fullscreen-exam">
            {/* Header - with gradient and shadow */}
            <div className="exam-header p-6 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {module.title}
                            </h1>
                            <p className="text-sm  text-gray-900 dark:text-white">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {/* {!isFullscreen && !session?.isSubmitted && (
                            <Button
                                onClick={handleEnterFullscreen}
                                variant="outline"
                                size="lg"
                                className="hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Enter Fullscreen
                            </Button>
                        )} */}
                        
                        <ExamTimer 
                            duration={module.duration_seconds}
                            onTimeUp={handleSubmit}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="exam-content">
                {/* Left Panel - Question */}
                <div className="question-container">
                    {/* Question Header */}
                    <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Question {currentQuestionIndex + 1}</span>
                                {session?.flaggedQuestions.has(currentQuestion?.id || '') && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 text-xs font-medium border border-yellow-200/50 dark:border-yellow-700/50 backdrop-blur-sm">
                                        <Flag className="w-3 h-3" />
                                        Marked for Review
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Single Choice • Mark for Review
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="question-content">
                        <QuestionPanel
                            question={currentQuestion!}
                            questionNumber={currentQuestionIndex + 1}
                            onTimeSpent={handleTimeSpent}
                        />
                        <OptionsPanel
                            key={currentQuestion?.id}
                            question={currentQuestion!}
                            answer={session?.answers[currentQuestion?.id || ''] || []}
                            isFlagged={session?.flaggedQuestions.has(currentQuestion?.id || '') || false}
                            onAnswerChange={handleAnswerChange}
                            onFlagToggle={handleFlagToggle}
                            isSubmitted={session?.isSubmitted || false}
                            questionResult={currentQuestion ? questionResults[currentQuestion.id] : undefined}
                        />
                    </div>

                    {/* Navigation Footer */}
                    <div className="question-footer">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                    variant="outline"
                                    size="lg"
                                    className="hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                                
                                {/* Removed standalone Mark for Review button */}

                                <Button
                                    onClick={handleMarkForReviewAnswered}
                                    variant="outline"
                                    size="lg"
                                    className="text-gray-700 hover:bg-gray-50 dark:text-gray-300 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark for Review
                                </Button>
                                
                                <Button
                                    onClick={handleClearResponse}
                                    variant="outline"
                                    size="lg"
                                    className="text-gray-700 hover:bg-gray-50 dark:text-gray-300 hover:-translate-y-0.5 transition-all duration-200"
                                    disabled={!session?.answers[currentQuestion?.id || ''] || session.answers[currentQuestion?.id || '']?.length === 0}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear Response
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {currentQuestionIndex === totalQuestions - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        size="lg"
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                                    >
                                        Submit Exam
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Question Dashboard */}
                <div className="question-palette">
                    <div className="bg-white/80 dark:bg-gray-800/80 h-full border-l border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                        {/* Profile Section - styled like StudentProfile avatar */}
                        <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {profile?.profile_picture ? (
                                    <img 
                                        src={profile.profile_picture} 
                                        alt={profile?.name || 'Student'} 
                                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile?.name || 'Student'}&background=1e40af&color=fff`;
                                        }}
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {profile?.name || user?.name || 'Student'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {profile?.institution || 'University Student'}
                                </p>
                            </div>
                        </div>

                        {/* Dashboard Header */}
                        <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Question Palette</h3>
                        </div>

                        {/* Awareness Stats - gradient cards like StudentProfile */}
                        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-center p-2 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
                                    <div className="text-green-700 dark:text-green-200 font-semibold">
                                        {Object.keys(session?.answers || {}).length}
                                    </div>
                                    <div className="text-green-600 dark:text-green-300">Answered</div>
                                </div>
                                <div className="text-center p-2 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm">
                                    <div className="text-red-700 dark:text-red-200 font-semibold">
                                        {totalQuestions - Object.keys(session?.answers || {}).length}
                                    </div>
                                    <div className="text-red-600 dark:text-red-300">Not Answered</div>
                                </div>
                                <div className="text-center p-2 bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50 backdrop-blur-sm">
                                    <div className="text-yellow-700 dark:text-yellow-200 font-semibold">
                                        {questions?.filter(q => session?.flaggedQuestions.has(q.id) && (!session?.answers[q.id] || session!.answers[q.id].length === 0)).length || 0}
                                    </div>
                                    <div className="text-yellow-600 dark:text-yellow-300">Marked</div>
                                </div>
                                <div className="text-center p-2 bg-gradient-to-r from-purple-50/80 to-fuchsia-50/80 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
                                    <div className="text-purple-700 dark:text-purple-200 font-semibold">
                                        {questions?.filter(q => session?.flaggedQuestions.has(q.id) && (session?.answers[q.id] && session!.answers[q.id].length > 0)).length || 0}
                                    </div>
                                    <div className="text-purple-600 dark:text-purple-300">Marked & Answered</div>
                                </div>
                                <div className="text-center p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                                    <div className="text-blue-700 dark:text-blue-200 font-semibold">
                                        {totalQuestions}
                                    </div>
                                    <div className="text-blue-600 dark:text-blue-300">Total</div>
                                </div>
                            </div>
                        </div>

                        {/* Question Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: totalQuestions }, (_, i) => {
                                    const question = questions[i]
                                    const status = getQuestionStatus(question.id)
                                    const isCurrent = currentQuestionIndex === i
                                    
                                    const getButtonStyle = () => {
                                        if (isCurrent) {
                                            return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-md hover:shadow-lg'
                                        }
                                        
                                        switch (status) {
                                            case 'answered':
                                                return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 hover:from-green-600 hover:to-emerald-700'
                                            case 'marked-answered':
                                                return 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-purple-500 hover:from-purple-600 hover:to-fuchsia-700'
                                            case 'flagged':
                                                return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-500 hover:from-yellow-600 hover:to-amber-700'
                                            case 'not-visited':
                                                return 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500 hover:from-red-600 hover:to-rose-700'
                                            default:
                                                return 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className={`w-10 h-10 p-0 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${getButtonStyle()}`}
                                            onClick={() => handleQuestionSelect(i)}
                                            disabled={session?.isSubmitted}
                                        >
                                            {i + 1}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Legend - with badges */}
                        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50  backdrop-blur-sm">
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3  rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-300">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-300">Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-300">Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-300">Current Question</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}