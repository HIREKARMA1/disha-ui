"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { apiClient } from '@/lib/api'
import {
  formatAttemptPercentage,
  formatAttemptScore,
  formatPassFailDisplay,
  getPassFailLabel,
  normalizeAttemptRounds,
} from '@/lib/assessmentAnalytics'
import {
  PracticeTestErrorState,
  PracticeTestSubpageLayout,
} from '@/components/mock-tests/PracticeTestSubpageLayout'
import { Loader2, Trophy } from 'lucide-react'

export default function StudentMockTestResultsPage() {
  const params = useParams()
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
      <PracticeTestSubpageLayout
        title={mockTest?.assessment_name || 'Practice Test Results'}
        subtitle="Your evaluated result from this practice test attempt."
        icon={<Trophy className="h-7 w-7 text-primary-600 dark:text-primary-400" />}
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-label="Loading" />
          </div>
        ) : error ? (
          <PracticeTestErrorState title="Results unavailable" message={error} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Score', value: formatAttemptScore(result, mockTest) },
                { label: 'Percentage', value: formatAttemptPercentage(result) },
                { label: 'Result', value: passFail },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#1A2233] dark:bg-[#141A29]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {result?.submitted_at ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submitted: {new Date(result.submitted_at).toLocaleString()}
              </p>
            ) : null}

            {rounds.length > 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1A2233] dark:bg-[#141A29]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Round breakdown</h2>
                <div className="mt-4 space-y-3">
                  {rounds.map((round: any, idx: number) => (
                    <div
                      key={round.round_id || round.round_number || idx}
                      className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {round.round_name || `Round ${round.round_number || idx + 1}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {round.round_type || 'Section'}
                        </p>
                      </div>
                      <div className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-200">
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
          </div>
        )}
      </PracticeTestSubpageLayout>
    </StudentDashboardLayout>
  )
}
