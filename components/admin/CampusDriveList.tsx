'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { campusDriveService, apiErrorMessage } from '@/services/campusDriveService'
import type { CampusDriveListItem } from '@/types/campusDrive'
import { REGISTRATION_STATUS_LABELS } from '@/types/campusDrive'
import { CATEGORY_LABELS, EVENT_CATEGORIES } from '@/types/contestEvent'
import { toast } from 'react-hot-toast'
import { AssignCampusDriveUniversityModal } from './AssignCampusDriveUniversityModal'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function CampusDriveList() {
  const [items, setItems] = useState<CampusDriveListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ publication_status: 'all', visibility: 'all', category: 'all', registration: 'all' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total_pages: 1, total_count: 0, has_next: false, has_prev: false })
  const [busy, setBusy] = useState<string | null>(null)
  const [showAssignUniversityModal, setShowAssignUniversityModal] = useState(false)
  const [campusDriveToAssign, setCampusDriveToAssign] = useState<CampusDriveListItem | null>(null)

  const load = useCallback(async (nextPage = 1) => {
    setLoading(true)
    try {
      const result = await campusDriveService.listAdmin({
        page: nextPage,
        limit: 12,
        search: search || undefined,
        publication_status: filters.publication_status !== 'all' ? filters.publication_status : undefined,
        visibility: filters.visibility !== 'all' ? filters.visibility : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        registration: filters.registration !== 'all' ? filters.registration : undefined,
        sort_by: 'created_at',
      })
      setItems(result.campus_drives)
      setPage(result.page)
      setPagination({
        total_pages: result.total_pages,
        total_count: result.total_count,
        has_next: result.has_next,
        has_prev: result.has_prev,
      })
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load campus drives'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, filters])

  useEffect(() => {
    void load(1)
  }, [load])

  const run = async (
    id: string,
    action: 'publish' | 'unpublish' | 'delete' | 'notify',
  ) => {
    if (action === 'delete' && !window.confirm('Delete this campus drive?')) return
    setBusy(`${id}-${action}`)
    try {
      if (action === 'publish') await campusDriveService.publish(id)
      if (action === 'unpublish') await campusDriveService.unpublish(id)
      if (action === 'delete') await campusDriveService.remove(id)
      if (action === 'notify') await campusDriveService.notify(id)
      toast.success(action === 'delete' ? 'Campus Drive deleted' : action === 'publish' ? 'Campus Drive published' : 'Campus Drive moved to draft')
      await load(page)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Action failed'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Drive</h1>
          <p className="text-sm text-gray-500">Create and publish campus drive programs with selected jobs.</p>
        </div>
        <Link href="/dashboard/admin/campus-drives/create">
          <Button><Plus className="mr-2 h-4 w-4" /> Create Campus Drive</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campus drives" className="pl-9" />
        </div>
        <Select value={filters.publication_status} onValueChange={(value) => setFilters((current) => ({ ...current, publication_status: value }))}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.visibility} onValueChange={(value) => setFilters((current) => ({ ...current, visibility: value }))}>
          <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="public">Everyone</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EVENT_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.registration} onValueChange={(value) => setFilters((current) => ({ ...current, registration: value }))}>
          <SelectTrigger className="md:col-span-1"><SelectValue placeholder="Registration" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registration</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="not_started">Not started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-gray-600">
          <h2 className="text-lg font-semibold">No campus drives yet</h2>
          <p className="mt-2 text-sm text-gray-500">Create a draft, add jobs, then publish it.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-40 dark:bg-gray-900">
                  {item.banner_url || item.organizer_logo_url ? (
                    <img src={item.banner_url || item.organizer_logo_url || ''} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-700">
                      {item.publication_status || 'draft'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {CATEGORY_LABELS[item.category || ''] || item.category || 'Uncategorized'}
                    {' · '}
                    {(item.visibility_labels || []).join(', ') || 'None'}
                    {' · '}
                    {item.job_count} selected job{item.job_count === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Start {formatDate(item.event_start_date)} · End {formatDate(item.event_end_date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Registration {REGISTRATION_STATUS_LABELS[item.registration_status || ''] || item.registration_status}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/dashboard/admin/campus-drives/${item.id}`}><Button size="sm" variant="outline">View</Button></Link>
                    <Link href={`/dashboard/admin/campus-drives/${item.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCampusDriveToAssign(item)
                        setShowAssignUniversityModal(true)
                      }}
                    >
                      Assign University
                    </Button>

                    {item.publication_status === 'published' ? (
                      <Button size="sm" variant="outline" disabled={busy === `${item.id}-unpublish`} onClick={() => void run(item.id, 'unpublish')}>Unpublish</Button>
                    ) : (
                      <Button size="sm" disabled={busy === `${item.id}-publish`} onClick={() => void run(item.id, 'publish')}>Publish</Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-600" disabled={busy === `${item.id}-delete`} onClick={() => void run(item.id, 'delete')}>Delete</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === `${item.id}-notify`}
                      onClick={() => void run(item.id, 'notify')}
                    >
                      Notify
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AssignCampusDriveUniversityModal
        isOpen={showAssignUniversityModal}
        onClose={() => {
          setShowAssignUniversityModal(false)
          setCampusDriveToAssign(null)
        }}
        campusDrive={campusDriveToAssign}
        onAssigned={() => {
          void load(page)
        }}
      />

      {pagination.total_pages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row dark:border-gray-700 dark:bg-gray-800">
          <span className="text-sm text-gray-500">{pagination.total_count} campus drives · Page {page} of {pagination.total_pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={() => void load(page - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={() => void load(page + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
