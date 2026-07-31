"use client"

import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { JobDetailView } from '@/components/jobs/JobDetailView'
import { Loader2 } from 'lucide-react'

function JobDetailPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const company = decodeURIComponent(String(params?.company || ''))
  const jobSlug = decodeURIComponent(String(params?.jobSlug || ''))
  const fallbackId = searchParams.get('id')

  return (
    <JobDetailView
      companySlug={company}
      jobSlug={jobSlug}
      fallbackJobId={fallbackId}
    />
  )
}

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] dark:bg-[#0a0c14]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      }
    >
      <JobDetailPageInner />
    </Suspense>
  )
}
