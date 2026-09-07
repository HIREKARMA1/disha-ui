"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Flag,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  User,
} from 'lucide-react'
import { MockTest, MockTestQuestion, SubmitMockAttemptResponse } from '@/types/mockTest'
import { Question } from '@/types/practice'
import { Button } from '@/components/ui/button'
import { QuestionPanel } from '@/components/practice/QuestionPanel'
import { OptionsPanel } from '@/components/practice/OptionsPanel'
import { ExamTimer } from '@/components/practice/ExamTimer'
import { useMockExamSession } from '@/hooks/useMockExamSession'
import { useStudentProfile } from '@/hooks/useStudentProfile'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

interface MockTestExamProps {
  mockTest: MockTest
  onComplete: (result: SubmitMockAttemptResponse) => void
  onBack: () => void
}

function setSidebarHidden(hidden: boolean) {
  if (typeof document === 'undefined') return
  if (hidden) document.body.classList.add('hide-sidebar')
  else document.body.classList.remove('hide-sidebar')
}

function toPracticeQuestion(q: MockTestQuestion): Question {
  const type =
    q.type === 'mcq_multi' ? 'mcq_multi' : q.type === 'mcq_single' ? 'mcq_single' : 'mcq_single'
  const difficulty =
    q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard'
      ? q.difficulty
      : 'medium'

  return {
    id: q.id,
    statement: q.statement,
    type,
    options: q.options,
    correct_options: q.correct_options,
    explanation: q.explanation,
    tags: q.tags || [],
    role: 'mock-test',
    difficulty,
    time_limit_seconds: q.time_limit_seconds,
  }
}

const fullscreenExamStyle = `
:root {
  --exam-bg: #f8fafc;
  --exam-header-bg: white;
  --exam-header-color: #4b5563;
  --exam-border: #e2e8f0;
  --question-footer-bg: #ffffff;
  --question-footer-border: #e5e7eb;
  --question-content-bg: #ffffff;
  --question-content-text: #1f2937;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --backdrop-blur: blur(8px);
}
.dark {
  --exam-bg: #0f172a;
  --exam-header-bg: #1e293b;
  --exam-header-color: white;
  --exam-border: #334155;
  --question-footer-bg: #1e293b;
  --question-footer-border: #334155;
  --question-content-bg: #1e293b;
  --question-content-text: #f8fafc;
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
  gap: 1rem;
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
  border-radius: 1rem;
  border: 1px solid var(--exam-border);
  box-shadow: var(--card-shadow);
}
.fullscreen-exam .question-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: var(--backdrop-blur);
  color: var(--question-content-text);
}
.dark .fullscreen-exam .question-content {
  background: rgba(31, 41, 55, 0.8);
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
  border-radius: 1rem;
  border: 1px solid var(--exam-border);
  box-shadow: var(--card-shadow);
}
@media (max-width: 1024px) {
  .fullscreen-exam .exam-content {
    flex-direction: column;
    padding: 0.5rem;
    height: calc(100vh - 100px);
  }
  .fullscreen-exam .question-palette {
    width: 100%;
    height: auto;
    max-height: 220px;
  }
  .fullscreen-exam .question-footer {
    padding: 0.75rem;
  }
  .fullscreen-exam .question-footer .footer-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
`

