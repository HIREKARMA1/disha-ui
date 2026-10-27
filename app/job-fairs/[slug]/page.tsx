'use client'

import { useParams } from 'next/navigation'
import { JobFairDetails } from '@/components/job-fairs/JobFairExperience'

export default function JobFairDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return <JobFairDetails slug={slug} />
}
