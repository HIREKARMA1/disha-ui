"use client"

import { useState } from 'react'
import { AssessmentForm } from '@/components/admin/AssessmentForm'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

export default function CreateMockTestPage() {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await apiClient.createMockTest(formData)

      const rid = response?.id || response?.assessment_id
      if (rid) {
        router.push(`/dashboard/admin/mock-tests/${rid}?created=1`)
      }
    } catch (err: any) {
      console.error('Failed to create mock test:', err)
      setError(
        err?.response?.data?.detail || err?.message || 'Failed to create mock test'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-8 pb-8 w-full">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Link href="/dashboard/admin/mock-tests" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Mock Tests
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">Create Mock Test</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Mock Test
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Configure mock test details, rounds, and settings.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <AssessmentForm
          onSubmit={handleSubmit}
          loading={isSubmitting}
          mode="create"
          variant="mock-test"
        />
      </div>
    </AdminDashboardLayout>
  )
}
