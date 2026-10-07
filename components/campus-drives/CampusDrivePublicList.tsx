'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { Input } from '@/components/ui/input'
import {
  CampusDriveTicketCard,
  type CampusDriveCardStatus,
} from '@/components/campus-drives/CampusDriveTicketCard'
import gridStyles from '@/components/campus-drives/CampusDriveTicketCard.module.css'
import { campusDriveService } from '@/services/campusDriveService'
import type { CampusDriveListItem } from '@/types/campusDrive'
import {
  driveCardCompanyLine,
  driveCardLocationProps,
} from '@/lib/utils/driveCardDisplay'

function modeLabel(mode?: string | null) {
  if (mode === 'online') return 'Online'
  if (mode === 'offline') return 'Offline'
  if (mode === 'hybrid') return 'Hybrid'
  return null
}

function programStatus(item: CampusDriveListItem): CampusDriveCardStatus {
  const now = Date.now()
  const start = Date.parse(item.event_start_date)
  const end = item.event_end_date ? Date.parse(item.event_end_date) : NaN
  if (Number.isFinite(end) && end < now) return 'closed'
  if (
    Number.isFinite(start) &&
    start <= now &&
    (!Number.isFinite(end) || end >= now)
  ) {
    return 'live'
  }
  if (item.registration_status === 'closed') return 'closed'
  return 'open'
}

function PublicCampusDriveCard({ item }: { item: CampusDriveListItem }) {
  const slug = item.slug?.trim()
  const detailHref = slug ? `/campus-drives/${encodeURIComponent(slug)}` : '/campus-drives'
  const applyHref = slug
    ? `/campus-drives/${encodeURIComponent(slug)}?register=1`
    : detailHref
  const company = driveCardCompanyLine({
    title: item.title,
    organizerName: item.organizer_name,
    subtitle: item.subtitle,
  })
  const imageSrc = item.banner_url || item.organizer_logo_url || undefined

  return (
    <CampusDriveTicketCard
      brandName={company || item.title}
      title={item.title}
      companyLine={company}
      imageSrc={imageSrc ?? undefined}
      imageAlt={item.title}
      dateIso={item.event_start_date}
      {...driveCardLocationProps(item.venue, item.mode)}
      modeLabel={modeLabel(item.mode) ?? undefined}
      status={programStatus(item)}
      detailHref={detailHref}
      applyHref={applyHref}
      showApply={(item.listing_status ?? 'active') !== 'hidden'}
    />
  )
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
            <p className="text-sm text-gray-500">
              Published programs you can open, with their selected jobs.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-16 text-center text-sm text-gray-500">
            No campus drives are visible for your account.
          </p>
        ) : (
          <div className={gridStyles.campusDriveGrid}>
            {items.map((item) => (
              <PublicCampusDriveCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