export function MockTestExam({ mockTest, onComplete, onBack }: MockTestExamProps) {
  const questions = useMemo(
    () => [...(mockTest.questions || [])].sort((a, b) => (a.question_order ?? 0) - (b.question_order ?? 0)),
    [mockTest.questions]
  )
  const {
    session,
    isClient,
    updateAnswer,
    updateTimeSpent,
    setCurrentQuestionIndex,
    toggleFlag,
    submitExam,
    isSubmitting,
  } = useMockExamSession(mockTest.id)
  const { user } = useAuth()
  const { profile } = useStudentProfile()
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const submittingRef = useRef(false)

  const currentQuestionIndex = session?.currentQuestionIndex ?? 0
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const mappedQuestion = currentQuestion ? toPracticeQuestion(currentQuestion) : null

  useEffect(() => {
    setSidebarHidden(true)
    return () => setSidebarHidden(false)
  }, [])

  useEffect(() => {
    let styleTag: HTMLStyleElement | null = null
    if (typeof document !== 'undefined') {
      styleTag = document.createElement('style')
      styleTag.innerHTML = fullscreenExamStyle
      document.head.appendChild(styleTag)
    }
    return () => {
      if (styleTag && document.head.contains(styleTag)) {
        document.head.removeChild(styleTag)
      }
    }
  }, [])

  const getQuestionStatus = useCallback(
    (questionId: string) => {
      if (session?.isSubmitted) return 'submitted'
      const isFlagged = session?.flaggedQuestions.has(questionId)
      const hasAnswer = !!(session?.answers[questionId] && session.answers[questionId].length > 0)
      if (isFlagged && hasAnswer) return 'marked-answered'
      if (isFlagged) return 'flagged'
      if (hasAnswer) return 'answered'
      return 'not-visited'
    },
    [session]
  )

  const answeredCount = useMemo(() => {
    if (!session) return 0
    return questions.filter((q) => session.answers[q.id]?.length > 0).length
  }, [session, questions])

  const performSubmit = useCallback(async () => {
    if (!session || submittingRef.current || session.isSubmitted) return
    submittingRef.current = true
    try {
      const questionIds = questions.map((q) => q.id)
      const result = await submitExam(questionIds)
      toast.success('Mock test submitted successfully!')
      onComplete(result)
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit mock test. Please try again.')
      submittingRef.current = false
    }
  }, [session, questions, submitExam, onComplete])

  const handleTimeUp = useCallback(() => {
    toast.error('Time is up — submitting your answers')
    void performSubmit()
  }, [performSubmit])

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

  const handleAnswerChange = (answer: string[]) => {
    if (currentQuestion) updateAnswer(currentQuestion.id, answer)
  }

  const handleTimeSpent = (timeSpent: number) => {
    if (currentQuestion) updateTimeSpent(currentQuestion.id, timeSpent)
  }

  const handleFlagToggle = () => {
    if (currentQuestion) toggleFlag(currentQuestion.id)
  }

  const handleClearResponse = () => {
    if (currentQuestion) updateAnswer(currentQuestion.id, [])
  }

  const handleMarkForReview = () => {
    if (!currentQuestion) return
    if (!session?.flaggedQuestions.has(currentQuestion.id)) {
      toggleFlag(currentQuestion.id)
    }
    handleNext()
  }

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false)
    void performSubmit()
  }

  if (!isClient || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (totalQuestions === 0) {
    return (
      <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700 rounded-xl p-6">
        <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">No Questions Available</h3>
        <p className="text-red-700 dark:text-red-300 mb-4">This mock test does not have any questions yet.</p>
        <Button onClick={onBack} variant="outline">
          Back to Mock Tests
        </Button>
      </div>
    )
  }

  return (
    <div className="fullscreen-exam">
      <div className="exam-header p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              {mockTest.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <ExamTimer duration={mockTest.duration_seconds} onTimeUp={handleTimeUp} />
        </div>
      </div>

      <div className="exam-content">
        <div className="question-container">
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-4 md:px-6 py-3 md:py-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Question {currentQuestionIndex + 1}
                </span>
                {session.flaggedQuestions.has(currentQuestion?.id || '') && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50/80 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 text-xs font-medium border border-yellow-200/50">
                    <Flag className="w-3 h-3" />
                    Marked
                  </span>
                )}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {mappedQuestion?.type === 'mcq_multi' ? 'Multiple Choice' : 'Single Choice'}
              </div>
            </div>
          </div>

          <div className="question-content">
            {mappedQuestion && (
              <>
                <QuestionPanel
                  question={mappedQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  onTimeSpent={handleTimeSpent}
                />
                <OptionsPanel
                  key={mappedQuestion.id}
                  question={mappedQuestion}
                  answer={session.answers[mappedQuestion.id] || []}
                  isFlagged={session.flaggedQuestions.has(mappedQuestion.id)}
                  onAnswerChange={handleAnswerChange}
                  onFlagToggle={handleFlagToggle}
                  isSubmitted={session.isSubmitted}
                />
              </>
            )}
          </div>

          <div className="question-footer">
            <div className="footer-actions flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <Button
                  onClick={handleMarkForReview}
                  disabled={isSubmitting}
                  variant="outline"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Flag
                </Button>
                <Button
                  onClick={handleClearResponse}
                  disabled={
                    isSubmitting ||
                    !session.answers[currentQuestion?.id || '']?.length
                  }
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button
                    onClick={handleSubmitClick}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-8"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 md:px-8"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="question-palette">
          <div className="bg-white/80 dark:bg-gray-800/80 h-full backdrop-blur-sm">
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center space-x-3">
              <div className="flex-shrink-0">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile?.name || 'Student'}
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
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

            <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Question Palette</h3>
            </div>

            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50">
                  <div className="text-green-700 dark:text-green-200 font-semibold">{answeredCount}</div>
                  <div className="text-green-600 dark:text-green-300 text-xs">Answered</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200/50">
                  <div className="text-red-700 dark:text-red-200 font-semibold">
                    {totalQuestions - answeredCount}
                  </div>
                  <div className="text-red-600 dark:text-red-300 text-xs">Not Answered</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200/50">
                  <div className="text-yellow-700 dark:text-yellow-200 font-semibold">
                    {questions.filter(
                      (q) =>
                        session.flaggedQuestions.has(q.id) &&
                        (!session.answers[q.id] || session.answers[q.id].length === 0)
                    ).length}
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-300 text-xs">Flagged</div>
                </div>
                <div className="text-center p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50">
                  <div className="text-blue-700 dark:text-blue-200 font-semibold">{totalQuestions}</div>
                  <div className="text-blue-600 dark:text-blue-300 text-xs">Total</div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, i) => {
                  const status = getQuestionStatus(question.id)
                  const isCurrent = currentQuestionIndex === i
                  let buttonStyle =
                    'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  if (isCurrent) {
                    buttonStyle =
                      'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-md'
                  } else if (status === 'answered') {
                    buttonStyle =
                      'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500'
                  } else if (status === 'marked-answered') {
                    buttonStyle =
                      'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-purple-500'
                  } else if (status === 'flagged') {
                    buttonStyle =
                      'bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-500'
                  } else if (status === 'not-visited') {
                    buttonStyle =
                      'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500'
                  }

                  return (
                    <Button
                      key={question.id}
                      variant="outline"
                      className={`w-10 h-10 p-0 text-sm font-medium transition-all ${buttonStyle}`}
                      onClick={() => setCurrentQuestionIndex(i)}
                      disabled={session.isSubmitted || isSubmitting}
                    >
                      {i + 1}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded" />
                  <span className="text-gray-600 dark:text-gray-300">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-600 rounded" />
                  <span className="text-gray-600 dark:text-gray-300">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded" />
                  <span className="text-gray-600 dark:text-gray-300">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded" />
                  <span className="text-gray-600 dark:text-gray-300">Current</span>
                </div>
              </div>
              <Button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Submit Mock Test?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have answered {answeredCount} of {totalQuestions} questions. You cannot change
              answers after submission.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
