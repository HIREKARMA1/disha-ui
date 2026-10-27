'use client'

import { useParams } from 'next/navigation'
import { JobFairEditor } from '@/components/admin/JobFairManager'

export default function EditJobFairPage() {
  const params = useParams<{ id: string }>()
  return <JobFairEditor fairId={params.id} />
}
