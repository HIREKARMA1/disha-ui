"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, Trophy, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MockTestCard } from './MockTestCard'
import { MockTestResult } from './MockTestResult'
import { usePublishedMockTests } from '@/hooks/useMockTest'
import { MockTest, SubmitMockAttemptResponse } from '@/types/mockTest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton, CardSkeleton, StatsSkeleton } from '@/components/ui/LoadingSkeleton'

type ViewState = 'dashboard' | 'result'

const SUBMITTED_KEY = 'submitted_mock_tests'
const resultKey = (id: string) => `mock_result_${id}`

export function MockTestDashboard() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null)
  const [examResult, setExamResult] = useState<SubmitMockAttemptResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [submittedTests, setSubmittedTests] = useState<Set<string>>(new Set())
  const [testResults, setTestResults] = useState<Map<string, SubmitMockAttemptResponse>>(new Map())
  const [isClient, setIsClient] = useState(false)

  const { data: mockTests, isLoading, error } = usePublishedMockTests(debouncedSearch || undefined)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (!isClient) return

    const saved = localStorage.getItem(SUBMITTED_KEY)
    if (!saved) return

    try {
      const ids: string[] = JSON.parse(saved)
      setSubmittedTests(new Set(ids))

      const resultsMap = new Map<string, SubmitMockAttemptResponse>()
      ids.forEach((id) => {
        const raw = localStorage.getItem(resultKey(id))
        if (!raw) return
        try {
          resultsMap.set(id, JSON.parse(raw))
        } catch {
          // ignore corrupt entries
        }
      })
      setTestResults(resultsMap)
    } catch {
      // ignore corrupt list
    }
  }, [isClient])

  const filteredTests = useMemo(() => {
    if (!mockTests) return []
    if (!searchTerm.trim()) return mockTests
    const q = searchTerm.toLowerCase()
    return mockTests.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.short_description?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.topics?.some((topic) => topic.toLowerCase().includes(q))
    )
  }, [mockTests, searchTerm])

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <LoadingSkeleton height="h-8" width="w-1/3" />
          <LoadingSkeleton height="h-4" width="w-1/2" />
        </div>
        <StatsSkeleton count={3} />
        <CardSkeleton count={6} />
      </div>
    )
  }

  const handleStart = (mockTest: MockTest) => {
    router.push(`/dashboard/student/mock-tests/${mockTest.id}`)
  }

  const handleViewResults = (mockTest: MockTest, result: SubmitMockAttemptResponse) => {
    setSelectedTest(mockTest)
    setExamResult(result)
    setCurrentView('result')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedTest(null)
    setExamResult(null)
  }

  if (currentView === 'result' && examResult) {
    return (
      <MockTestResult
        result={examResult}
        title={selectedTest?.title}
        onBack={handleBackToDashboard}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mock Tests
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Take timed mock exams to measure readiness and review your results.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search mock tests by title or topic..."
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
        {[
          {
            label: 'Available Tests',
            value: filteredTests.length.toString(),
            icon: Brain,
            color: 'text-blue-600',
            bgColor:
              'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20',
            borderColor: 'border-blue-200/50 dark:border-blue-700/50',
          },
          {
            label: 'Total Questions',
            value: filteredTests.reduce((sum, t) => sum + (t.questions_count || 0), 0).toString(),
            icon: Clock,
            color: 'text-green-600',
            bgColor:
              'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20',
            borderColor: 'border-green-200/50 dark:border-green-700/50',
          },
          {
            label: 'Completed',
            value: Array.from(submittedTests).filter((id) =>
              filteredTests.some((t) => t.id === id)
            ).length.toString(),
            icon: Trophy,
            color: 'text-amber-600',
            bgColor:
              'bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20',
            borderColor: 'border-amber-200/50 dark:border-amber-700/50',
          },
        ].map((stat, index) => (
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

      <div className="rounded-xl border border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="border-b border-gray-200/50 p-6 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Published Mock Tests</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <CardSkeleton count={6} />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900/20">
              <h3 className="mb-2 text-lg font-medium text-red-900 dark:text-red-100">
                Error Loading Mock Tests
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {error instanceof Error ? error.message : 'Failed to load mock tests'}
              </p>
            </div>
          ) : filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTests.map((mockTest, index) => (
                <motion.div
                  key={mockTest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <MockTestCard
                    mockTest={mockTest}
                    onStart={() => handleStart(mockTest)}
                    onViewResults={() => {
                      const result = testResults.get(mockTest.id)
                      if (result) handleViewResults(mockTest, result)
                    }}
                    isSubmitted={submittedTests.has(mockTest.id)}
                    result={testResults.get(mockTest.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/50 bg-gray-50/50 p-12 text-center dark:border-gray-700/50 dark:bg-gray-800/50">
              <Brain className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No Mock Tests Found' : 'No Published Mock Tests'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? 'Try a different search term to find available mock tests.'
                  : 'Check back later for new mock tests from your administrators.'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline" className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
