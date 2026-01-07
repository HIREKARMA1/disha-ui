"use client"

import { useState } from 'react'
import { AssessmentForm } from '@/components/admin/AssessmentForm'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

export default function CreateAssessmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await apiClient.createAssessment(formData)

      if (response.id || response.assessment_id) {
        // Success - redirect to list
        router.push('/dashboard/admin/assessments')
      }
    } catch (err: any) {
      console.error('Failed to create assessment:', err)
      setError(err.message || 'Failed to create assessment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-8 pb-8 w-full">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin/assessments"
              className="bg-white hover:bg-white/80 p-2.5 rounded-xl transition-all border border-gray-200 shadow-sm"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Create New Assessment</h1>
              <p className="text-gray-600 dark:text-gray-300">Set up a comprehensive evaluation with multiple rounds</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form - No inner wrapper needed as component handles it */}
        <AssessmentForm
          onSubmit={handleSubmit}
          loading={isSubmitting}
          mode="create"
        />
      </div>
    </AdminDashboardLayout>
  )
}
