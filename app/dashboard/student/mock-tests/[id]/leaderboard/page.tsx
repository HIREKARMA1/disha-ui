"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import {
  MockTestLeaderboardList,
  type LeaderboardEntry,
} from '@/components/mock-tests/MockTestLeaderboardList'
import { ArrowLeft, Loader2, Trophy } from 'lucide-react'

export default function StudentMockTestLeaderboardPage() {
  const params = useParams()
  const router = useRouter()
  const mockTestId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('Leaderboard')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!mockTestId) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.getStudentMockTestLeaderboard(mockTestId, 10)
        setTitle(data?.assessment_name || 'Leaderboard')
        setEntries(Array.isArray(data?.entries) ? data.entries : [])
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail || err?.message || 'Unable to load leaderboard'
        setError(typeof detail === 'string' ? detail : 'Unable to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [mockTestId])

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

        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/30">
            <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title} — Leaderboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Top 10 performers for this mock test.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold">Leaderboard unavailable</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/student/mock-tests">Return to Mock Tests</Link>
            </Button>
          </div>
        ) : (
          <MockTestLeaderboardList
            entries={entries}
            emptyMessage="No ranked results yet for this mock test."
          />
        )}
      </div>
    </StudentDashboardLayout>
  )
}
