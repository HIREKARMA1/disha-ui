"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import { buildPracticeTestInstructionPath } from '@/lib/assessmentLinks'
import { TopPerformersShowcase } from '@/components/mock-tests/TopPerformersShowcase'
import type { TopPerformerHighlight } from '@/components/mock-tests/topPerformerUtils'
import {
  Brain,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Sparkles,
  Trophy,
  BarChart3,
} from 'lucide-react'

interface StudentMockTest {
  id: string
  disha_assessment_id: string
  assessment_name: string
  description?: string | null
  status: string
  start_time?: string
  end_time?: string
  total_duration_minutes: number
  round_count: number
  rounds?: any[]
  has_attempted?: boolean
  background_image_url?: string | null
  results_published?: boolean
}

const hubCardClass =
  'flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm transition-all duration-200 dark:border-[#1A2233] dark:bg-[#141A29] dark:shadow-none'

export function MockTestsCatalog() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const isStudent = isAuthenticated && user?.user_type === 'student'

  const [mockTests, setMockTests] = useState<StudentMockTest[]>([])
  const [highlights, setHighlights] = useState<TopPerformerHighlight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)

  const fetchMockTests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [tests, top] = await Promise.all([
        apiClient.getStudentMockTests(),
        apiClient.getMockTestTopPerformerHighlights().catch(() => []),
      ])
      setMockTests(Array.isArray(tests) ? tests : [])
      setHighlights(Array.isArray(top) ? top : [])
    } catch (err: any) {
      console.error('Failed to load practice tests:', err)
      setError(
        err?.response?.data?.detail || err?.message || 'Failed to load practice tests'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMockTests()
  }, [fetchMockTests])

  const requireStudent = (path: string) => {
    if (isStudent) {
      router.push(path)
      return
    }
    openLoginModal({
      redirect: path,
      preferredType: 'student',
    })
  }

  const handleStart = (mockTestId: string) => {
    const startPath = buildPracticeTestInstructionPath(mockTestId)
    if (!startPath || authLoading) return
    if (!isAuthenticated) {
      openLoginModal({
        redirect: startPath,
        preferredType: 'student',
      })
      return
    }
    setStartingId(mockTestId)
    router.push(startPath)
  }

  const handleViewResults = (mockTestId: string) => {
    requireStudent(`/dashboard/student/mock-tests/${mockTestId}/results`)
  }

  const handleLeaderboard = (mockTestId: string) => {
    requireStudent(`/dashboard/student/mock-tests/${mockTestId}/leaderboard`)
  }

  const handleTopPerformers = (mockTestId: string) => {
    requireStudent(`/dashboard/student/mock-tests/${mockTestId}/top-performers`)
  }

  return (
    <div className="mx-auto min-w-0 max-w-[1600px] space-y-6 pb-8">
      <div className="rounded-2xl border border-primary-200/70 bg-gradient-to-r from-primary-700 to-primary-800 px-5 py-4 shadow-sm dark:border-primary-800/50 dark:from-primary-800 dark:to-primary-900 sm:px-6 sm:py-5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary-200">
          <Sparkles className="h-3 w-3" aria-hidden />
          Disha Learning
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
          Practice Tests
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-snug text-primary-100">
          Full-length timed assessments with instant scoring, leaderboards, and detailed
          results — built for placement readiness.
        </p>
      </div>

      <section aria-labelledby="top-performers-heading" className="min-w-0">
        <TopPerformersShowcase
          highlights={highlights}
          isLoading={isLoading}
          variant="catalog"
          onSelectTest={(id) => handleTopPerformers(id)}
        />
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/80"
            />
          ))}
        </div>
      ) : mockTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-24 text-center dark:border-gray-700 dark:from-gray-900/30 dark:to-[#141A29]">
          <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <Brain className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No practice tests available
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Your administrator has not published any practice tests yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockTests.map((test, index) => (
            <motion.article
              key={test.id}
              id={`mock-test-card-${test.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className={cn(
                hubCardClass,
                'hover:border-primary-200 hover:shadow-lg dark:hover:border-[#33405E]'
              )}
            >
              {test.background_image_url ? (
                <div className="relative aspect-[16/9] max-h-44 w-full overflow-hidden">
                  <img
                    src={test.background_image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="h-2 bg-gradient-to-r from-primary-500 to-violet-600" />
              )}

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 dark:text-white">
                    {test.assessment_name}
                  </h3>
                  {test.has_attempted ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Attempted
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {test.status}
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {test.description || 'No description provided.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 dark:bg-gray-900/50">
                    <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <span>{test.total_duration_minutes} mins</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 dark:bg-gray-900/50">
                    <Layers className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <span>{test.round_count} rounds</span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => handleLeaderboard(test.id)}
                    disabled={!test.results_published}
                    title={
                      test.results_published
                        ? 'View leaderboard'
                        : 'Leaderboard available after results are published'
                    }
                    className="w-full rounded-xl border-gray-200 dark:border-gray-700"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Button>
                  {test.has_attempted && test.results_published ? (
                    <Button
                      variant="outline"
                      onClick={() => handleViewResults(test.id)}
                      className="w-full rounded-xl border-gray-200 dark:border-gray-700"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => handleStart(test.id)}
                    disabled={startingId === test.id || authLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md hover:opacity-95 focus-visible:ring-primary-500"
                  >
                    {startingId === test.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Opening…
                      </span>
                    ) : test.has_attempted ? (
                      'View Instructions'
                    ) : (
                      'Start Practice Test'
                    )}
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
