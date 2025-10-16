"use client"

import { useState, useEffect, useCallback } from 'react'
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
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
.fullscreen-exam .exam-header {
  background: #1e3a8a;
  color: white;
  border-bottom: 1px solid #e2e8f0;
}
.fullscreen-exam .exam-content {
  flex: 1;
  display: flex;
  gap: 10px;
  width: 100%;
  height: calc(100vh - 130px);
  overflow: hidden;
}
.fullscreen-exam .question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.fullscreen-exam .question-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.fullscreen-exam .question-footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
.fullscreen-exam .question-palette {
  width: 280px;
  height: 100%;
  overflow-y: auto;
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
`

export function PracticeExam({ module, onComplete, onBack }: PracticeExamProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [showConfirmExit, setShowConfirmExit] = useState(false)
    const [questionResults, setQuestionResults] = useState<Record<string, {
        correct: boolean
        score: number
        maxScore: number
        feedback?: string
    }>>({})
    const [isFullscreen, setIsFullscreen] = useState(false)

    const { data: questions, isLoading } = usePracticeQuestions(module.id)
    const { session, updateAnswer, updateTimeSpent, toggleFlag, submitExam } = useExamSession(module.id)
    const { user } = useAuth()
    const { profile, isLoading: profileLoading } = useStudentProfile()

    const currentQuestion = questions?.[currentQuestionIndex]
    const totalQuestions = questions?.length || 0

    // Get question status for the dashboard
    const getQuestionStatus = (questionId: string) => {
        if (session?.isSubmitted) return 'submitted'
        if (session?.flaggedQuestions.has(questionId)) return 'flagged'
        if (session?.answers[questionId] && session.answers[questionId].length > 0) return 'answered'
        return 'not-visited'
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (session && !session.isSubmitted) {
                console.log('Auto-saving exam progress...')
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [session])

    useEffect(() => {
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
        const fullscreenChange = () => {
            const fs = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement
            setIsFullscreen(!!fs)
            setSidebarHidden(!!fs)
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

    const handleSubmit = async () => {
        if (!questions || !session) return
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
        <div className={`${isFullscreen ? 'fullscreen-exam' : 'min-h-screen bg-gray-50'}`}>
            {/* Header */}
            <div className={`${isFullscreen ? 'exam-header' : 'bg-white border-b border-gray-200 px-6 py-4'}`}>
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        {!isFullscreen && (
                            <Button
                                onClick={handleExit}
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                        <div>
                            <h1 className={`text-lg font-bold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                                {module.title}
                            </h1>
                            <p className={`text-sm ${isFullscreen ? 'text-blue-100' : 'text-gray-600'}`}>
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-sm">
                            <div className={`flex items-center gap-2 ${isFullscreen ? 'text-blue-100' : 'text-gray-600'}`}>
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Answered</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isFullscreen ? 'text-blue-100' : 'text-gray-600'}`}>
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span>Not Answered</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isFullscreen ? 'text-blue-100' : 'text-gray-600'}`}>
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span>Marked for Review</span>
                            </div>
                        </div>
                        
                        <ExamTimer 
                            duration={module.duration_seconds}
                            onTimeUp={handleSubmit}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={isFullscreen ? 'exam-content' : 'flex gap-6 p-2'}>
                {/* Left Panel - Question */}
                <div className={isFullscreen ? 'question-container' : 'flex-1 bg-white rounded-lg border border-gray-200 shadow-sm'}>
                    {/* Question Header */}
                    <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1}</span>
                                {session?.flaggedQuestions.has(currentQuestion?.id || '') && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-200">
                                        <Flag className="w-3 h-3" />
                                        Marked for Review
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                Single Choice • Mark for Review
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className={isFullscreen ? 'question-content bg-white p-6' : 'p-6'}>
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
                    <div className={isFullscreen ? 'question-footer px-6 py-4' : 'border-t border-gray-200 px-6 py-4 bg-gray-50'}>
                        <div className="flex items-center justify-between">
                            {/* Left side buttons */}
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                    variant="outline"
                                    size="lg"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                                
                                <Button
                                    onClick={handleFlagToggle}
                                    variant="outline"
                                    size="lg"
                                    className={`${
                                        session?.flaggedQuestions.has(currentQuestion?.id || '') 
                                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' 
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Flag className="w-4 h-4 mr-2" />
                                    Mark for Review
                                </Button>
                                
                                <Button
                                    onClick={handleClearResponse}
                                    variant="outline"
                                    size="lg"
                                    className="text-gray-700 hover:bg-gray-50"
                                    disabled={!session?.answers[currentQuestion?.id || ''] || session.answers[currentQuestion?.id || '']?.length === 0}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear Response
                                </Button>
                            </div>
                            
                            {/* Right side buttons */}
                            <div className="flex items-center gap-3">

                                {currentQuestionIndex === totalQuestions - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        size="lg"
                                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                                    >
                                        Submit Exam
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        size="lg"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
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
                <div className={isFullscreen ? 'question-palette' : 'w-90 flex-shrink-0'}>
                    <div className={isFullscreen ? 'bg-white h-full border-l border-gray-200' : 'bg-white rounded-lg border border-gray-200 shadow-sm sticky top-6'}>
                        {/* Profile Section */}
                        <div className="border-b border-gray-200 p-4 flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {profile?.profile_picture ? (
                                    <img 
                                        src={profile.profile_picture} 
                                        alt={profile?.name || 'Student'} 
                                        className="h-10 w-10 rounded-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile?.name || 'Student'}&background=1e40af&color=fff`;
                                        }}
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {profile?.name || user?.name || 'Student'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {profile?.institution || 'University Student'}
                                </p>
                            </div>
                        </div>

                        {/* Dashboard Header */}
                        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Question Palette</h3>
                        </div>

                        {/* Awareness Stats */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                                    <div className="text-green-700 font-semibold">
                                        {Object.keys(session?.answers || {}).length}
                                    </div>
                                    <div className="text-green-600">Answered</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                                    <div className="text-red-700 font-semibold">
                                        {totalQuestions - Object.keys(session?.answers || {}).length}
                                    </div>
                                    <div className="text-red-600">Not Answered</div>
                                </div>
                                <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <div className="text-yellow-700 font-semibold">
                                        {session?.flaggedQuestions.size || 0}
                                    </div>
                                    <div className="text-yellow-600">Marked</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                                    <div className="text-gray-700 font-semibold">
                                        {totalQuestions}
                                    </div>
                                    <div className="text-gray-600">Total</div>
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
                                            return 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        }
                                        
                                        switch (status) {
                                            case 'answered':
                                                return 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                                            case 'flagged':
                                                return 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
                                            case 'not-visited':
                                                return 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                            default:
                                                return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className={`w-10 h-10 p-0 text-sm font-medium transition-all duration-200 ${getButtonStyle()}`}
                                            onClick={() => handleQuestionSelect(i)}
                                            disabled={session?.isSubmitted}
                                        >
                                            {i + 1}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="text-gray-600">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span className="text-gray-600">Not Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                    <span className="text-gray-600">Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                    <span className="text-gray-600">Current Question</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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