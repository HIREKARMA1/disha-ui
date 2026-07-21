"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Footer } from '@/components/ui/footer'
import { Button } from '@/components/ui/button'
import { EventsPortalHeader } from '@/components/events/portal/EventsPortalHeader'
import { EventsFilterSidebar, type StatusCounts } from '@/components/events/portal/EventsFilterSidebar'
import { EventsContentTabs, type EventsTab } from '@/components/events/portal/EventsContentTabs'
import { ContestCard } from '@/components/events/EventCard'
import { ContestCardSkeleton } from '@/components/events/portal/ContestCardSkeleton'
import { EventsEmptyState } from '@/components/events/portal/EventsEmptyState'
import { EventsAdSidebar, EventsPortalAdCard } from '@/components/events/portal/EventsAdSidebar'
import { contestEventService } from '@/services/contestEventService'
import { advertisementService } from '@/services/advertisementService'
import type { ContestEventListItem } from '@/types/contestEvent'
import type { Advertisement } from '@/types/advertisement'
import type { PortalStatusFilter } from '@/lib/eventsPortalConfig'
import { cn } from '@/lib/utils'

/** One active ad per placement — lowest display_order wins (API already sorts). */
function pickAdForPlacement(ads: Advertisement[], placement: 'left_sidebar' | 'right_sidebar'): Advertisement | null {
  return ads.find((a) => a.placement === placement) ?? null
}

function EventsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<ContestEventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ads, setAds] = useState<Advertisement[]>([])
  const [activeTab, setActiveTab] = useState<EventsTab>('all')
  const [status, setStatus] = useState<PortalStatusFilter>('all')
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ all: 0, live: 0, closed: 0 })
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false,
  })

  const page = parseInt(searchParams.get('page') || '1', 10)

  const leftAd = useMemo(() => pickAdForPlacement(ads, 'left_sidebar'), [ads])
  const rightAd = useMemo(() => pickAdForPlacement(ads, 'right_sidebar'), [ads])

  const fetchStatusCounts = useCallback(async () => {
    const registeredOnly = activeTab === 'registered'
    try {
      const [allRes, liveRes, closedRes] = await Promise.all([
        contestEventService.listPublicEvents({ limit: 1, page: 1, registered_only: registeredOnly }),
        contestEventService.listPublicEvents({
          limit: 1,
          page: 1,
          status: 'live',
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
        live: liveRes.total_count,
        closed: closedRes.total_count,
      })
    } catch {
      setStatusCounts({ all: 0, live: 0, closed: 0 })
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

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/events?${params.toString()}`)
  }

  const handleTabChange = (tab: EventsTab) => {
    setActiveTab(tab)
    goToPage(1)
  }

  const handleStatusChange = (next: PortalStatusFilter) => {
    setStatus(next)
    goToPage(1)
  }

  const centerContent = (
    <div className="flex min-w-0 flex-col gap-6">
      <EventsFilterSidebar
        status={status}
        onStatusChange={handleStatusChange}
        statusCounts={statusCounts}
        className="w-full"
      />

      <div className="min-w-0 rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-900/60 sm:p-5">
        <EventsContentTabs activeTab={activeTab} onChange={handleTabChange} />
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
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <EventsPortalHeader />

      <div className="mx-auto w-full max-w-[1600px] flex-grow px-4 py-6 sm:px-6 lg:px-8">
        {/* Desktop: fixed left ad | scrollable center events | fixed right ad */}
        <div className="hidden xl:grid xl:grid-cols-[320px_minmax(0,1fr)_320px] xl:items-start xl:gap-8">
          <aside className="sticky top-20 w-full self-start">
            {leftAd ? <EventsPortalAdCard ad={leftAd} variant="left" /> : null}
          </aside>

          <main className="min-w-0">{centerContent}</main>

          <aside className="sticky top-20 w-full self-start">
            {rightAd ? <EventsPortalAdCard ad={rightAd} variant="right" /> : null}
          </aside>
        </div>

        {/* Tablet */}
        <div className="hidden md:grid md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:gap-8 xl:hidden">
          <aside className="sticky top-20 flex w-full flex-col gap-6 self-start">
            {leftAd ? <EventsPortalAdCard ad={leftAd} variant="left" className="h-[480px]" /> : null}
            {rightAd && rightAd.id !== leftAd?.id ? (
              <EventsAdSidebar ad={rightAd} variant="right" className="w-full" />
            ) : null}
          </aside>
          <main className="min-w-0">{centerContent}</main>
        </div>

        {/* Mobile: events first, ads below */}
        <div className="flex flex-col gap-6 md:hidden">
          {centerContent}
          <div className="flex flex-col gap-6">
            {leftAd ? (
              <EventsPortalAdCard ad={leftAd} variant="left" className="h-auto min-h-[420px]" />
            ) : null}
            {rightAd && rightAd.id !== leftAd?.id ? (
              <EventsPortalAdCard ad={rightAd} variant="right" className="h-auto min-h-[420px]" />
            ) : null}
          </div>
        </div>
      </div>

      <Footer />
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
