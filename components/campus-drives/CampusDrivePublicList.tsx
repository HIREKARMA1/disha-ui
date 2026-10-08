'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    campusDriveService
      .listPublic({ limit: 24 })
      .then((result) => {
        if (active) setItems(result.campus_drives)
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-gray-50 dark:bg-gray-900">
      <DishaTopBar showSearch={false} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Campus Drives
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Published programs you can open, with their selected jobs.
          </p>
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
