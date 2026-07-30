import { JobDetailPage } from '@/components/jobs/JobDetailPage'
import { config } from '@/lib/config'

interface PageProps {
  params: { companySlug: string; jobSlug: string }
}

export default function JobSlugPage({ params }: PageProps) {
  return <JobDetailPage companySlug={params.companySlug} jobSlug={params.jobSlug} />
}

export async function generateMetadata({ params }: PageProps) {
  const { companySlug, jobSlug } = params

  try {
    const res = await fetch(
      `${config.api.fullUrl}/public/jobs/by-slug/${encodeURIComponent(companySlug)}/${encodeURIComponent(jobSlug)}`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const job = await res.json()
      const company = job.company_name || job.corporate_name || companySlug.replace(/-/g, ' ')
      const description =
        typeof job.description === 'string'
          ? job.description.slice(0, 160)
          : `Apply for ${job.title} at ${company} on DISHA by HireKarma`

      return {
        title: `${job.title} at ${company} | DISHA Jobs`,
        description,
        openGraph: {
          title: `${job.title} at ${company}`,
          description,
        },
      }
    }
  } catch {
    // fall through to defaults
  }

  return {
    title: `${jobSlug.replace(/-/g, ' ')} | DISHA Jobs`,
    description: 'View job details and apply on DISHA by HireKarma',
  }
}
