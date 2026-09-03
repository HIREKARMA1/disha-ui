import type { Metadata } from 'next'
import { BlogsListingPage } from '@/components/blogs/BlogPages'

export const metadata: Metadata = {
  title: 'Blogs & Career Guides | Disha by HireKarma',
  description:
    'Career insights, placement guides, resume tips, and hiring trends for students, universities, and recruiters on Disha.',
}

export default function BlogsPage() {
  return <BlogsListingPage />
}
