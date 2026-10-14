export type BlogBlockType = 'paragraph' | 'heading' | 'list'

export interface BlogBlock {
  type: BlogBlockType
  text: string
  level?: 2 | 3 | null
  items: string[]
}

export interface BlogRecord {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url?: string | null
  published_on?: string | null
  author_name: string
  author_photo_url?: string | null
  author_role: string
  author_bio: string
  category_label: string
  blocks: BlogBlock[]
  share_title: string
  share_description: string
  related_title: string
  related_products: string
  cta_label: string
  publication_status: string
  listing_status: string
  created_at?: string | null
  updated_at?: string | null
}

export interface BlogListResponse {
  blogs: BlogRecord[]
  total_count: number
  page: number
  limit: number
  total_pages: number
}

export interface BlogWritePayload {
  title: string
  excerpt: string
  cover_image_url?: string | null
  published_on?: string | null
  author_name: string
  author_photo_url?: string | null
  author_role: string
  author_bio: string
  category_label: string
  blocks: BlogBlock[]
  share_title: string
  share_description: string
  related_title: string
  related_products: string
  cta_label: string
}

export function emptyBlogForm(): BlogWritePayload {
  return {
    title: '',
    excerpt: '',
    cover_image_url: '',
    published_on: '',
    author_name: '',
    author_photo_url: '',
    author_role: '',
    author_bio: '',
    category_label: 'Blogs',
    blocks: [{ type: 'paragraph', text: '', items: [] }],
    share_title: 'Loved this insight?',
    share_description: '',
    related_title: 'Related products',
    related_products: 'SolviqAI · Disha · Lakshya · Shortlisted',
    cta_label: 'Explore our jobs',
  }
}
