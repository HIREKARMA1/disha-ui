"use client"

import { useParams, useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { MockTestExam } from '@/components/mock-test/MockTestExam'
import { MockTestResult } from '@/components/mock-test/MockTestResult'
import { useMockTestDetail } from '@/hooks/useMockTest'
import { SubmitMockAttemptResponse } from '@/types/mockTest'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const SUBMITTED_KEY = 'submitted_mock_tests'
const resultKey = (id: string) => `mock_result_${id}`

function saveMockResult(mockTestId: string, result: SubmitMockAttemptResponse) {
  const existing = localStorage.getItem(SUBMITTED_KEY)
  const submitted: string[] = existing ? JSON.parse(existing) : []
  if (!submitted.includes(mockTestId)) {
    submitted.push(mockTestId)
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(submitted))
  }
  localStorage.setItem(resultKey(mockTestId), JSON.stringify(result))
}

export default function StudentMockTestExamPage() {
  const params = useParams()
  const router = useRouter()
  const mockTestId = params.id as string
  const [completedResult, setCompletedResult] = useState<SubmitMockAttemptResponse | null>(null)

  const { data: mockTest, isLoading, error } = useMockTestDetail(mockTestId)

  const handleBack = () => {
    router.push('/dashboard/student/mock-tests')
  }

  const handleComplete = (result: SubmitMockAttemptResponse) => {
    saveMockResult(mockTestId, result)
    setCompletedResult(result)
  }

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading mock test...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (error || !mockTest) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mock Test Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error instanceof Error
                ? error.message
                : 'The mock test you are trying to access could not be found or is no longer available.'}
            </p>
            <Button
              onClick={handleBack}
              className="bg-gradient-to-r from-primary-500 to-secondary-500"
            >
              Browse Mock Tests
            </Button>
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (!mockTest.questions || mockTest.questions.length === 0) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Questions Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This mock test does not have any questions yet. Please contact your administrator.
            </p>
            <Button
              onClick={handleBack}
              className="bg-gradient-to-r from-primary-500 to-secondary-500"
            >
              Browse Mock Tests
            </Button>
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (completedResult) {
    return (
      <StudentDashboardLayout>
        <MockTestResult
          result={completedResult}
          title={mockTest.title}
          onBack={handleBack}
        />
      </StudentDashboardLayout>
    )
  }

  return (
    <MockTestExam
      mockTest={mockTest}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  )
}
