"use client"

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  Award,
} from 'lucide-react'
import { SubmitMockAttemptResponse } from '@/types/mockTest'
import { Button } from '@/components/ui/button'

interface MockTestResultProps {
  result: SubmitMockAttemptResponse
  title?: string
  onBack: () => void
}

export function MockTestResult({ result, title, onBack }: MockTestResultProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    return `${minutes}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const getQuestionStatus = (isCorrect?: boolean | null) => {
    if (isCorrect === true) return 'correct'
    if (isCorrect === false) return 'incorrect'
    return 'unanswered'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mock Tests
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock Test Results</h1>
            <p className="text-gray-600 dark:text-gray-400">{title || 'Mock Test'}</p>
          </div>
        </div>
        {result.passed != null && (
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              result.passed
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            <Award className="w-4 h-4" />
            {result.passed ? 'Passed' : 'Not Passed'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${getScoreBgColor(result.score_percent)} rounded-xl border border-gray-200 dark:border-gray-700 p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(result.score_percent)}`}>
                {result.score_percent.toFixed(1)}%
              </p>
            </div>
            <Trophy className={`w-8 h-8 ${getScoreColor(result.score_percent)}`} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Taken</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(result.time_taken_seconds)}
              </p>
            </div>
            <Clock className="w-6 h-6 text-gray-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Correct</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {result.correct_count}/{result.total_questions}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" /> Incorrect
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.incorrect_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <MinusCircle className="w-4 h-4 text-gray-400" /> Unanswered
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.unanswered_count}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.total_questions}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Results</h3>
        <div className="space-y-3">
          {(result.question_results || []).map((qr, index) => {
            const status = getQuestionStatus(qr.is_correct)
            return (
              <div
                key={qr.question_id || index}
                className={`p-4 rounded-lg border ${
                  status === 'correct'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : status === 'incorrect'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                      : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {status === 'correct' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : status === 'incorrect' ? (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <MinusCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === 'correct'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : status === 'incorrect'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                        }`}
                      >
                        {status === 'correct'
                          ? 'Correct'
                          : status === 'incorrect'
                            ? 'Incorrect'
                            : 'Unanswered'}
                      </span>
                    </div>
                    {qr.statement && (
                      <div
                        className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: qr.statement }}
                      />
                    )}
                    {qr.explanation && (
                      <div
                        className="mt-2 text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: qr.explanation }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {(!result.question_results || result.question_results.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
              No per-question breakdown available for this attempt.
            </p>
          )}
        </div>
      </motion.div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={onBack}
          size="lg"
          className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
        >
          Back to Mock Tests
        </Button>
      </div>
    </div>
  )
}
