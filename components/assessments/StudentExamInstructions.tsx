'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatAssessmentSchedule } from '@/lib/datetime'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertCircle,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  LogIn,
  UserPlus,
  Info,
  CheckCircle2,
} from 'lucide-react'

export interface StudentExamEligibility {
  can_start: boolean
  has_completed_attempt: boolean
  attempt_status?: string | null
  percentage?: number | null
  total_score?: number | null
  submitted_at?: string | null
}

export interface PublicExamBrief {
  id: string
  disha_assessment_id: string
  assessment_name: string
  description?: string | null
  instructions?: string | null
  start_time: string
  end_time: string
  total_duration_minutes: number
  total_questions: number
  round_count: number
  rounds: Array<{
    id: string
    round_number: number
    round_type: string
    round_name: string
    duration_minutes: number
    config?: Record<string, unknown>
    is_mandatory?: boolean
    passing_percentage?: number | null
  }>
  passing_percentage?: number | null
  is_within_time_window: boolean
  has_ended: boolean
  has_not_started: boolean
}

const GENERAL_DIRECTIONS = [
  'The assessment is timed. A countdown reflects the time remaining for the overall test window shown below.',
  'Complete all mandatory rounds in the order listed. You will be guided through each section on the exam platform.',
  'Ensure a stable internet connection and use a supported desktop or laptop browser. Avoid switching tabs during the test unless permitted.',
  'Do not refresh or close the browser window while the assessment is in progress unless instructed to do so.',
  'Your responses are evaluated automatically where applicable; subjective rounds may be reviewed separately.',
  'If you face technical issues, note the time and contact the organizer immediately with your registered email.',
]

function formatRoundType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

interface StudentExamInstructionsProps {
  exam: PublicExamBrief
  authLoading: boolean
  isAuthenticated: boolean
  isStudent: boolean
  loginUrl: string
  registerUrl: string
  startError: string | null
  starting: boolean
  onStart: () => void
  eligibility: StudentExamEligibility | null
  eligibilityLoading: boolean
}

