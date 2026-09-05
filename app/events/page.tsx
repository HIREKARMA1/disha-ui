"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { MobileFilterBottomSheet } from '@/components/ui/MobileFilterBottomSheet'
import { EventsPortalHeader } from '@/components/events/portal/EventsPortalHeader'
import { EventsFilterSidebar, type StatusCounts } from '@/components/events/portal/EventsFilterSidebar'
import { EventsContentTabs, type EventsTab } from '@/components/events/portal/EventsContentTabs'
import { ContestCard } from '@/components/events/EventCard'
import { ContestCardSkeleton } from '@/components/events/portal/ContestCardSkeleton'
import { EventsEmptyState } from '@/components/events/portal/EventsEmptyState'
import { EventsPortalAdCard } from '@/components/events/portal/EventsAdSidebar'
import { EventsCreateEventPanel } from '@/components/events/portal/EventsCreateEventPanel'
import { contestEventService } from '@/services/contestEventService'
import { advertisementService } from '@/services/advertisementService'
import type { ContestEventListItem } from '@/types/contestEvent'
import type { Advertisement } from '@/types/advertisement'
import {
  PORTAL_STATUS_OPTIONS,
  type PortalStatusFilter,
} from '@/lib/eventsPortalConfig'
import { cn } from '@/lib/utils'

/** Preferred left-column order: Disha → Shortlisted → Lakshya. */
const LEFT_AD_ORDER = ['disha', 'shortlisted', 'lakshya'] as const

/** Static Disha promo when ads API has no Disha entry (events page is on Disha). */
const DISHA_SIDEBAR_AD: Advertisement = {
  id: 'static-disha-promo',
  title: 'Disha',
  description:
    "Disha is HireKarma's campus placement and college engagement platform — connecting students, universities, and recruiters in one hiring flow with jobs, events, and drive management.",
  image_url: 'https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/disha_hero_img.jpg',
  redirect_url: '/',
  button_text: 'Learn More',
  display_order: 0,
  placement: 'left_sidebar',
  page_type: 'events',
  is_active: true,
  created_by: '',
  tenant_id: '',
  created_at: '',
  updated_at: '',
}

/** Collect sidebar ads and sort Disha → Shortlisted → Lakshya, then any remaining. */
function getLeftSidebarAds(ads: Advertisement[]): Advertisement[] {
  const sideAds = ads.filter(
    (a) => a.placement === 'left_sidebar' || a.placement === 'right_sidebar'
  )
  const ranked: Advertisement[] = []
  for (const key of LEFT_AD_ORDER) {
    if (key === 'disha') {
      const fromApi = sideAds.find((a) => a.title.toLowerCase().includes('disha'))
      ranked.push(fromApi ?? DISHA_SIDEBAR_AD)
      continue
    }
    const match = sideAds.find((a) => a.title.toLowerCase().includes(key))
    if (match && !ranked.some((r) => r.id === match.id)) ranked.push(match)
  }
  const rankedIds = new Set(ranked.map((a) => a.id))
  return [...ranked, ...sideAds.filter((a) => !rankedIds.has(a.id))]
}

function EventsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ads, setAds] = useState<Advertisement[]>([])
  const [activeTab, setActiveTab] = useState<EventsTab>('all')
  const [status, setStatus] = useState<PortalStatusFilter>(
    (searchParams.get('status') as PortalStatusFilter) || 'all'
  )
  const [draftStatus, setDraftStatus] = useState<PortalStatusFilter>(
    (searchParams.get('status') as PortalStatusFilter) || 'all'
  )
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0,
    open: 0,
    live: 0,
    completed: 0,
    closed: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false,
  })

  const page = parseInt(searchParams.get('page') || '1', 10)

  const leftAds = useMemo(() => getLeftSidebarAds(ads), [ads])
  const activeFilterCount = status !== 'all' ? 1 : 0

  const fetchStatusCounts = useCallback(async () => {
    const registeredOnly = activeTab === 'registered'
    try {
      const [allRes, openRes, liveRes, completedRes, closedRes] = await Promise.all([
        contestEventService.listPublicEvents({ limit: 1, page: 1, registered_only: registeredOnly }),
        contestEventService.listPublicEvents({
          limit: 1,
          page: 1,
          status: 'open',
          registered_only: registeredOnly,
        }),
        contestEventService.listPublicEvents({
          limit: 1,
          page: 1,
          status: 'live',
          registered_only: registeredOnly,
        }),
        contestEventService.listPublicEvents({
          limit: 1,
          page: 1,
          status: 'completed',
          registered_only: registeredOnly,
        }),
        contestEventService.listPublicEvents({
          limit: 1,
          page: 1,
          status: 'closed',
          registered_only: registeredOnly,
        }),
      ])
      setStatusCounts({
        all: allRes.total_count,
        open: openRes.total_count,
        live: liveRes.total_count,
        completed: completedRes.total_count,
        closed: closedRes.total_count,
      })
    } catch {
      setStatusCounts({ all: 0, open: 0, live: 0, completed: 0, closed: 0 })
    }
  }, [activeTab])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const result = await contestEventService.listPublicEvents({
        page,
        limit: 50,
        status: status !== 'all' ? status : undefined,
        registered_only: activeTab === 'registered',
      })
      setEvents(result.events)
      setPagination({
        page: result.page,
        total_pages: result.total_pages,
        total_count: result.total_count,
        has_next: result.has_next,
        has_prev: result.has_prev,
      })
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, status, activeTab])

  const fetchAds = useCallback(async () => {
    try {
      const result = await advertisementService.listPublic({ page: 'events' })
      setAds(result.advertisements)
    } catch {
      setAds([])
    }
  }, [])

  useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  useEffect(() => {
    const urlStatus = (searchParams.get('status') as PortalStatusFilter) || 'all'
    if (PORTAL_STATUS_OPTIONS.some((o) => o.value === urlStatus)) {
      setStatus(urlStatus)
      setDraftStatus(urlStatus)
    }
  }, [searchParams])

  const goToPage = (p: number, nextStatus?: PortalStatusFilter) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    const s = nextStatus ?? status
    if (s && s !== 'all') params.set('status', s)
    else params.delete('status')
    router.push(`/events?${params.toString()}`)
  }

  const handleTabChange = (tab: EventsTab) => {
    setActiveTab(tab)
    goToPage(1)
  }

  const handleStatusChange = (next: PortalStatusFilter) => {
    setStatus(next)
    setDraftStatus(next)
    goToPage(1, next)
  }

  const countForStatus = (value: PortalStatusFilter) => {
    if (value === 'open') return statusCounts.open
    if (value === 'live') return statusCounts.live
    if (value === 'completed') return statusCounts.completed
    if (value === 'closed') return statusCounts.closed
    return statusCounts.all
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 md:h-[100dvh] md:overflow-hidden">
      <EventsPortalHeader />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-x-hidden px-4 py-4 sm:px-6 md:min-h-0 md:py-5 lg:px-8">
        {/*
          Single-mount layout (avoid rendering center content 3x — breaks framer-motion layoutId
          and causes tab label “ghosting” / override).
          Mobile: normal document scroll.
          md+: each column scrolls independently within the viewport.
        */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:min-h-0 md:flex-1 md:grid-cols-[280px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          {/* Left ads — Disha → Shortlisted → Lakshya */}
          <aside className="hidden min-h-0 w-full overflow-y-auto overscroll-y-contain pe-1 md:block">
            <div className="flex flex-col gap-6 pb-4">
              {leftAds.map((ad) => (
                <EventsPortalAdCard
                  key={ad.id}
                  ad={ad}
                  variant="right"
                  className="w-full"
                />
              ))}
            </div>
          </aside>

          {/* Center — mounted once */}
          <main className="flex min-w-0 flex-col gap-6 pb-4 md:min-h-0 md:overflow-y-auto md:overscroll-y-contain md:pe-1">
            {/* Desktop filters */}
            <div className="hidden lg:block">
              <EventsFilterSidebar
                status={status}
                onStatusChange={handleStatusChange}
                statusCounts={statusCounts}
                className="w-full"
              />
            </div>

            {/* Mobile filter button */}
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {!loading && pagination.total_count > 0
                  ? `${pagination.total_count} contests`
                  : 'Contests'}
              </p>
              <MobileFilterBottomSheet
                open={filterSheetOpen}
                onOpenChange={(open) => {
                  if (open) setDraftStatus(status)
                  setFilterSheetOpen(open)
                }}
                activeCount={activeFilterCount}
                onClear={() => {
                  setDraftStatus('all')
                  handleStatusChange('all')
                  setFilterSheetOpen(false)
                }}
                onApply={() => handleStatusChange(draftStatus)}
              >
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Contest Status
                  </h3>
                  <div className="flex flex-col gap-2">
                    {PORTAL_STATUS_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors',
                          draftStatus === opt.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'border-gray-200 text-gray-700 dark:border-white/10 dark:text-gray-300'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="portal_status_sheet"
                            checked={draftStatus === opt.value}
                            onChange={() => setDraftStatus(opt.value)}
                            className="accent-primary-500"
                          />
                          {opt.label}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {countForStatus(opt.value)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </MobileFilterBottomSheet>
            </div>

            <div className="min-w-0 rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/60 sm:p-5">
              <EventsContentTabs
                activeTab={activeTab}
                onChange={handleTabChange}
                onSubmitEventRequest={() => {
                  document
                    .getElementById('create-event-request')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              />
              {!loading && pagination.total_count > 0 && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Showing {events.length} of {pagination.total_count} contests
                </p>
              )}
            </div>

            <div className="w-full">
              {loading ? (
                <ContestCardSkeleton count={4} />
              ) : events.length === 0 ? (
                <EventsEmptyState />
              ) : (
                <div className="flex w-full flex-col gap-5">
                  {events.map((event) => (
                    <ContestCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>

            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev}
                  onClick={() => goToPage(page - 1)}
                  className="rounded-xl"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>
                {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                  const p = i + 1
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(p)}
                      className={cn(
                        'min-w-[40px] rounded-xl',
                        p === page &&
                          'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600'
                      )}
                    >
                      {p}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next}
                  onClick={() => goToPage(page + 1)}
                  className="rounded-xl"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile: ads then create-event below content */}
            <div className="flex flex-col gap-6 md:hidden">
              {leftAds.map((ad) => (
                <EventsPortalAdCard
                  key={ad.id}
                  ad={ad}
                  variant="right"
                  className="w-full"
                />
              ))}
              <div id="create-event-request" className="scroll-mt-20">
                <EventsCreateEventPanel />
              </div>
            </div>

            {/* Tablet: create-event under main (xl has dedicated right column) */}
            <div className="hidden md:block xl:hidden">
              <EventsCreateEventPanel />
            </div>
          </main>

          {/* Right — Create an Event (desktop xl): fill column height */}
          <aside className="hidden h-full min-h-0 w-full xl:flex xl:flex-col">
            <EventsCreateEventPanel fillHeight className="h-full min-h-0" />
          </aside>
        </div>
      </div>

      {/* Full footer only on mobile — desktop uses column scroll within the viewport */}
      <div className="md:hidden">
        <Footer />
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
          <EventsPortalHeader />
          <div className="flex flex-grow items-center justify-center p-8">
            <ContestCardSkeleton count={2} />
          </div>
        </div>
      }
    >
      <EventsPageContent />
    </Suspense>
  )
}
