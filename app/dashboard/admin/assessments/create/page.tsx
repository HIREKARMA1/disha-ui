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
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/dashboard/admin/assessments" className="hover:text-blue-600 transition-colors">
                Assessments
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Create Assessment</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {jobTitle ? `Create Assessment for ${jobTitle}` : "Create New Assessment"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Configure assessment details, rounds, and settings.
            </p>
          </div>


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
