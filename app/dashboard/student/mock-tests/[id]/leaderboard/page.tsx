"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { apiClient } from '@/lib/api'
import {
  MockTestLeaderboardList,
  type LeaderboardEntry,
} from '@/components/mock-tests/MockTestLeaderboardList'
import {
  PracticeTestErrorState,
  PracticeTestSubpageLayout,
} from '@/components/mock-tests/PracticeTestSubpageLayout'
import { Loader2, Trophy } from 'lucide-react'

export default function StudentMockTestLeaderboardPage() {
  const params = useParams()
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
      <PracticeTestSubpageLayout
        title={`${title} — Leaderboard`}
        subtitle="Top 10 performers for this practice test."
        icon={<Trophy className="h-7 w-7 text-amber-600 dark:text-amber-400" />}
      >
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-label="Loading" />
          </div>
        ) : error ? (
          <PracticeTestErrorState title="Leaderboard unavailable" message={error} />
        ) : (
          <MockTestLeaderboardList
            entries={entries}
            emptyMessage="No ranked results yet for this practice test."
          />
        )}
      </PracticeTestSubpageLayout>
    </StudentDashboardLayout>
  )
}
