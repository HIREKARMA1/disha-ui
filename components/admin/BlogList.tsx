'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blogErrorMessage, blogService } from '@/services/blogService'
import type { BlogRecord } from '@/types/blog'

function rowStatus(item: BlogRecord) {
  if (item.publication_status !== 'published') return 'Draft'
  if (item.listing_status === 'inactive') return 'Inactive'
  return 'Active'
}

function formatDate(value?: string | null) {
  if (!value) return 'No date'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function BlogList() {
  const [items, setItems] = useState<BlogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async (nextPage = 1) => {
    setLoading(true)
    try {
      const result = await blogService.listAdmin({
        page: nextPage,
        limit: 12,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
      })
      setItems(result.blogs)
      setPage(result.page)
      setTotalPages(result.total_pages)
    } catch (err) {
      toast.error(blogErrorMessage(err, 'Could not load blogs'))
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    void load(1)
  }, [load])

  const run = async (id: string, action: 'publish' | 'unpublish' | 'active' | 'inactive' | 'delete') => {
    if (action === 'delete' && !window.confirm('Delete this blog?')) return
    setBusy(`${id}-${action}`)
    try {
      if (action === 'publish') await blogService.publish(id)
      else if (action === 'unpublish') await blogService.unpublish(id)
      else if (action === 'active') await blogService.setListing(id, 'active')
      else if (action === 'inactive') await blogService.setListing(id, 'inactive')
      else await blogService.remove(id)
      toast.success(
        action === 'publish'
          ? 'Blog published'
          : action === 'unpublish'
            ? 'Blog unpublished'
            : action === 'delete'
              ? 'Blog deleted'
              : action === 'inactive'
                ? 'Blog hidden from the public page'
                : 'Blog is active on the public page',
      )
      await load(page)
    } catch (err) {
      toast.error(blogErrorMessage(err, 'Could not update this blog'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blogs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a blog here. After you publish it, and it is active, it shows on the HireKarma resources page.
          </p>
        </div>
        <Link href="/dashboard/admin/blogs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create blog
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
            className="pl-10"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No blogs yet</h2>
          <p className="mt-1 text-sm text-gray-500">Create the first blog, then publish it when it is ready.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const statusLabel = rowStatus(item)
            const published = item.publication_status === 'published'
            return (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:flex-row"
              >
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-44 dark:bg-gray-800">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.excerpt || 'No excerpt yet'}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.author_name || 'No author'} · {formatDate(item.published_on)} · {item.category_label || 'Blogs'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/dashboard/admin/blogs/${item.id}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                    {published ? (
                      <Button size="sm" variant="outline" disabled={busy === `${item.id}-unpublish`} onClick={() => void run(item.id, 'unpublish')}>
                        Unpublish
                      </Button>
                    ) : (
                      <Button size="sm" disabled={busy === `${item.id}-publish`} onClick={() => void run(item.id, 'publish')}>
                        Publish
                      </Button>
                    )}
                    {published && item.listing_status === 'active' ? (
                      <Button size="sm" variant="outline" disabled={busy === `${item.id}-inactive`} onClick={() => void run(item.id, 'inactive')}>
                        Inactive
                      </Button>
                    ) : null}
                    {published && item.listing_status !== 'active' ? (
                      <Button size="sm" variant="outline" disabled={busy === `${item.id}-active`} onClick={() => void run(item.id, 'active')}>
                        Active
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      disabled={busy === `${item.id}-delete`}
                      onClick={() => void run(item.id, 'delete')}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => void load(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => void load(page + 1)}>Next</Button>
        </div>
      ) : null}
    </div>
  )
}
