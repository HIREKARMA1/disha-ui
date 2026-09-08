import type { Metadata } from 'next'
import HomePageClient from '@/components/home/HomePageClient'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://disha.hirekarma.in'

export const metadata: Metadata = {
  title: 'Jobs & Campus Events | Disha by HireKarma',
  description:
    'Explore open jobs, internships, hackathons, and campus events on Disha — HireKarma’s opportunity hub for students.',
  keywords: [
    'campus jobs',
    'internships',
    'hackathons',
    'placement drives',
    'HireKarma',
    'Disha',
    'student opportunities',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Jobs & Campus Events | Disha by HireKarma',
    description:
      'Discover jobs and campus events in one place. Apply to roles and register for contests on Disha.',
    url: SITE_URL,
    siteName: 'Disha by HireKarma',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs & Campus Events | Disha by HireKarma',
    description:
      'Discover jobs and campus events in one place on Disha by HireKarma.',
  },
}

export default function HomePage() {
  return <HomePageClient />
}
