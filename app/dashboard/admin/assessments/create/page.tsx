"use client"

import { useState, useEffect, useMemo } from 'react'
import { AssessmentForm } from '@/components/admin/AssessmentForm'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'

export default function CreateAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState<string>("")

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const job = await apiClient.getJobById(jobId)
          if (job && job.title) {
            setJobTitle(job.title)
          }
        } catch (err) {
          console.error('Failed to fetch job details:', err)
          // Don't block creation if job fetch fails, just don't pre-fill
        }
      }
    }
    fetchJobDetails()
  }, [jobId])

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

  const initialData = useMemo(() => ({
    ...(jobId ? { job_id: jobId } : {}),
    ...(jobTitle ? { assessment_name: `${jobTitle} Assessment` } : {})
  }), [jobId, jobTitle])

  return (
    <AdminDashboardLayout>
      <div className="space-y-8 pb-8 w-full">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
          {/* ... */}
        </div>

        {/* ... */}

        <AssessmentForm
          onSubmit={handleSubmit}
          loading={isSubmitting}
          mode="create"
          initialData={initialData}
        />
      </div>
    </AdminDashboardLayout>
  )
}
