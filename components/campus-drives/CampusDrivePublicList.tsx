'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Eye, Loader2, MapPin, Search } from 'lucide-react'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { campusDriveService } from '@/services/campusDriveService'
import type { CampusDriveListItem } from '@/types/campusDrive'
import { CATEGORY_LABELS } from '@/types/contestEvent'
import { sanitizeEventDescriptionHtml, stripHtmlToPlainText } from '@/lib/sanitizeHtml'

const VIEW_LABEL = 'View'

function cardText(value?: string | null) {
  if (!value) return ''
  return stripHtmlToPlainText(sanitizeEventDescriptionHtml(value, ''))
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function modeLabel(mode?: string | null) {
  if (mode === 'online') return 'Online'
  if (mode === 'offline') return 'Offline'
  return null
}

export function CampusDrivePublicList() {
  const [items, setItems] = useState<CampusDriveListItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setLoading(true)
      campusDriveService
        .listPublic({ search: search || undefined, limit: 24 })
        .then((result) => setItems(result.campus_drives))
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(handle)
  }, [search])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DishaTopBar searchPlaceholder="Search campus drives, jobs, events…" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Drives</h1>
            <p className="text-sm text-gray-500">Published programs you can open, with their selected jobs.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="pl-9" />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-16 text-center text-sm text-gray-500">No campus drives are visible for your account.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const href = item.slug ? `/campus-drives/${encodeURIComponent(item.slug)}` : null
              const when = formatDate(item.event_start_date)
              const mode = modeLabel(item.mode)
              const description = cardText(item.short_description)
              return (
                <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-900">
                    {(item.banner_url || item.organizer_logo_url) && (
                      <img src={item.banner_url || item.organizer_logo_url || ''} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {href ? (
                        <Link href={href} className="hover:text-primary-600">{item.title}</Link>
                      ) : (
                        item.title
                      )}
                    </h2>
                    <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.category || ''] || item.category}</p>
                    {description ? (
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                    ) : null}
                    <div className="space-y-1 text-xs text-gray-500">
                      {when && (
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{when}</span>
                        </p>
                      )}
                      {mode && <p>{mode}</p>}
                      {item.venue && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.venue}</span>
                        </p>
                      )}
                    </div>
                    <div className="mt-auto pt-2">
                      {href ? (
                        <Button asChild variant="outline" size="sm" className="h-9 w-full sm:h-8 sm:w-auto">
                          <Link href={href}>
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            {VIEW_LABEL}
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
