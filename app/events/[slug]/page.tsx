import { EventDetailPage } from '@/components/events/EventDetailPage'

interface PageProps {
  params: { slug: string }
}

export default function EventSlugPage({ params }: PageProps) {
  return <EventDetailPage slug={params.slug} />
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `${params.slug.replace(/-/g, ' ')} | DISHA Events`,
    description: 'View event details and register on DISHA by HireKarma',
  }
}
