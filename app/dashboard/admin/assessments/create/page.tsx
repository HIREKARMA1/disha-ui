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

      const response = await apiClient.post('/api/v1/admin/assessments/create', formData)

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/assessments">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
            <p className="text-gray-600 mt-1">Set up a new assessment with multiple rounds</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <AssessmentForm
            onSubmit={handleSubmit}
            loading={isSubmitting}
            mode="create"
          />
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
