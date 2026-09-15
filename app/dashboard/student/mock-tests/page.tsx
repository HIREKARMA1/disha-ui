"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  Search,
  Trophy,
  X,
  BarChart3,
  Medal,
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

interface TopPerformerHighlight {
  mock_test_id: string
  assessment_name: string
  background_image_url?: string | null
  results_published?: boolean
  top_performer?: {
    rank: number
    student_name: string
    total_score?: number | null
    max_score?: number | null
    percentage?: number | null
  } | null
}

const cardTone = (index: number) => {
  const tones = [
    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700',
    'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
    'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700',
    'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700',
  ]
  return tones[index % tones.length]
}

function formatPerformerScore(p: NonNullable<TopPerformerHighlight['top_performer']>) {
  if (typeof p.total_score === 'number' && typeof p.max_score === 'number' && p.max_score > 0) {
    return `${p.total_score}/${p.max_score}`
  }
  if (typeof p.percentage === 'number') return `${p.percentage.toFixed(1)}%`
  if (typeof p.total_score === 'number') return String(p.total_score)
  return null
}

export default function StudentMockTestsPage() {
  const router = useRouter()
  const carouselRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user } = useAuth()
  const { openLoginModal } = useAuthLoginModal()

  const [mockTests, setMockTests] = useState<StudentMockTest[]>([])
  const [highlights, setHighlights] = useState<TopPerformerHighlight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
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
      console.error('Failed to load mock tests:', err)
      setError(
        err?.response?.data?.detail || err?.message || 'Failed to load mock tests'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMockTests()
  }, [fetchMockTests])

  const filteredTests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return mockTests
    return mockTests.filter(
      (test) =>
        test.assessment_name.toLowerCase().includes(term) ||
        (test.description || '').toLowerCase().includes(term)
    )
  }, [mockTests, searchTerm])

  const completedCount = useMemo(
    () => mockTests.filter((test) => test.has_attempted).length,
    [mockTests]
  )

  const bannerImage = useMemo(() => {
    const withImage = mockTests.find((t) => t.background_image_url)
    return withImage?.background_image_url || null
  }, [mockTests])

  const handleStart = (mockTestId: string) => {
    const startPath = `/assessments/exam/${mockTestId}`
    if (!isAuthenticated || user?.user_type !== 'student') {
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
    router.push(`/dashboard/student/mock-tests/${mockTestId}/results`)
  }

  const handleLeaderboard = (mockTestId: string) => {
    router.push(`/dashboard/student/mock-tests/${mockTestId}/leaderboard`)
  }

  const handleTopPerformers = (mockTestId: string) => {
    router.push(`/dashboard/student/mock-tests/${mockTestId}/top-performers`)
  }

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 320), behavior: 'smooth' })
  }

  const stats = [
    {
      label: 'Available Tests',
      value: mockTests.length,
      icon: Brain,
      color: 'text-blue-600',
      bgColor:
        'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50',
    },
    {
      label: 'Total Rounds',
      value: mockTests.reduce((sum, test) => sum + (test.round_count || 0), 0),
      icon: Layers,
      color: 'text-green-600',
      bgColor:
        'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200/50 dark:border-green-700/50',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: Trophy,
      color: 'text-amber-600',
      bgColor:
        'bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20',
      borderColor: 'border-amber-200/50 dark:border-amber-700/50',
    },
  ]

  return (
    <StudentDashboardLayout>
      <div className="space-y-6">
          {/* Main Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-700">
            {bannerImage ? (
              <div className="relative min-h-[140px] sm:min-h-[180px]">
                <img
                  src={bannerImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/60 to-transparent" />
                <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
                  <h1 className="text-2xl font-bold text-white md:text-3xl">Mock Tests</h1>
                  <p className="mt-2 max-w-xl text-sm text-primary-100 sm:text-base">
                    Take full-length timed mock tests and review how ready you are.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-8 dark:from-primary-900/20 dark:to-primary-800/20 sm:px-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                  Mock Tests
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300 sm:text-lg">
                  Take full-length timed mock tests and review how ready you are.
                </p>
              </div>
            )}
          </div>

          {/* Top Performer Carousel */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performers
                </h2>
              </div>
              {highlights.length > 1 ? (
                <div className="hidden gap-1 sm:flex">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => scrollCarousel(-1)}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => scrollCarousel(1)}
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>

            {isLoading ? (
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-36 w-[260px] shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
                  />
                ))}
              </div>
            ) : highlights.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Top performers will appear here after results are published.
              </div>
            ) : (
              <div
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {highlights.map((item, index) => {
                  const scoreLabel = item.top_performer
                    ? formatPerformerScore(item.top_performer)
                    : null
                  return (
                    <button
                      key={item.mock_test_id}
                      type="button"
                      onClick={() => {
                        if (item.results_published) {
                          handleTopPerformers(item.mock_test_id)
                        }
                      }}
                      disabled={!item.results_published}
                      className={cn(
                        'w-[min(85vw,280px)] shrink-0 rounded-xl border p-4 text-left transition-all',
                        cardTone(index),
                        item.results_published
                          ? 'cursor-pointer hover:shadow-md'
                          : 'cursor-not-allowed opacity-80'
                      )}
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {item.assessment_name}
                      </p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                        Top Performer
                      </p>
                      {item.results_published && item.top_performer ? (
                        <div className="mt-3">
                          <p className="truncate font-medium text-gray-800 dark:text-gray-100">
                            {item.top_performer.student_name}
                          </p>
                          {scoreLabel ? (
                            <p className="mt-0.5 text-sm tabular-nums text-gray-600 dark:text-gray-300">
                              {scoreLabel}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          Results not published yet
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Search + stats (preserved) */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mock tests by name..."
              className="pl-10 pr-10"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <div
                  className={`rounded-xl border p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${stat.bgColor} ${stat.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isLoading ? (
                          <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3 shadow-sm dark:bg-gray-800/60">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          ) : null}

          {/* Mock Test cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-24 text-center dark:border-gray-700 dark:bg-gray-900/30">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm dark:bg-gray-800">
                <Brain className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                No mock tests available
              </h3>
              <p className="mx-auto max-w-sm text-gray-500 dark:text-gray-300">
                {mockTests.length === 0
                  ? 'Your administrator has not published any mock tests yet. Check back soon.'
                  : 'No mock tests match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  id={`mock-test-card-${test.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${cardTone(index)}`}
                >
                  {test.background_image_url ? (
                    <div className="relative aspect-[16/9] max-h-40 w-full overflow-hidden border-b border-black/5 dark:border-white/10">
                      <img
                        src={test.background_image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                    </div>
                  ) : null}

                  <div className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {test.assessment_name}
                      </h3>
                      {test.has_attempted ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Attempted
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {test.status}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                      {test.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="truncate">{test.total_duration_minutes} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="truncate">{test.round_count} Rounds</span>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-5">
                      <Button
                        variant="outline"
                        onClick={() => handleLeaderboard(test.id)}
                        disabled={!test.results_published}
                        title={
                          test.results_published
                            ? 'View leaderboard'
                            : 'Leaderboard available after results are published'
                        }
                        className="w-full"
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                      </Button>
                      {test.has_attempted && test.results_published ? (
                        <Button
                          variant="outline"
                          onClick={() => handleViewResults(test.id)}
                          className="w-full"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      ) : null}
                      <Button
                        onClick={() => handleStart(test.id)}
                        disabled={startingId === test.id}
                        className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-95"
                      >
                        {startingId === test.id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Opening…
                          </span>
                        ) : test.has_attempted ? (
                          'View Instructions'
                        ) : (
                          'Start Mock Test'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>
    </StudentDashboardLayout>
  )
}
