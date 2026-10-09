"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import {
  MockTestLeaderboardList,
  type LeaderboardEntry,
} from '@/components/mock-tests/MockTestLeaderboardList'
import {
  PracticeTestErrorState,
  PracticeTestSubpageLayout,
} from '@/components/mock-tests/PracticeTestSubpageLayout'
import { Loader2, Medal } from 'lucide-react'

export default function StudentMockTestTopPerformersPage() {
  const params = useParams()
  const router = useRouter()
  const mockTestId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('Top Performers')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!mockTestId) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.getStudentMockTestTopPerformers(mockTestId, 10)
        setTitle(data?.assessment_name || 'Top Performers')
        setEntries(Array.isArray(data?.entries) ? data.entries : [])
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail || err?.message || 'Unable to load top performers'
        setError(typeof detail === 'string' ? detail : 'Unable to load top performers')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [mockTestId])

  return (
    <StudentDashboardLayout>
      <PracticeTestSubpageLayout
        title={title}
        subtitle="Top performers for this practice test."
        icon={<Medal className="h-7 w-7 text-amber-600 dark:text-amber-400" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              router.push(`/dashboard/student/mock-tests/${mockTestId}/leaderboard`)
            }
          >
            View full Leaderboard
          </Button>
        }
      >
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" aria-label="Loading" />
          </div>
        ) : error ? (
          <PracticeTestErrorState title="Top performers unavailable" message={error} />
        ) : (
          <MockTestLeaderboardList
            entries={entries}
            emptyMessage="No top performers yet for this practice test."
          />
        )}
      </PracticeTestSubpageLayout>
    </StudentDashboardLayout>
  )
}
