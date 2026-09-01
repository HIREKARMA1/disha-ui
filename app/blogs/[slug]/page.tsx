import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetailPage } from '@/components/blogs/BlogPages'
import { getBlogBySlug, getAllBlogSlugs } from '@/data/blogs'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogBySlug(params.slug)
  if (!post) return { title: 'Blog | Disha' }
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.primaryKeyword,
  }
}

export default function BlogSlugPage({ params }: Props) {
  const post = getBlogBySlug(params.slug)
  if (!post) notFound()
  return <BlogDetailPage post={post} />
}
