"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import {
  formatAttemptPercentage,
  formatAttemptScore,
  formatPassFailDisplay,
  getPassFailLabel,
  normalizeAttemptRounds,
} from '@/lib/assessmentAnalytics'
import { ArrowLeft, Loader2, Trophy } from 'lucide-react'

export default function StudentMockTestResultsPage() {
  const params = useParams()
  const router = useRouter()
  const mockTestId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [mockTest, setMockTest] = useState<any>(null)

  useEffect(() => {
    if (!mockTestId) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [attempt, catalog] = await Promise.all([
          apiClient.getStudentMockTestResult(mockTestId),
          apiClient.getStudentMockTests().catch(() => []),
        ])
        setResult(attempt)
        const match = Array.isArray(catalog)
          ? catalog.find((t: any) => t.id === mockTestId)
          : null
        setMockTest(match || null)
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail || err?.message || 'Unable to load results'
        setError(typeof detail === 'string' ? detail : 'Unable to load results')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [mockTestId])

  const rounds = normalizeAttemptRounds(result)
  const passFail = result ? formatPassFailDisplay(getPassFailLabel(result, mockTest)) : '—'

  return (
    <StudentDashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/student/mock-tests')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Tests
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold">Results unavailable</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/student/mock-tests">Return to Mock Tests</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                  <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockTest?.assessment_name || 'Mock Test Results'}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your evaluated result from this mock test attempt.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Score
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAttemptScore(result, mockTest)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Percentage
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAttemptPercentage(result)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Result
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {passFail}
                  </p>
                </div>
              </div>

              {result?.submitted_at ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Submitted:{' '}
                  {new Date(result.submitted_at).toLocaleString()}
                </p>
              ) : null}
            </div>

            {rounds.length > 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Round breakdown
                </h2>
                <div className="mt-4 space-y-3">
                  {rounds.map((round: any, idx: number) => (
                    <div
                      key={round.round_id || round.round_number || idx}
                      className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {round.round_name || `Round ${round.round_number || idx + 1}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {round.round_type || 'Section'}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {round.score != null && round.total_score != null
                          ? `${round.score} / ${round.total_score}`
                          : round.percentage != null
                            ? `${round.percentage}%`
                            : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </StudentDashboardLayout>
  )
}
