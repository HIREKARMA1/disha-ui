import { JobFairAnalytics } from '@/components/admin/JobFairAnalytics'

export default function JobFairAnalyticsPage({ params }: { params: { id: string } }) {
  return <JobFairAnalytics fairId={params.id} />
}