export function StudentExamInstructions({
  exam,
  authLoading,
  isAuthenticated,
  isStudent,
  loginUrl,
  registerUrl,
  startError,
  starting,
  onStart,
  eligibility,
  eligibilityLoading,
}: StudentExamInstructionsProps) {
  const [declared, setDeclared] = useState(false)

  const scheduleLabel = useMemo(
    () => formatAssessmentSchedule(exam.start_time, exam.end_time),
    [exam.start_time, exam.end_time]
  )

  const cannotRetake = eligibility != null && eligibility.can_start === false

  const canBegin =
    isStudent &&
    !cannotRetake &&
    exam.is_within_time_window &&
    !exam.has_ended &&
    !exam.has_not_started

  const statusBanner = exam.has_ended
    ? {
        tone: 'amber' as const,
        text: 'This exam window has ended. Contact the organizer if you need assistance.',
      }
    : exam.has_not_started
      ? {
          tone: 'blue' as const,
          text: 'This exam has not started yet. Return after the scheduled start time.',
        }
      : null

  return (
    <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Exam header band */}
      <div className="bg-primary-700 dark:bg-primary-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-100 mb-1">
            Online assessment · Instructions
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{exam.assessment_name}</h1>
          <p className="text-sm text-primary-100 mt-2 font-mono">Assessment ID: {exam.disha_assessment_id}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        {cannotRetake && (
          <motion.div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/40 dark:border-green-800 p-4 text-sm text-green-900 dark:text-green-100">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
            <div>
              <p className="font-semibold">You have already submitted this assessment</p>
              <p className="mt-1 text-green-800/90 dark:text-green-200/90">
                Retakes are not allowed for this exam.
                {eligibility?.percentage != null ? (
                  <> Your recorded score is <strong>{eligibility.percentage}%</strong>.</>
                ) : (
                  <> Your attempt has already been recorded.</>
                )}
              </p>
            </div>
          </motion.div>
        )}
        {statusBanner && !cannotRetake && (
          <div
            className={`flex gap-3 rounded-lg border p-4 text-sm ${
              statusBanner.tone === 'amber'
                ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100'
                : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100'
            }`}
          >
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{statusBanner.text}</p>
          </div>
        )}

        {/* Summary table — AMCAT-style overview */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-50 dark:bg-primary-900/30">
                <th className="text-left px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  Test name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  Total questions
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  Total time
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 hidden md:table-cell">
                  Exam window
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 hidden lg:table-cell">
                  Passing score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{exam.assessment_name}</td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                  {exam.total_questions > 0 ? exam.total_questions : 'As per sections'}
                </td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                  {formatDuration(exam.total_duration_minutes)}
                </td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300 hidden md:table-cell">{scheduleLabel}</td>
                <td className="px-4 py-4 text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                  {exam.passing_percentage != null ? `${exam.passing_percentage}%` : 'As notified'}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="md:hidden px-4 pb-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
            <span className="font-medium text-gray-700 dark:text-gray-300">Window: </span>
            {scheduleLabel}
          </p>
        </section>

        {/* Section breakdown */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <motion.div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <Layers className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment rounds</h2>
            <span className="ml-auto text-xs text-gray-500">{exam.round_count} section(s)</span>
          </motion.div>
          {exam.rounds.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500">Round details will be available when you start the exam.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-600 text-white">
                    <th className="text-left px-4 py-2.5 font-semibold w-12">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Section name</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Type</th>
                    <th className="text-center px-4 py-2.5 font-semibold w-32">Questions</th>
                    <th className="text-center px-4 py-2.5 font-semibold w-32">Time limit</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.rounds.map((round, idx) => (
                    <tr
                      key={round.id}
                      className={
                        idx % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50/80 dark:bg-gray-900/40'
                      }
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{round.round_number}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{round.round_name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatRoundType(round.round_type)}</td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {(round.config?.num_questions as number) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {formatDuration(round.duration_minutes)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary-50 dark:bg-primary-900/20 font-semibold border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={3} className="px-4 py-3 text-gray-900 dark:text-white">
                      Total (all rounds)
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                      {exam.total_questions > 0 ? exam.total_questions : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                      {formatDuration(exam.total_duration_minutes)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Description & custom instructions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col min-h-[220px]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About this assessment</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-72 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {exam.description?.trim() ? (
                exam.description
              ) : (
                <p className="text-gray-500 italic">No additional description provided by the organizer.</p>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col min-h-[220px]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Instructions for students</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-72 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {exam.instructions?.trim() ? (
                exam.instructions
              ) : (
                <p className="text-gray-500 italic">
                  Follow the general directions below. Additional instructions may appear when you begin the exam.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* General directions — scrollable instruction box */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General directions</h2>
            <p className="text-xs text-gray-500 mt-1">Please read carefully before you begin.</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50/50 dark:bg-gray-900/30 max-h-64 overflow-y-auto p-4 sm:p-5">
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {GENERAL_DIRECTIONS.map((item, i) => (
                  <li key={i} className="pl-1">
                    {item}
                  </li>
                ))}
                <li className="pl-1">
                  The scheduled availability window is <strong>{scheduleLabel}</strong>. You may only start during
                  this window.
                </li>
                <li className="pl-1">
                  Total assessment duration across all rounds is approximately{' '}
                  <strong>{formatDuration(exam.total_duration_minutes)}</strong>
                  {exam.total_questions > 0 && (
                    <>
                      {' '}
                      with up to <strong>{exam.total_questions}</strong> questions in total.
                    </>
                  )}
                  .
                </li>
              </ol>
            </div>
            <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">
              Caution: Closing this page or losing connectivity during the exam may affect your attempt. Use
              &quot;I am ready to begin&quot; only when you are prepared to start immediately.
            </p>
          </div>
        </section>

        {/* Readiness & start */}
        <section className="bg-white dark:bg-gray-800 rounded-lg border-2 border-primary-200 dark:border-primary-800 shadow-lg p-6 sm:p-8">
          {authLoading ? (
            <motion.div className="flex justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
            </motion.div>
          ) : !isAuthenticated ? (
            <div className="space-y-4 text-center max-w-md mx-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in with your <strong>student</strong> account to accept the declaration and begin the exam.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={loginUrl}
                  className={cn(
                    buttonVariants(),
                    'bg-primary-600 hover:bg-primary-700 inline-flex items-center justify-center gap-2 flex-1'
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  Student sign in
                </Link>
                <Link
                  href={registerUrl}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'inline-flex items-center justify-center gap-2 flex-1'
                  )}
                >
                  <UserPlus className="h-4 w-4" />
                  Register as student
                </Link>
              </div>
            </div>
          ) : !isStudent ? (
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              This assessment link is for <strong>students</strong> only. Please sign out and use a student account.
            </p>
          ) : eligibilityLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : cannotRetake ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-lg mx-auto">
              You cannot start this exam again. If you believe this is an error, contact your university or the
              exam organizer.
            </p>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              <Checkbox
                id="exam-declaration"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                label={
                  <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    I have read and understood the instructions, assessment structure, and time window. I confirm
                    that I am the registered candidate, my system is ready, and I agree to follow all exam rules. I
                    understand that misconduct may lead to disqualification.
                  </span>
                }
              />

              {startError && (
                <p className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-3">
                  {startError}
                </p>
              )}

              <div className="flex flex-col items-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  disabled={!declared || !canBegin || starting || eligibilityLoading}
                  onClick={onStart}
                  className="w-full sm:w-auto min-w-[240px] h-12 text-base bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <span className="inline-flex items-center justify-center">
                    {starting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Launching exam…
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-5 w-5 mr-2" />
                        I am ready to begin
                      </>
                    )}
                  </span>
                </Button>
                {!canBegin && isStudent && !cannotRetake && (
                  <p className="text-xs text-gray-500 text-center flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    The begin button is available only during the scheduled exam window.
                  </p>
                )}
                {canBegin && declared && (
                  <p className="text-xs text-gray-500 text-center">
                    You will be redirected to the secure exam environment to complete all rounds.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}
