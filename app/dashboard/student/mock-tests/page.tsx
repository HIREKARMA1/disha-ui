"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import {
  Brain,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Search,
  Trophy,
  X,
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

export default function StudentMockTestsPage() {
  const router = useRouter()

  const [mockTests, setMockTests] = useState<StudentMockTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [startingId, setStartingId] = useState<string | null>(null)

  const fetchMockTests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.getStudentMockTests()
      setMockTests(Array.isArray(data) ? data : [])
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

  // Reuse the standard assessment entry flow: instructions, camera check, then exam.
  const handleStart = (mockTestId: string) => {
    setStartingId(mockTestId)
    router.push(`/assessments/exam/${mockTestId}`)
  }

  const handleViewResults = (mockTestId: string) => {
    router.push(`/dashboard/student/mock-tests/${mockTestId}/results`)
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
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mock Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Take full-length timed mock tests and review how ready you are.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search mock tests by name..."
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${cardTone(index)}`}
              >
                {test.background_image_url ? (
                  <div className="relative w-full overflow-hidden border-b border-black/5 dark:border-white/10 aspect-[16/9] max-h-40">
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
